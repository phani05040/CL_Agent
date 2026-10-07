import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { LocalPiperProvider } from "./local-piper.js";
import { LocalWhisperProvider } from "./local-whisper.js";
import { env } from "../../lib/env.js";
import { getUser } from "../auth/service.js";

const runtime = {
  stt: new LocalWhisperProvider(process.env.LOCAL_WHISPER_BIN ?? "whisper-cli", process.env.LOCAL_WHISPER_MODEL ?? "/models/whisper/ggml-base.en.bin"),
  tts: new LocalPiperProvider(process.env.LOCAL_PIPER_BIN ?? "piper", process.env.LOCAL_PIPER_VOICES_DIR ?? "/models/piper")
};
export async function voiceRoutes(app: FastifyInstance) {
  app.addHook("preHandler", async (request, reply) => {
    const user = await getUser(request.cookies[env.AUTH_COOKIE_NAME]);
    if (!user) return reply.code(401).send({ error: "Unauthorized" });
  });
  app.post("/transcribe", async (request, reply) => {
    const body = z.object({ audioBase64: z.string().min(64), language: z.string().max(10).optional() }).parse(request.body);
    try { return await runtime.stt.transcribe({ wav: Buffer.from(body.audioBase64, "base64"), language: body.language }); }
    catch (error) { request.log.error(error, "Local STT failed"); return reply.code(503).send({ error: "Local STT runtime is unavailable. Install whisper.cpp and mount its model." }); }
  });
  app.post("/synthesize", async (request, reply) => {
    const body = z.object({ text: z.string().min(1).max(4_000), voice: z.string().min(1).max(100), speed: z.number().optional() }).parse(request.body);
    try { const result = await runtime.tts.synthesize(body); return reply.type(result.contentType).send(result.wav); }
    catch (error) { request.log.error(error, "Local TTS failed"); return reply.code(503).send({ error: "Local TTS runtime is unavailable. Install Piper and mount the selected voice model." }); }
  });
}
