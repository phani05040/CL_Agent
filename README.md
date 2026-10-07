# CallPilot AI

An original, tenant-isolated AI voice-employee SaaS. This repository begins with Phase 1: monorepo infrastructure, PostgreSQL/Prisma data model, cookie-session authentication, initial public UI, and Docker development services.

## Run locally

1. Copy `.env.example` to `.env` and replace development secrets.
2. Run `corepack enable`, then `pnpm install`.
3. Start PostgreSQL and Redis: `docker compose up postgres redis -d`.
4. Generate and migrate the database: `pnpm db:generate` then `pnpm db:migrate`.
5. Start the web and API services: `pnpm dev`.

The web app runs at `http://localhost:3000`; the API health check is `http://localhost:4000/health`.

## Local speech (no external API keys)

The speech routes run local command-line runtimes instead of a hosted STT/TTS vendor. Install `whisper.cpp` and Piper on the API host, place your locally licensed model files under `./models/whisper` and `./models/piper`, and set the four `LOCAL_*` settings in `.env`. Docker mounts that directory read-only at `/models`.

- `POST /api/voice/transcribe` accepts `{ "audioBase64": "...", "language": "en" }` where audio is WAV, and returns transcript segments.
- `POST /api/voice/synthesize` accepts `{ "text": "Hello", "voice": "en_US-lessac-medium", "speed": 1 }` and returns `audio/wav`.

These routes never transmit audio or model files to an external speech API. Model quality and language availability depend on the local model you select.

## Architecture

See [docs/architecture.md](docs/architecture.md). Voice, telephony, payment, calendar, and messaging providers will be introduced through provider interfaces; no provider behavior is simulated as production capability.
