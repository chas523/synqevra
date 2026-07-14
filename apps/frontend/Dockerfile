FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.26.0 --activate


# Dependencies
FROM base AS deps
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY apps/front/package.json ./apps/front/
# COPY packages/ ./packages/

RUN pnpm install --frozen-lockfile

# Builder
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/ ./
COPY apps/front/ ./apps/front/
# COPY packages/ ./packages/

RUN pnpm turbo build --filter=front

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/front/.next/standalone ./
COPY --from=builder /app/apps/front/.next/static ./apps/front/.next/static
COPY --from=builder /app/apps/front/public ./apps/front/public

RUN mkdir -p /app/apps/front/.next/cache && chown -R nextjs:nodejs /app/apps/front

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/front/server.js"]