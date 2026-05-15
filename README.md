# FILM!

Онлайн-сервис бронирования билетов в кинотеатр. Бэкенд на Nest.js + PostgreSQL,
фронтенд на React + Vite. Запускается одной командой через Docker Compose.

## Задеплоенное приложение

> **Адрес деплоя:** `http://<ваш-домен>` — будет указан после развёртывания на удалённом сервере.
>
> pgAdmin: `http://<ваш-домен>:8080`

## Стек

* **Backend** — Node.js 18, NestJS 10, TypeORM 0.3, PostgreSQL 16
* **Frontend** — React 18, Vite 5, TypeScript
* **Reverse proxy** — Nginx 1.27
* **Логирование** — три формата на выбор: `dev` (цветной для людей), `json`, `tskv`
* **CI/CD** — GitHub Actions, образы публикуются в `ghcr.io`

## Запуск через Docker Compose (локально)

```bash
cp .env.example .env
docker compose up -d --build
```

После старта:

* Приложение — [http://localhost](http://localhost) (порт 80)
* pgAdmin   — [http://localhost:8080](http://localhost:8080)

Затем налейте в БД тестовые данные. Через pgAdmin или из CLI:

```bash
docker exec -i film_database psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" < backend/test/prac.init.sql
docker exec -i film_database psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" < backend/test/prac.films.sql
docker exec -i film_database psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" < backend/test/prac.shedules.sql
```

## Запуск без Docker (для разработки)

```bash
cd backend
npm ci
cp .env.example .env   # заполнить под локальный PostgreSQL
npm run start:dev
```

Фронтенд:

```bash
cd frontend
npm ci
npm run dev
```

## Тесты

```bash
cd backend
npm test
```

Покрывают: `JsonLogger`, `TskvLogger`, `FilmsController`, `OrderController`.

## Логгеры

Выбираются переменной окружения `LOGGER_TYPE`:

| Значение | Класс         | Назначение                                |
| -------- | ------------- | ----------------------------------------- |
| `dev`    | `DevLogger`   | человекочитаемый, наследник ConsoleLogger |
| `json`   | `JsonLogger`  | JSON-строка на запись                     |
| `tskv`   | `TskvLogger`  | Tab-Separated Key-Value (по умолчанию)    |

## Деплой образов в ghcr.io

При пуше в `main` срабатывает workflow `.github/workflows/docker-publish.yml`,
который собирает три образа (`backend`, `frontend`, `nginx`) и публикует их в
GitHub Container Registry под тегами `:latest` и `:<sha>`.

## Структура

```
backend/    NestJS API, TypeORM-репозитории, Dockerfile
frontend/   React + Vite, Dockerfile (билдер + копирование dist в volume)
nginx/      Reverse proxy, Dockerfile + default.conf
docker-compose.yml  Backend + Frontend + Postgres + pgAdmin + nginx
```
