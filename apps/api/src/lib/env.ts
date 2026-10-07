import { z } from "zod";
const schema = z.object({ NODE_ENV: z.enum(["development", "test", "production"]).default("development"), DATABASE_URL: z.string().url(), WEB_ORIGIN: z.string().url().default("http://localhost:3000"), API_PORT: z.coerce.number().int().positive().default(4000), AUTH_SECRET: z.string().min(32), AUTH_COOKIE_NAME: z.string().default("callpilot_session") });
export const env = schema.parse(process.env);
