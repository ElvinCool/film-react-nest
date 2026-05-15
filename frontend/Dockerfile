# syntax=docker/dockerfile:1

# ===== Builder =====
FROM node:18-alpine AS builder
WORKDIR /app

COPY package.json ./
# package-lock.json намеренно не копируем: Rollup имеет известный баг
# (npm/cli#4828) — лочка, собранная под другую ОС/архитектуру,
# приводит к отсутствию платформенно-зависимого binary @rollup/rollup-linux-*.
# В рамках одной сборки достаточно простого `npm install`.
RUN npm install --no-audit --no-fund

COPY tsconfig*.json vite.config.ts index.html ./
COPY src ./src
COPY public ./public
RUN npm run build

# ===== Runtime =====
# В рантайме просто копируем dist в общий volume и завершаемся.
# nginx-контейнер использует этот же volume для раздачи статики.
FROM alpine:3.20 AS runtime
WORKDIR /app

COPY --from=builder /app/dist ./dist

CMD ["sh", "-c", "rm -rf /shared/* && cp -r /app/dist/. /shared/ && echo 'frontend dist copied to /shared'"]
