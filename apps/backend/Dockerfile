FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.26.0 --activate

FROM base AS builder
WORKDIR /app

# pnpm do builda (potrzebuje workspace context)
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY apps/backend/package.json ./apps/backend/

RUN pnpm install --frozen-lockfile

COPY apps/backend/src ./apps/backend/src
COPY apps/backend/tsconfig.json ./apps/backend/
COPY apps/backend/tsconfig.build.json ./apps/backend/
COPY apps/backend/nest-cli.json ./apps/backend/

RUN pnpm turbo build --filter=backend

# Production
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Kopiuj TYLKO zbudowany kod i package.json
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/src/thingsboard/base_rule_chain.json ./src/thingsboard/base_rule_chain.json
COPY --from=builder /app/apps/backend/package.json ./

# npm install TYLKO produkcyjne zależności (bez devDeps)
RUN npm install --omit=dev

USER nestjs

EXPOSE 3003

CMD ["node", "dist/main.js"]