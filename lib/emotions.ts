export type EmotionId =
  | "empathetic"
  | "reassuring"
  | "confident"
  | "excited"
  | "urgent"
  | "calm";

export interface Emotion {
  id: EmotionId;
  label: string;
  blurb: string;
  /** Fish Audio S2 inline instruction, prepended to the text. */
  tag: string;
}

export const EMOTIONS: Emotion[] = [
  { id: "empathetic", label: "Empathetic", blurb: "Warm, soft, genuinely caring", tag: "[warm, soft, empathetic, sincere]" },
  { id: "reassuring", label: "Reassuring", blurb: "Steady and comforting", tag: "[gentle, reassuring, steady]" },
  { id: "confident", label: "Confident", blurb: "Clear, firm, authoritative", tag: "[confident, clear, assured]" },
  { id: "excited", label: "Excited", blurb: "Bright, energetic, upbeat", tag: "[excited, joyful, energetic]" },
  { id: "urgent", label: "Urgent", blurb: "Fast, serious, time-critical", tag: "[urgent, serious, fast-paced]" },
  { id: "calm", label: "Calm", blurb: "Slow, relaxed, even", tag: "[calm, slow, relaxed]" },
];

export const EXAMPLES = [
  { title: "Condolence", text: "I heard about your loss, and I'm so sorry. Please know I'm here for anything you need, today or any day after." },
  { title: "Launch day", text: "We did it! The product is live, the first customers are signing up, and it's all because of this team." },
  { title: "Service outage", text: "Our checkout is currently down. Please pause all orders and check the status page for updates." },
  { title: "Patient update", text: "Your results are back, and everything looks fine. There's nothing to worry about, and we'll go through it together." },
];
