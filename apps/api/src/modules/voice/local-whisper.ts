import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { SpeechToTextProvider, TranscriptionResult } from "./types.js";
import { runProcess } from "./local-process.js";

/** Runs a locally installed whisper.cpp binary. No audio leaves this machine. */
export class LocalWhisperProvider implements SpeechToTextProvider {
  readonly id = "local-whisper";
  constructor(private readonly binary: string, private readonly modelPath: string) {}
  async transcribe({ wav, language }: { wav: Buffer; language?: string }): Promise<TranscriptionResult> {
    const dir = await mkdtemp(join(tmpdir(), "callpilot-stt-"));
    const input = join(dir, "input.wav"); const output = join(dir, "result");
    try {
      await writeFile(input, wav);
      const args = ["-m", this.modelPath, "-f", input, "-oj", "-of", output];
      if (language) args.push("-l", language);
      await runProcess(this.binary, args);
      const raw = JSON.parse(await readFile(`${output}.json`, "utf8")) as { transcription?: Array<{ text?: string; offsets?: { from?: number; to?: number } }> };
      const segments = (raw.transcription ?? []).map((segment) => ({ text: segment.text?.trim() ?? "", startMs: segment.offsets?.from ?? 0, endMs: segment.offsets?.to ?? 0 }));
      return { text: segments.map((segment) => segment.text).filter(Boolean).join(" "), language, segments };
    } finally { await rm(dir, { recursive: true, force: true }); }
  }
}
