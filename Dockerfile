FROM node:22-alpine AS base
RUN npm install -g pnpm@latest
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/core/package.json packages/core/package.json
COPY packages/server/package.json packages/server/package.json
COPY packages/frontend/package.json packages/frontend/package.json
RUN pnpm install --frozen-lockfile

# Build core
FROM deps AS build-core
COPY packages/core packages/core
COPY tsconfig.base.json .
RUN pnpm --filter @aio/core build

# Build server
FROM build-core AS build-server
COPY packages/server packages/server
RUN pnpm --filter @aio/server build

# Build frontend
FROM build-core AS build-frontend
COPY packages/frontend packages/frontend
RUN pnpm --filter @aio/frontend build

# Final production image
FROM node:22-alpine AS runner
RUN npm install -g pnpm@latest
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/core/package.json packages/core/package.json
COPY packages/server/package.json packages/server/package.json
COPY packages/frontend/package.json packages/frontend/package.json

RUN pnpm install --prod --frozen-lockfile

COPY --from=build-server /app/packages/core/dist packages/core/dist
COPY --from=build-server /app/packages/server/dist packages/server/dist
COPY --from=build-frontend /app/packages/server/public packages/server/public

ENV NODE_ENV=production
ENV PORT=10000
EXPOSE 10000

CMD ["node", "packages/server/dist/server.js"]
