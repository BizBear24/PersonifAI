import { EMOTIONS } from "@/lib/emotions";
import { VOICE_STYLES } from "@/lib/characters";

export const runtime = "nodejs";
export const maxDuration = 60;

const FISH_TTS_URL = "https://api.fish.audio/v1/tts";
const MAX_CHARS = 1000;

function jsonError(status: number, error: string) {
  return Response.json({ error }, { status });
}

export async function POST(req: Request) {
  const apiKey = process.env.FISH_API_KEY;
  const model = process.env.FISH_MODEL || "s2.1-pro-free";
  const defaultVoice = process.env.FISH_VOICE_ID;

  if (!apiKey) {
    return jsonError(
      500,
      "FISH_API_KEY is not configured. Add it to .env.local (or your host's environment variables) and restart.",
    );
  }

  let body: { text?: unknown; emotion?: unknown; style?: unknown; voiceId?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Invalid request body.");
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) return jsonError(400, "Enter a message to speak.");
  if (text.length > MAX_CHARS) return jsonError(400, `Message is too long (max ${MAX_CHARS} characters).`);

  const emotion = EMOTIONS.find((e) => e.id === body.emotion);
  const style = VOICE_STYLES.find((s) => s.id === body.style);
  if (!emotion && !style) return jsonError(400, "Unknown emotion or voice style.");
  const tag = emotion ? emotion.tag : style!.tag;

  const voiceId =
    (typeof body.voiceId === "string" && body.voiceId.trim()) || defaultVoice || undefined;

  const payload: Record<string, unknown> = {
    text: tag ? `${tag} ${text}` : text,
    format: "mp3",
  };
  if (voiceId) payload.reference_id = voiceId;

  let upstream: Response;
  try {
    upstream = await fetch(FISH_TTS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        model,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    return jsonError(502, "Could not reach Fish Audio. Check your connection and try again.");
  }

  if (!upstream.ok) {
    let detail = "";
    try {
      const raw = await upstream.text();
      try {
        const j = JSON.parse(raw);
        detail = j.message || j.error || j.detail || raw;
      } catch {
        detail = raw;
      }
    } catch {}
    const hint =
      upstream.status === 401
        ? "Fish Audio rejected the API key (check FISH_API_KEY)."
        : upstream.status === 402
          ? "Fish Audio reports insufficient credit."
          : upstream.status === 404 || upstream.status === 422
            ? "Fish Audio could not use that voice/model (check the voice ID and FISH_MODEL)."
            : upstream.status === 429
              ? "Fish Audio rate limit reached. Wait a moment and retry."
              : "Fish Audio returned an error.";
    return jsonError(upstream.status === 401 ? 502 : upstream.status, `${hint}${detail ? ` (${String(detail).slice(0, 200)})` : ""}`);
  }

  const contentType = upstream.headers.get("content-type") || "";
  if (!contentType.startsWith("audio/")) {
    return jsonError(502, "Fish Audio returned an unexpected response instead of audio.");
  }

  const audio = await upstream.arrayBuffer();
  if (audio.byteLength === 0) return jsonError(502, "Fish Audio returned empty audio.");

  return new Response(audio, {
    headers: { "Content-Type": contentType, "Cache-Control": "no-store" },
  });
}
