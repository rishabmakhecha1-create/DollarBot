import { CLOUDFLARE_MODEL, MAX_HISTORY_MESSAGES, exampleMessages, systemPrompt } from "../../dollarbot-config.mjs";

function json(payload, status = 200) {
  return Response.json(payload, { status });
}

function buildMessages(message, history) {
  const safeHistory = Array.isArray(history) ? history.slice(-MAX_HISTORY_MESSAGES) : [];
  const messages = [{ role: "system", content: systemPrompt }, ...exampleMessages];

  for (const entry of safeHistory) {
    if (!entry || typeof entry.text !== "string") {
      continue;
    }

    messages.push({
      role: entry.role === "assistant" ? "assistant" : "user",
      content: entry.text
    });
  }

  messages.push({ role: "user", content: message });
  return messages;
}

function extractReply(payload) {
  if (typeof payload === "string") {
    return payload.trim();
  }

  if (typeof payload?.response === "string") {
    return payload.response.trim();
  }

  if (typeof payload?.result?.response === "string") {
    return payload.result.response.trim();
  }

  return "";
}

function buildAiError(error) {
  const message = error instanceof Error ? error.message : "Cloudflare Workers AI request failed.";
  const status = typeof error?.status === "number" ? error.status : 503;
  const normalized = message.toLowerCase();

  if (normalized.includes("binding") || normalized.includes("context.env.ai")) {
    return {
      status: 503,
      code: "workers_ai_not_bound",
      message: "Cloudflare Workers AI is not configured for this environment yet."
    };
  }

  if (
    status === 429 ||
    normalized.includes("rate limit") ||
    normalized.includes("quota") ||
    normalized.includes("too many requests")
  ) {
    return {
      status: 429,
      code: "workers_ai_rate_limited",
      message: "Cloudflare live AI is temporarily out of free beta capacity. DollarBot can still fall back to built-in guidance."
    };
  }

  if (
    status >= 500 ||
    normalized.includes("upstream") ||
    normalized.includes("overloaded") ||
    normalized.includes("network")
  ) {
    return {
      status: 503,
      code: "workers_ai_unavailable",
      message: "Cloudflare live AI is temporarily unavailable right now."
    };
  }

  if (status === 400) {
    return {
      status: 400,
      code: "workers_ai_bad_request",
      message: "DollarBot sent an invalid chat request."
    };
  }

  return {
    status,
    code: "workers_ai_error",
    message: message || "Cloudflare live AI request failed."
  };
}

export async function onRequestPost(context) {
  if (!context.env?.AI) {
    return json(
      {
        error: {
          code: "workers_ai_not_bound",
          message: "Cloudflare Workers AI is not configured for this environment yet."
        }
      },
      503
    );
  }

  try {
    const body = await context.request.json();
    const message = body.message?.trim();

    if (!message) {
      return json(
        {
          error: {
            code: "message_required",
            message: "Message is required."
          }
        },
        400
      );
    }

    const aiResponse = await context.env.AI.run(CLOUDFLARE_MODEL, {
      messages: buildMessages(message, body.history),
      max_tokens: 220,
      temperature: 0.4
    });

    const reply = extractReply(aiResponse);

    if (!reply) {
      return json(
        {
          error: {
            code: "workers_ai_empty_response",
            message: "Cloudflare live AI returned an empty response."
          }
        },
        502
      );
    }

    return json({
      provider: "cloudflare-workers-ai",
      model: CLOUDFLARE_MODEL,
      reply
    });
  } catch (error) {
    const aiError = buildAiError(error);

    return json(
      {
        error: {
          code: aiError.code,
          message: aiError.message
        }
      },
      aiError.status
    );
  }
}
