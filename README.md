# Sprintly

A lightweight sprint-management workspace for student engineering teams. Built with Next.js App Router, TypeScript, Tailwind CSS, PostgreSQL, Prisma 7, and Auth.js credentials authentication.

## Requirements

- Node.js 22.12+ and npm
- PostgreSQL 17 (or Docker Compose for the included development database)

## Local setup

```sh
npm ci
cp .env.example .env
openssl rand -base64 32
```

Set `AUTH_SECRET` in `.env` to the generated value. Set `DATABASE_URL` to your PostgreSQL connection string. The included Compose database matches `.env.example` and binds only to localhost; its example password is for local development.

```sh
docker compose up -d db
npm run db:generate
npm run db:deploy
npm run dev
```

Open http://localhost:3000/login, expand **Create an account**, and register. Create a team, a project, then a sprint. Teammates must register before the owner can add their email. No demo accounts or credentials are created automatically.

## Commands

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm start
```

For schema changes, run `npm run db:migrate -- --name your_change` and commit the generated migration. Apply committed migrations in production with `npm run db:deploy`.

## Deployment

Deploy as a Node.js Next.js app with a managed PostgreSQL database. Set `DATABASE_URL`, a unique random `AUTH_SECRET`, and `AUTH_URL` to the canonical HTTPS app URL. Run `npm ci`, `npm run db:deploy`, and `npm run build`, then `npm start`. Configure the platform's reverse proxy correctly for Auth.js; only enable host trust for infrastructure you control. Do not commit `.env`. Use separate database credentials, backups, and connection limits in production. The application uses the Node runtime and is not intended for static export or Edge-only hosting.

## Features and boundaries

Signup/login; multiple teams; owner-managed membership; project and sprint creation/editing; task creation/editing/assignment; Kanban drag-and-drop and accessible status menus; sprint metrics. Dates use UTC calendar days. Members can manage work within their own teams. JWT sessions last seven days. Login and registration attempts are throttled per normalized email in PostgreSQL.

Password recovery, email verification, email invitations, deletion, and live multi-user updates are outside this MVP. For public rollout, plan account recovery and additional edge/IP abuse controls. Expired `AuthAttempt` rows can be periodically removed with `DELETE FROM "AuthAttempt" WHERE "expiresAt" < NOW()`.

No AI or GitHub integration exists in the app. GitHub integration, PR tracking, AI summaries, sprint health scoring, and risk detection are future work only.

See [PRD](docs/PRD.md) and [architecture](docs/architecture.md) for scope, authorization rules, data model, folder structure, and future plans.

## Optional development demo

On a development database only, set `DEMO_PASSWORD` to a password of at least 10 characters and run `npm run db:seed`. This adds a sample team, three users, a project, a sprint, and seven tasks. Log in as `demo@sprintly.local` using that password. The seed is idempotent and does not overwrite existing demo records or passwords. Never seed a production database.
