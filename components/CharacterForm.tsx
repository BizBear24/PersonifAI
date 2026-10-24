"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { loadCharacters, newId, upsertCharacter, VOICE_STYLES, type Character } from "@/lib/characters";

const field = "w-full border border-line bg-panel px-3 py-2.5 text-sm outline-none transition focus:border-accent";
const lab = "mb-1.5 block font-mono text-[10px] uppercase tracking-[0.25em] text-mute";

export default function CharacterForm({ editId }: { editId?: string }) {
  const router = useRouter();
  const [ready, setReady] = useState(!editId);
  const [missing, setMissing] = useState(false);
  const [c, setC] = useState<Character>({
    id: newId(),
    name: "",
    description: "",
    backstory: "",
    voiceStyle: "default",
    voiceId: "",
  });

  useEffect(() => {
    if (!editId) return;
    const found = loadCharacters().find((x) => x.id === editId);
    if (found) setC(found);
    else setMissing(true);
    setReady(true);
  }, [editId]);

  const set = <K extends keyof Character>(k: K, v: Character[K]) => setC((p) => ({ ...p, [k]: v }));
  const valid = c.name.trim() && c.description.trim();

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    upsertCharacter({ ...c, name: c.name.trim(), description: c.description.trim(), backstory: c.backstory.trim(), voiceId: c.voiceId.trim() });
    router.push(`/c/${c.id}`);
  }

  if (!ready) return <main className="p-10 font-mono text-xs uppercase tracking-widest text-mute">Loading…</main>;
  if (missing)
    return (
      <main className="mx-auto max-w-xl px-5 py-16 text-center">
        <p className="text-mute">Character not found.</p>
        <Link href="/" className="mt-4 inline-block text-accent">← Back to gallery</Link>
      </main>
    );

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <Link href="/" className="font-mono text-xs uppercase tracking-widest text-mute transition hover:text-accent">← Gallery</Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">{editId ? "Edit character" : "Create character"}</h1>
      <form onSubmit={save} className="corner mt-6 space-y-5 border border-line bg-panel/60 p-5">
        <div>
          <label className={lab} htmlFor="name">Name</label>
          <input id="name" className={field} maxLength={40} value={c.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Captain Vex" />
        </div>
        <div>
          <label className={lab} htmlFor="desc">Short description / personality</label>
          <textarea id="desc" rows={2} className={`${field} resize-none`} maxLength={300} value={c.description} onChange={(e) => set("description", e.target.value)} placeholder="Sarcastic starship pilot with a soft spot for strays." />
        </div>
        <div>
          <label className={lab} htmlFor="story">Backstory & behavior</label>
          <textarea id="story" rows={5} className={`${field} resize-none`} maxLength={1200} value={c.backstory} onChange={(e) => set("backstory", e.target.value)} placeholder="Where they come from, how they speak, what they want." />
        </div>
        <div>
          <span className={lab}>Voice</span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {VOICE_STYLES.map((v) => (
              <button
                type="button"
                key={v.id}
                aria-pressed={c.voiceStyle === v.id}
                onClick={() => set("voiceStyle", v.id)}
                className={`border px-3 py-2.5 text-left text-sm transition ${c.voiceStyle === v.id ? "border-accent bg-accent/10 text-accent" : "border-line text-mute hover:border-mute"}`}
              >
                {v.label}
              </button>
            ))}
          </div>
          <input className={`${field} mt-2`} value={c.voiceId} onChange={(e) => set("voiceId", e.target.value)} placeholder="Fish Audio voice ID (optional, uses server default)" />
        </div>
        <button disabled={!valid} className="w-full bg-accent py-3 font-mono text-xs font-bold uppercase tracking-widest text-ink transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40">
          {editId ? "Save changes" : "Create & start chat"}
        </button>
      </form>
    </main>
  );
}
