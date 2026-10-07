export type TranscriptionSegment = { text: string; startMs: number; endMs: number; confidence?: number };
export type TranscriptionResult = { text: string; language?: string; durationMs?: number; segments: TranscriptionSegment[] };
export interface SpeechToTextProvider {
  readonly id: string;
  transcribe(input: { wav: Buffer; language?: string }): Promise<TranscriptionResult>;
}
export interface TextToSpeechProvider {
  readonly id: string;
  synthesize(input: { text: string; voice: string; speed?: number }): Promise<{ wav: Buffer; contentType: "audio/wav" }>;
}
