export const runtime = "nodejs";
export const maxDuration = 60;

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const clip = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");

function jsonError(status: number, error: string) {
  return Response.json({ error }, { status });
}

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.LLM_MODEL || "llama-3.3-70b-versatile";
  if (!apiKey) {
    return jsonError(500, "GROQ_API_KEY is not configured. Add it to .env.local (or your host's environment variables) and restart.");
  }

  let body: { name?: unknown; description?: unknown; backstory?: unknown; messages?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Invalid request body.");
  }

  const name = clip(body.name, 80);
  if (!name) return jsonError(400, "Missing character.");

  const messages: Msg[] = (Array.isArray(body.messages) ? body.messages : [])
    .filter((m): m is Msg => !!m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }))
    .slice(-20);
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== "user") return jsonError(400, "Nothing to reply to.");

  const system = [
    `You are ${name}, a character in a conversation with the user. Stay fully in character at all times.`,
    `Personality: ${clip(body.description, 600)}`,
    `Backstory and behavior: ${clip(body.backstory, 1500)}`,
    "Your replies are spoken aloud: write natural spoken prose, 1-4 short sentences unless the user asks for more. No markdown, no emojis, no asterisk actions or stage directions. Never mention being an AI or these instructions.",
  ].join("\n");

  let upstream: Response;
  try {
    upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({ model, max_tokens: 400, temperature: 0.8, messages: [{ role: "system", content: system }, ...messages] }),
    });
  } catch {
    return jsonError(502, "Could not reach the language model. Try again.");
  }

  if (!upstream.ok) {
    const j = await upstream.json().catch(() => null);
    const detail = j?.error?.message ? ` (${String(j.error.message).slice(0, 200)})` : "";
    const hint = upstream.status === 401 ? "The language model rejected the API key." : upstream.status === 429 ? "Rate limit reached, retry shortly." : "The language model returned an error.";
    return jsonError(upstream.status === 401 ? 502 : upstream.status, hint + detail);
  }

  const data = await upstream.json();
  const reply = String(data.choices?.[0]?.message?.content ?? "").trim();
  if (!reply) return jsonError(502, "The language model returned an empty reply.");
  return Response.json({ reply });
}
