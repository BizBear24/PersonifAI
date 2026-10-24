"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadCharacters, removeCharacter, VOICE_STYLES, type Character } from "@/lib/characters";

export default function Gallery() {
  const [chars, setChars] = useState<Character[] | null>(null);

  useEffect(() => setChars(loadCharacters()), []);

  function remove(id: string) {
    if (!confirm("Delete this character and its conversation?")) return;
    removeCharacter(id);
    setChars(loadCharacters());
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
      <header className="mb-10 max-w-2xl">
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-accent">// Character platform</div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
          Characters that <span className="text-accent">talk back.</span>
        </h1>
        <p className="mt-4 text-mute">
          Create an AI character, chat in its voice and personality, and hear every reply spoken aloud.
        </p>
      </header>

      {chars === null ? (
        <div className="font-mono text-xs uppercase tracking-widest text-mute">Loading roster…</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {chars.map((c, i) => (
            <article key={c.id} className="corner glow group flex flex-col border border-line bg-panel p-5 transition">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-mute">
                <span>ID-{String(i + 1).padStart(2, "0")}</span>
                <span className="text-accent">{c.demo ? "Demo" : "Custom"}</span>
              </div>
              <div className="mt-6 flex size-14 items-center justify-center border border-accent/60 bg-accent/10 font-mono text-xl font-bold text-accent">
                {c.name.slice(0, 1).toUpperCase()}
              </div>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight">{c.name}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-mute">{c.description}</p>
              <div className="mt-4 font-mono text-[10px] uppercase tracking-widest text-mute">
                Voice · {VOICE_STYLES.find((v) => v.id === c.voiceStyle)?.label ?? "Neutral"}
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Link href={`/c/${c.id}`} className="flex-1 bg-accent py-2.5 text-center font-mono text-xs font-bold uppercase tracking-widest text-ink transition hover:brightness-110">
                  Chat
                </Link>
                <Link href={`/edit/${c.id}`} className="border border-line px-3 py-2.5 font-mono text-xs uppercase tracking-widest text-mute transition hover:border-accent hover:text-accent">
                  Edit
                </Link>
                <button onClick={() => remove(c.id)} aria-label={`Delete ${c.name}`} className="border border-line px-3 py-2.5 font-mono text-xs text-mute transition hover:border-accent hover:text-accent">
                  ✕
                </button>
              </div>
            </article>
          ))}
          <Link href="/create" className="glow flex min-h-64 flex-col items-center justify-center border border-dashed border-line p-5 text-mute transition hover:text-accent">
            <span className="text-4xl font-light">+</span>
            <span className="mt-2 font-mono text-xs uppercase tracking-widest">New character</span>
          </Link>
        </div>
      )}
      {chars?.length === 0 && <p className="mt-6 text-sm text-mute">Your roster is empty. Create your first character.</p>}
    </main>
  );
}
