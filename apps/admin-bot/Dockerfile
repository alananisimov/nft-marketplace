FROM node:20-alpine AS builder

# Установка pnpm
RUN npm install -g pnpm

WORKDIR /app

# Копирование файлов package.json
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/bot/package.json ./apps/bot/
COPY packages/api/package.json ./packages/api/
COPY packages/validators/package.json ./packages/validators/

# Установка зависимостей
RUN pnpm install --frozen-lockfile

# Копирование исходного кода
COPY apps/bot ./apps/bot
COPY packages/api ./packages/api
COPY packages/validators ./packages/validators

# Сборка приложения
RUN pnpm --filter @acme/bot build

# Продакшн образ
FROM node:20-alpine

WORKDIR /app

# Копирование собранных файлов и зависимостей
COPY --from=builder /app/apps/bot/dist ./dist
COPY --from=builder /app/apps/bot/package.json ./
COPY --from=builder /app/node_modules ./node_modules

CMD ["node", "dist/index.js"]
