FROM node:22-alpine
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --no-frozen-lockfile
COPY . .
RUN pnpm --filter @callpilot/web build
EXPOSE 3000
CMD ["pnpm", "--filter", "@callpilot/web", "start"]
