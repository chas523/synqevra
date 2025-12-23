FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.26.0 --activate

FROM base AS builder
WORKDIR /app

# pnpm do builda (potrzebuje workspace context)
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY apps/api/package.json ./apps/api/

RUN pnpm install --frozen-lockfile

COPY apps/api/src ./apps/api/src
COPY apps/api/tsconfig.json ./apps/api/
COPY apps/api/tsconfig.build.json ./apps/api/
COPY apps/api/nest-cli.json ./apps/api/

RUN pnpm turbo build --filter=api

# Production
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Kopiuj TYLKO zbudowany kod i package. json
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/src/thingsboard/base_rule_chain.json ./dist/
COPY --from=builder /app/apps/api/package.json ./

# npm install TYLKO produkcyjne zależności (bez devDeps)
# To będzie MNIEJSZE niż pełny pnpm node_modules
RUN npm install --omit=dev

USER nestjs

EXPOSE 3003

CMD ["node", "dist/main.js"]