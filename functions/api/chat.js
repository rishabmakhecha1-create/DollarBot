import { CLOUDFLARE_MODEL, MAX_HISTORY_MESSAGES, exampleMessages, systemPrompt } from "../../dollarbot-config.mjs";

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

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

async function verifyTurnstileToken(context, token) {
  const secret = context.env?.TURNSTILE_SECRET_KEY;

  if (!secret || !context.env?.TURNSTILE_SITE_KEY) {
    return {
      ok: false,
      status: 503,
      code: "turnstile_not_configured",
      message: "Bot protection is not configured yet. Add Turnstile keys before using live AI."
    };
  }

  if (!token) {
    return {
      ok: false,
      status: 400,
      code: "turnstile_token_missing",
      message: "Complete the Turnstile security check before sending a live AI message."
    };
  }

  const formData = new URLSearchParams();
  formData.set("secret", secret);
  formData.set("response", token);

  const ipAddress = context.request.headers.get("CF-Connecting-IP") || context.request.headers.get("x-forwarded-for");

  if (ipAddress) {
    formData.set("remoteip", ipAddress.split(",")[0].trim());
  }

  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: formData.toString()
  });

  if (!response.ok) {
    return {
      ok: false,
      status: 503,
      code: "turnstile_verify_failed",
      message: "Bot protection could not be verified right now."
    };
  }

  const payload = await response.json();

  if (!payload.success) {
    return {
      ok: false,
      status: 400,
      code: "turnstile_invalid",
      message: "Security check failed or expired. Complete it again and retry."
    };
  }

  return {
    ok: true
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
    const turnstileResult = await verifyTurnstileToken(context, body.turnstileToken?.trim());

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

    if (!turnstileResult.ok) {
      return json(
        {
          error: {
            code: turnstileResult.code,
            message: turnstileResult.message
          }
        },
        turnstileResult.status
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
