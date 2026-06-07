FROM node:22-alpine AS base
# Use corepack for consistent pnpm version
RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /app

# ── Stage 1: install all dependencies ────────────────────────────────────────
FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/core/package.json packages/core/package.json
COPY packages/server/package.json packages/server/package.json
COPY packages/frontend/package.json packages/frontend/package.json
RUN pnpm install --frozen-lockfile

# ── Stage 2: build everything ─────────────────────────────────────────────────
FROM deps AS builder
COPY . .
RUN pnpm build

# ── Stage 3: lean production image ────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

# Package manifests (needed for pnpm module resolution)
COPY package.json pnpm-workspace.yaml ./
COPY packages/core/package.json packages/core/package.json
COPY packages/server/package.json packages/server/package.json

# Copy runtime node_modules from deps stage (avoids re-install)
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/server/node_modules ./packages/server/node_modules

# Compiled packages
COPY --from=builder /app/packages/core/dist ./packages/core/dist
COPY --from=builder /app/packages/server/dist ./packages/server/dist

# Frontend static files (built into server/public by Vite)
COPY --from=builder /app/packages/server/public ./packages/server/public

ENV NODE_ENV=production
ENV PORT=10000
EXPOSE 10000

CMD ["node", "packages/server/dist/server.js"]
