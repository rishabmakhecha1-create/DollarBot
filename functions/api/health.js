import { CLOUDFLARE_MODEL } from "../../dollarbot-config.mjs";

export async function onRequestGet(context) {
  const turnstileConfigured = Boolean(context.env?.TURNSTILE_SITE_KEY && context.env?.TURNSTILE_SECRET_KEY);

  if (context.env?.AI) {
    return Response.json({
      ok: true,
      liveAiReady: true,
      provider: "cloudflare-workers-ai",
      model: CLOUDFLARE_MODEL,
      turnstileConfigured,
      turnstileSiteKey: context.env?.TURNSTILE_SITE_KEY || ""
    });
  }

  return Response.json({
    ok: true,
    liveAiReady: false,
    provider: "none",
    reason: "cloudflare_ai_binding_missing",
    turnstileConfigured,
    turnstileSiteKey: context.env?.TURNSTILE_SITE_KEY || ""
  });
}
