FROM node:20-alpine AS builder

# Установка pnpm
RUN npm install -g pnpm

WORKDIR /app

# Копирование файлов package.json
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/api/package.json ./packages/api/
COPY packages/db/package.json ./packages/db/
COPY packages/validators/package.json ./packages/validators/

# Установка зависимостей
RUN pnpm install --frozen-lockfile

# Копирование исходного кода
COPY packages/api ./packages/api
COPY packages/db ./packages/db
COPY packages/validators ./packages/validators

# Сборка приложения
RUN pnpm --filter @acme/api build

# Продакшн образ
FROM node:20-alpine

WORKDIR /app

# Копирование собранных файлов и зависимостей
COPY --from=builder /app/packages/api/dist ./dist
COPY --from=builder /app/packages/api/package.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3001

CMD ["node", "dist/server.js"]
