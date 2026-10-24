"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { clearChat, loadCharacters, loadChat, newId, saveChat, type Character, type ChatMessage } from "@/lib/characters";

export default function Chat() {
  const { id } = useParams<{ id: string }>();
  const [char, setChar] = useState<Character | null | undefined>(undefined);
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState<string | null>(null);
  const [voiceErr, setVoiceErr] = useState<Record<string, string>>({});
  const loaded = useRef(false);
  const bottom = useRef<HTMLDivElement>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const cache = useRef<Record<string, string>>({});

  useEffect(() => {
    const found = loadCharacters().find((c) => c.id === id) ?? null;
    setChar(found);
    if (found) {
      const saved = loadChat(id);
      setMsgs(saved.length || !found.greeting ? saved : [{ id: newId(), role: "assistant", content: found.greeting }]);
    }
    loaded.current = true;
    const urls = cache.current;
    return () => {
      audio.current?.pause();
      Object.values(urls).forEach((u) => URL.revokeObjectURL(u));
    };
  }, [id]);

  useEffect(() => {
    if (loaded.current && char) saveChat(id, msgs);
    bottom.current?.scrollIntoView({ block: "end" });
  }, [msgs, sending, id, char]);

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || sending || !char) return;
    const next = [...msgs, { id: newId(), role: "user" as const, content: text }];
    setMsgs(next);
    setInput("");
    setError(null);
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: char.name,
          description: char.description,
          backstory: char.backstory,
          messages: next.map(({ role, content }) => ({ role, content })),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || `Request failed (${res.status}).`);
      setMsgs((p) => [...p, { id: newId(), role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSending(false);
    }
  }

  async function speak(m: ChatMessage) {
    if (!char) return;
    audio.current?.pause();
    if (speaking === m.id) return setSpeaking(null);
    setVoiceErr((p) => ({ ...p, [m.id]: "" }));
    setSpeaking(m.id);
    try {
      let url = cache.current[m.id];
      if (!url) {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: m.content, style: char.voiceStyle, voiceId: char.voiceId || undefined }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || `Voice failed (${res.status}).`);
        }
        url = URL.createObjectURL(await res.blob());
        cache.current[m.id] = url;
      }
      const a = new Audio(url);
      audio.current = a;
      a.onended = () => setSpeaking((s) => (s === m.id ? null : s));
      await a.play();
    } catch (err) {
      setVoiceErr((p) => ({ ...p, [m.id]: err instanceof Error ? err.message : "Voice unavailable." }));
      setSpeaking(null);
    }
  }

  if (char === undefined) return <main className="p-10 font-mono text-xs uppercase tracking-widest text-mute">Connecting…</main>;
  if (char === null)
    return (
      <main className="mx-auto max-w-xl px-5 py-16 text-center">
        <p className="text-mute">Character not found.</p>
        <Link href="/" className="mt-4 inline-block text-accent">← Back to gallery</Link>
      </main>
    );

  return (
    <main className="mx-auto flex h-[calc(100dvh-53px)] max-w-3xl flex-col px-4">
      <header className="flex items-center justify-between gap-3 border-b border-line py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="font-mono text-xs uppercase tracking-widest text-mute transition hover:text-accent">← Gallery</Link>
          <div className="flex size-9 shrink-0 items-center justify-center border border-accent/60 bg-accent/10 font-mono font-bold text-accent">
            {char.name.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="truncate font-semibold leading-tight">{char.name}</div>
            <div className="truncate text-xs text-mute">{char.description}</div>
          </div>
        </div>
        <div className="flex shrink-0 gap-2 font-mono text-[10px] uppercase tracking-widest">
          <Link href={`/edit/${char.id}`} className="border border-line px-2.5 py-1.5 text-mute transition hover:border-accent hover:text-accent">Edit</Link>
          <button
            onClick={() => {
              if (!confirm("Clear this conversation?")) return;
              clearChat(id);
              setMsgs(char.greeting ? [{ id: newId(), role: "assistant", content: char.greeting }] : []);
              setError(null);
            }}
            className="border border-line px-2.5 py-1.5 text-mute transition hover:border-accent hover:text-accent"
          >
            Clear
          </button>
        </div>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto py-5">
        {msgs.length === 0 && (
          <div className="border border-dashed border-line p-8 text-center text-sm text-mute">
            Say something to {char.name} to begin.
          </div>
        )}
        {msgs.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] border px-4 py-3 text-[15px] leading-relaxed ${m.role === "user" ? "border-accent/50 bg-accent/10" : "border-line bg-panel"}`}>
              {m.role === "assistant" && (
                <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.25em] text-accent">{char.name}</div>
              )}
              <p className="whitespace-pre-wrap">{m.content}</p>
              {m.role === "assistant" && (
                <div className="mt-2">
                  <button
                    onClick={() => speak(m)}
                    className={`border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest transition ${speaking === m.id ? "border-accent bg-accent text-ink" : "border-line text-mute hover:border-accent hover:text-accent"}`}
                  >
                    {speaking === m.id ? (cache.current[m.id] ? "■ Stop" : "Generating…") : "▶ Speak"}
                  </button>
                  {voiceErr[m.id] && <p role="alert" className="mt-2 text-xs text-red-400">{voiceErr[m.id]}</p>}
                </div>
              )}
            </div>
          </div>
        ))}
        {sending && (
          <div role="status" className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-mute">
            <span className="size-3 animate-spin rounded-full border-2 border-line border-t-accent" /> {char.name} is responding
          </div>
        )}
        {error && <div role="alert" className="border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}
        <div ref={bottom} />
      </div>

      <form onSubmit={send} className="flex gap-2 border-t border-line py-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Message ${char.name}…`}
          maxLength={1000}
          className="flex-1 border border-line bg-panel px-4 py-3 text-sm outline-none transition focus:border-accent"
        />
        <button disabled={!input.trim() || sending} className="bg-accent px-5 font-mono text-xs font-bold uppercase tracking-widest text-ink transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40">
          Send
        </button>
      </form>
    </main>
  );
}
