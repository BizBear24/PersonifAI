"use client";

import { useEffect, useRef, useState } from "react";
import { EMOTIONS, EXAMPLES, type EmotionId } from "@/lib/emotions";

interface Take {
  id: number;
  emotion: EmotionId;
  text: string;
  url: string | null;
  error: string | null;
  loading: boolean;
}

const MAX_CHARS = 1000;

export default function Home() {
  const [text, setText] = useState(EXAMPLES[0].text);
  const [emotion, setEmotion] = useState<EmotionId>("empathetic");
  const [voiceId, setVoiceId] = useState("");
  const [takes, setTakes] = useState<Take[]>([]);
  const nextId = useRef(1);
  const urls = useRef<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("tonecraft.voiceId");
      if (saved) setVoiceId(saved);
    } catch {}
    const all = urls.current;
    return () => all.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  const busy = takes.some((t) => t.loading);
  const trimmed = text.trim();

  function update(id: number, patch: Partial<Take>) {
    setTakes((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  async function generate() {
    if (!trimmed || busy) return;
    const id = nextId.current++;
    const snapshot = { emotion, text: trimmed };
    setTakes((prev) => [{ id, ...snapshot, url: null, error: null, loading: true }, ...prev]);
    try {
      localStorage.setItem("tonecraft.voiceId", voiceId);
    } catch {}
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...snapshot, voiceId: voiceId.trim() || undefined }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `Request failed (${res.status}).`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      urls.current.push(url);
      update(id, { url, loading: false });
    } catch (e) {
      update(id, { error: e instanceof Error ? e.message : "Something went wrong.", loading: false });
    }
  }

  const label = (id: EmotionId) => EMOTIONS.find((e) => e.id === id)!.label;

  return (
    <main className="mx-auto max-w-5xl px-5 py-8 sm:py-12">
      <header className="mb-10">
        <div className="flex items-center gap-2 text-sm font-medium tracking-wide text-accent">
          <span className="inline-block size-2 rounded-full bg-accent" /> ToneCraft
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          Give your words the right emotion.
        </h1>
        <p className="mt-3 max-w-xl text-mute">
          Write the message, pick the delivery, and hear exactly how it lands. Generate another take
          with a different emotion to compare.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <section className="space-y-6">
          <div>
            <div className="mb-2 flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.title}
                  onClick={() => setText(ex.text)}
                  className="rounded-full border border-line px-3 py-1 text-xs text-mute transition hover:border-accent hover:text-accent"
                >
                  {ex.title}
                </button>
              ))}
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
              rows={7}
              placeholder="Type the message you want to be heard…"
              className="w-full resize-none rounded-xl border border-line bg-panel p-4 text-lg leading-relaxed outline-none transition placeholder:text-mute/60 focus:border-accent"
            />
            <div className="mt-1 text-right text-xs text-mute">
              {text.length}/{MAX_CHARS}
            </div>
          </div>

          <div>
            <h2 className="mb-2 text-sm font-medium text-mute">Delivery</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {EMOTIONS.map((em) => {
                const on = em.id === emotion;
                return (
                  <button
                    key={em.id}
                    onClick={() => setEmotion(em.id)}
                    aria-pressed={on}
                    className={`rounded-xl border p-3 text-left transition ${
                      on ? "border-accent bg-accent/10" : "border-line bg-panel hover:border-mute"
                    }`}
                  >
                    <div className={`text-sm font-medium ${on ? "text-accent" : ""}`}>{em.label}</div>
                    <div className="mt-0.5 text-xs text-mute">{em.blurb}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="voice" className="mb-2 block text-sm font-medium text-mute">
              Voice ID <span className="font-normal">(optional — overrides server default)</span>
            </label>
            <input
              id="voice"
              value={voiceId}
              onChange={(e) => setVoiceId(e.target.value)}
              placeholder="Fish Audio reference ID"
              className="w-full rounded-lg border border-line bg-panel px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>

          <button
            onClick={generate}
            disabled={!trimmed || busy}
            className="w-full rounded-xl bg-accent py-3.5 font-semibold text-ink transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? "Generating…" : takes.length ? `Generate another take as ${label(emotion)}` : `Generate as ${label(emotion)}`}
          </button>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-medium text-mute">Takes</h2>
          {takes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-mute">
              Your generated audio appears here. Try the same message in two emotions.
            </div>
          ) : (
            <ul className="space-y-3">
              {takes.map((t) => (
                <li key={t.id} className="rounded-xl border border-line bg-panel p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                      {label(t.emotion)}
                    </span>
                    <span className="truncate text-xs text-mute">{t.text}</span>
                  </div>
                  {t.loading && (
                    <div role="status" className="flex items-center gap-3 py-3 text-sm text-mute">
                      <span className="size-4 animate-spin rounded-full border-2 border-line border-t-accent" />
                      Generating speech…
                    </div>
                  )}
                  {t.error && (
                    <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                      {t.error}
                    </div>
                  )}
                  {t.url && <audio controls preload="auto" src={t.url} />}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <footer className="mt-16 text-xs text-mute">Speech by Fish Audio.</footer>
    </main>
  );
}
