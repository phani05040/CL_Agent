FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/api/package.json apps/api/package.json
COPY packages/database/package.json packages/database/package.json
COPY packages/config/package.json packages/config/package.json
RUN pnpm install --no-frozen-lockfile
COPY . .
RUN pnpm --filter @callpilot/database generate && pnpm --filter @callpilot/api build
EXPOSE 4000
CMD ["sh", "-c", "pnpm --filter @callpilot/database migrate && node apps/api/dist/main.js"]
