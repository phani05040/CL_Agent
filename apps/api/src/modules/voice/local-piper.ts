import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { TextToSpeechProvider } from "./types.js";
import { runProcess } from "./local-process.js";

/** Piper invokes a local voice model and writes a WAV file without a network call. */
export class LocalPiperProvider implements TextToSpeechProvider {
  readonly id = "local-piper";
  constructor(private readonly binary: string, private readonly voicesDir: string) {}
  async synthesize({ text, voice, speed = 1 }: { text: string; voice: string; speed?: number }) {
    if (!/^[a-zA-Z0-9._-]+$/.test(voice)) throw new Error("Invalid local voice identifier");
    if (!Number.isFinite(speed) || speed < 0.5 || speed > 2) throw new Error("Speed must be between 0.5 and 2");
    const dir = await mkdtemp(join(tmpdir(), "callpilot-tts-")); const input = join(dir, "input.txt"); const output = join(dir, "speech.wav");
    try {
      await writeFile(input, text, "utf8");
      await runProcess(this.binary, ["--model", join(this.voicesDir, `${voice}.onnx`), "--output_file", output, "--length_scale", String(1 / speed), "--input_file", input]);
      return { wav: await readFile(output), contentType: "audio/wav" as const };
    } finally { await rm(dir, { recursive: true, force: true }); }
  }
}
