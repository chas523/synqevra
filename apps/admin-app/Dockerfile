FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.26.0 --activate


# Dependencies
FROM base AS deps
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY apps/admin-app/package.json ./apps/admin-app/
# COPY packages/ ./packages/

RUN pnpm install --frozen-lockfile

# Builder
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/ ./
COPY apps/admin-app/ ./apps/admin-app/
# COPY packages/ ./packages/

ARG NEXT_PUBLIC_PROXY_URL
ENV NEXT_PUBLIC_PROXY_URL=$NEXT_PUBLIC_PROXY_URL

RUN pnpm turbo build --filter=admin-app

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/admin-app/.next/standalone ./
COPY --from=builder /app/apps/admin-app/.next/static ./apps/admin-app/.next/static
COPY --from=builder /app/apps/admin-app/public ./apps/admin-app/public

USER nextjs

EXPOSE 3002

ENV PORT=3002
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/admin-app/server.js"]