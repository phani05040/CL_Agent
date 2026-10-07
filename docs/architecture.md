# CallPilot AI architecture

## System boundary

CallPilot is a multi-tenant application. Every tenant-owned record carries an `organizationId`, and service-layer authorization must establish both the authenticated user and active organization before access. The browser never calculates credits, provider costs, or authorization decisions.

```text
Next.js web  ->  Fastify REST / WebSocket API  ->  application services
                                                   |-> PostgreSQL (Prisma)
                                                   |-> Redis / BullMQ workers
                                                   |-> S3-compatible recordings
                                                   `-> provider adapters
                                                         STT / LLM / TTS / telephony
```

## Monorepo

```text
apps/web                 Next.js user experience
apps/api                 Fastify HTTP API and future realtime gateway
packages/database        Prisma schema and typed database client
packages/config          shared validated configuration (introduced as modules grow)
packages/types           API/domain contracts (introduced with feature APIs)
infra                    container definitions
docs                     architecture and operating guidance
```

## Authentication

Email/password login uses Argon2id hashes and a random, opaque, server-stored session token. Only a SHA-256 token digest is stored. The cookie is `HttpOnly`, `SameSite=Lax`, and becomes `Secure` in production. Email verification, reset-token delivery, and Google OAuth are deliberately not exposed as faux flows; their Phase 1 integration points require an email provider and Google client credentials.

Authorization is role-based: `OWNER`, `ADMIN`, and `MEMBER`. Route modules must use an organization-aware guard before reading or mutating tenant data. Login routes are rate-limited globally; production adds a Redis-backed limiter and CSRF origin checks for state-changing cookie requests.

## API conventions

The API lives under `/api`, accepts JSON, validates inputs with Zod, and returns typed JSON errors. `GET /health` is intentionally unauthenticated for orchestration. Authentication endpoints currently available:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Future resource routes will use request IDs, idempotency keys for provider/payment operations, OpenAPI definitions, and audit events.

## Database model

The Prisma schema includes the Phase 1 core entities and relations for users, organizations, members, sessions, plans/subscriptions, server-side wallets, employees and extraction fields, leads, campaigns, calls/transcripts, phone numbers, webhooks, appointments, usage, and audits. Cascade behavior is intentionally restricted to dependent tenant data; application services will soft-delete user-visible records.

## Provider boundary

Provider adapters will implement narrow interfaces: telephony (call lifecycle, DTMF, transfer, number inventory), STT, TTS, LLM, payments, calendar, and WhatsApp. The initial STT/TTS adapters are local-process adapters: whisper.cpp transcribes WAV files and Piper synthesizes WAV output from locally mounted model files. They need no hosted-speech credentials and make no network request. Credentials for optional future providers belong in encrypted server-side integration records or the runtime secret store—never in frontend state or logs.

## Docker

`docker compose up` runs PostgreSQL, Redis, API, and web containers. The application images use only build-time dependencies; production deployment must supply a secret manager, managed database/Redis, persistent object storage, HTTPS termination, and a worker process.
