import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { env } from "../../lib/env.js";
import { cookieOptions, getUser, login, logout, register } from "./service.js";
const credentials = z.object({ email: z.string().email(), password: z.string().min(12).max(128) });
export async function authRoutes(app: FastifyInstance) {
  app.post("/signup", async (request, reply) => { const body = credentials.extend({ name: z.string().min(2).max(80) }).parse(request.body); try { const session = await register(body.name, body.email.toLowerCase(), body.password); reply.setCookie(env.AUTH_COOKIE_NAME, session.token, { ...cookieOptions, expires: session.expiresAt }); return reply.code(201).send({ ok: true }); } catch (error) { if ((error as Error).message === "EMAIL_TAKEN") return reply.code(409).send({ error: "Email already registered" }); throw error; } });
  app.post("/login", async (request, reply) => { const body = credentials.parse(request.body); try { const session = await login(body.email.toLowerCase(), body.password); reply.setCookie(env.AUTH_COOKIE_NAME, session.token, { ...cookieOptions, expires: session.expiresAt }); return { ok: true }; } catch { return reply.code(401).send({ error: "Invalid email or password" }); } });
  app.post("/logout", async (request, reply) => { await logout(request.cookies[env.AUTH_COOKIE_NAME]); reply.clearCookie(env.AUTH_COOKIE_NAME, cookieOptions); return reply.code(204).send(); });
  app.get("/me", async (request, reply) => { const user = await getUser(request.cookies[env.AUTH_COOKIE_NAME]); if (!user) return reply.code(401).send({ error: "Unauthorized" }); return { id: user.id, email: user.email, name: user.name, workspaces: user.memberships.map((m) => ({ id: m.organization.id, name: m.organization.name, role: m.role })) }; });
}
