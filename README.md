# ToneCraft

**Give your words the right emotion.**

ToneCraft transforms written messages into expressive speech using Fish Audio. Choose a delivery style, generate audio, and compare how the same message sounds with different emotions.

## Features

- Character gallery with 3 editable demos (NOIR, FOUNDER ZERO, LINGUA), custom characters, chat via Groq (Llama 3.3), and a Speak button per reply; data is stored in localStorage
- Studio page (`/studio`): six emotional delivery presets (Empathetic, Reassuring, Confident, Excited, Urgent, Calm)
- Real Fish Audio text-to-speech generation (emotion sent as inline instruction tags)
- Audio playback and side-by-side take comparison
- Responsive dark interface

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and set:
   - `FISH_API_KEY` — your API key
   - `FISH_VOICE_ID` — a voice/reference ID (optional; Fish Audio's default voice is used if empty, and the UI can override it)
   - `FISH_MODEL` — a model available to your account (e.g. `s2.1-pro-free`)
   - `GROQ_API_KEY` — free key from console.groq.com (powers character chat)
   - `LLM_MODEL` — optional; defaults to `llama-3.3-70b-versatile`
3. `npm run dev` and open http://localhost:3000

## Deployment

Deploy to Vercel and add the same environment variables in project settings. Never commit API keys.

## Built with

TypeScript, Next.js (App Router), Tailwind CSS, Fish Audio.

## Elevator pitch

ToneCraft turns written messages into expressive speech. Pick the emotion, generate the voice, and hear the difference.
