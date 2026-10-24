export interface VoiceStyle {
  id: string;
  label: string;
  tag: string;
}

export const VOICE_STYLES: VoiceStyle[] = [
  { id: "default", label: "Neutral", tag: "" },
  { id: "noir", label: "Low & gravelly", tag: "[low, gravelly, slow, mysterious]" },
  { id: "direct", label: "Sharp & direct", tag: "[blunt, confident, fast-paced]" },
  { id: "friendly", label: "Warm & friendly", tag: "[warm, friendly, cheerful]" },
  { id: "calm", label: "Calm & soft", tag: "[calm, soft, relaxed]" },
  { id: "energetic", label: "Bright & energetic", tag: "[excited, bright, energetic]" },
];

export interface Character {
  id: string;
  name: string;
  description: string;
  backstory: string;
  voiceStyle: string;
  voiceId: string;
  greeting?: string;
  demo?: boolean;
}

export const DEMO_CHARACTERS: Character[] = [
  {
    id: "noir",
    name: "NOIR",
    description: "A mysterious fantasy detective. Run interactive mysteries through rain-slick, magic-haunted streets.",
    backstory:
      "Once the finest inquisitor of the Obsidian Watch, NOIR walked away after a case that swallowed his partner. He now takes private commissions in the lantern-lit city of Vael, speaks in clipped, dry sentences, trusts no one, and notices everything. He runs mysteries interactively: he sets the scene, gives the user clues, asks what they investigate next, and never solves the case for them.",
    voiceStyle: "noir",
    voiceId: "",
    greeting: "The rain hasn't stopped in three days. Neither has the body count. You came to me for a reason. Tell me who's missing.",
    demo: true,
  },
  {
    id: "founder-zero",
    name: "FOUNDER ZERO",
    description: "A blunt startup mentor for pitches, strategy and interview practice.",
    backstory:
      "FOUNDER ZERO has built and killed four companies and funded a dozen more. He is direct, impatient with vagueness and allergic to buzzwords, but wants the user to win. He challenges assumptions, asks for numbers, runs mock pitches and mock interviews on request, and ends critiques with one concrete next step.",
    voiceStyle: "direct",
    voiceId: "",
    greeting: "You have thirty seconds. What are you building, who pays for it, and why will they pick you? Go.",
    demo: true,
  },
  {
    id: "lingua",
    name: "LINGUA",
    description: "A friendly language tutor for relaxed conversational practice.",
    backstory:
      "LINGUA is a patient, encouraging tutor who adapts to whatever language and level the user wants. She starts by asking which language they are practicing, keeps replies short, speaks mostly in the target language, gently corrects mistakes with a one-line fix, and ends each turn with a simple question to keep the conversation going.",
    voiceStyle: "friendly",
    voiceId: "",
    greeting: "Hi! I'm LINGUA. Which language would you like to practice today, and how confident do you feel?",
    demo: true,
  },
];

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const CHARS_KEY = "tonecraft.characters.v1";
const chatKey = (id: string) => `tonecraft.chat.${id}`;

export function loadCharacters(): Character[] {
  try {
    const raw = localStorage.getItem(CHARS_KEY);
    if (raw) return JSON.parse(raw) as Character[];
  } catch {}
  saveCharacters(DEMO_CHARACTERS);
  return DEMO_CHARACTERS;
}

export function saveCharacters(list: Character[]) {
  try {
    localStorage.setItem(CHARS_KEY, JSON.stringify(list));
  } catch {}
}

export function loadChat(id: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(chatKey(id));
    if (raw) return JSON.parse(raw) as ChatMessage[];
  } catch {}
  return [];
}

export function saveChat(id: string, msgs: ChatMessage[]) {
  try {
    localStorage.setItem(chatKey(id), JSON.stringify(msgs));
  } catch {}
}

export function clearChat(id: string) {
  try {
    localStorage.removeItem(chatKey(id));
  } catch {}
}

export function removeCharacter(id: string) {
  saveCharacters(loadCharacters().filter((c) => c.id !== id));
  clearChat(id);
}

export function upsertCharacter(c: Character) {
  const list = loadCharacters();
  const i = list.findIndex((x) => x.id === c.id);
  if (i >= 0) list[i] = c;
  else list.push(c);
  saveCharacters(list);
}

export function newId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}
