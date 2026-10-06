import "server-only";

import { transcribe } from "ai";

export const DEFAULT_TRANSCRIPTION_MODEL = "openai/gpt-4o-mini-transcribe";

export async function transcribeFieldNote(audio: Uint8Array) {
  const result = await transcribe({
    model: process.env.AI_GATEWAY_TRANSCRIPTION_MODEL || DEFAULT_TRANSCRIPTION_MODEL,
    audio,
    abortSignal: AbortSignal.timeout(60_000),
  });

  return result.text.trim();
}
