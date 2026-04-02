import { CLOUDFLARE_MODEL } from "../../dollarbot-config.mjs";

export async function onRequestGet(context) {
  if (context.env?.AI) {
    return Response.json({
      ok: true,
      liveAiReady: true,
      provider: "cloudflare-workers-ai",
      model: CLOUDFLARE_MODEL
    });
  }

  return Response.json({
    ok: true,
    liveAiReady: false,
    provider: "none",
    reason: "cloudflare_ai_binding_missing"
  });
}
