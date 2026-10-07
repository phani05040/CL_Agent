import argon2 from "argon2";
import { createHash, randomBytes } from "node:crypto";
import { prisma, MemberRole } from "@callpilot/database";
import { env } from "../../lib/env.js";

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
export async function register(name: string, email: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("EMAIL_TAKEN");
  const user = await prisma.$transaction(async (db) => {
    const created = await db.user.create({ data: { name, email, passwordHash: await argon2.hash(password) } });
    const organization = await db.organization.create({ data: { name: `${name}'s workspace`, slug: `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${randomBytes(3).toString("hex")}` } });
    await db.organizationMember.create({ data: { userId: created.id, organizationId: organization.id, role: MemberRole.OWNER } });
    await db.creditWallet.create({ data: { organizationId: organization.id } });
    return created;
  });
  return createSession(user.id);
}
export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.passwordHash || !(await argon2.verify(user.passwordHash, password))) throw new Error("INVALID_CREDENTIALS");
  return createSession(user.id);
}
export async function createSession(userId: string) { const token = randomBytes(32).toString("base64url"); const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14); await prisma.session.create({ data: { userId, tokenHash: hashToken(token), expiresAt } }); return { token, expiresAt }; }
export async function getUser(token?: string) { if (!token) return null; const session = await prisma.session.findFirst({ where: { tokenHash: hashToken(token), expiresAt: { gt: new Date() } }, include: { user: { include: { memberships: { include: { organization: true } } } } } }); return session?.user ?? null; }
export async function logout(token?: string) { if (token) await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } }); }
export const cookieOptions = { httpOnly: true, secure: env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" };
