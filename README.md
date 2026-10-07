# CallPilot AI

An original, tenant-isolated AI voice-employee SaaS. This repository begins with Phase 1: monorepo infrastructure, PostgreSQL/Prisma data model, cookie-session authentication, initial public UI, and Docker development services.

## Run locally

1. Copy `.env.example` to `.env` and replace development secrets.
2. Run `corepack enable`, then `pnpm install`.
3. Start PostgreSQL and Redis: `docker compose up postgres redis -d`.
4. Generate and migrate the database: `pnpm db:generate` then `pnpm db:migrate`.
5. Start the web and API services: `pnpm dev`.

The web app runs at `http://localhost:3000`; the API health check is `http://localhost:4000/health`.

## Architecture

See [docs/architecture.md](docs/architecture.md). Voice, telephony, payment, calendar, and messaging providers will be introduced through provider interfaces; no provider behavior is simulated as production capability.
