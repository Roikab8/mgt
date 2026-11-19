# School Management System

A full-stack starting implementation using React/Vite, Express, Prisma, and PostgreSQL.

## Status

This is an MVP foundation, not yet complete or production-ready. It includes secure role-aware login, refresh sessions, a PostgreSQL/Prisma schema, basic student APIs, audit logging, and a React dashboard.

## Requirements

- Node.js 20+
- npm
- PostgreSQL 15+

## Local setup

```sh
git clone https://github.com/Roikab8/mgt.git
cd mgt
npm install
cp .env.example .env
```

Edit `.env` and set:

- `DATABASE_URL` to a PostgreSQL connection string
- a random 32+ character `JWT_ACCESS_SECRET`
- a different random 32+ character `JWT_REFRESH_SECRET`
- `FRONTEND_ORIGIN=http://localhost:5173`

Initialize:

```sh
npm run db:generate
npm run db:migrate --workspace backend -- --name init
npm run db:seed
npm run dev
```

Open `http://localhost:5173`. Demo seeding is opt-in: set `SEED_DEMO_DATA=true` in `.env` before running `npm run db:seed`.

Demo accounts when seeding is enabled:

- Super admin: `admin@school.com` / `Admin123!`
- Teacher: `teacher1@school.com` / `Teacher123!`
- Student: `student1@school.com` / `Student123!`

## API

- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/dashboard`
- `GET /api/students`
- `POST /api/students`
- `PATCH /api/students/:id`
- `DELETE /api/students/:id`
- `GET /api/audit-logs`
- `GET /health`

## Android / Termux

```sh
pkg update -y
pkg install -y git nodejs-lts
git clone https://github.com/Roikab8/mgt.git
cd mgt
npm install
nano .env
```

Use hosted PostgreSQL for the simplest setup. Termux running a local PostgreSQL server is also possible but more resource-intensive.

## Deployment

Deploy PostgreSQL with Supabase, the backend with Render, and the frontend with Vercel.

- Backend build: `npm install && npm run db:generate --workspace backend`
- Backend start: `npm run start --workspace backend`
- Backend migration/deploy: `npm run db:deploy --workspace backend`
- Frontend root: `frontend`
- Frontend build: `npm run build`
- Frontend output: `dist`
- Set `VITE_API_URL` to the deployed backend URL.
- Set the backend `FRONTEND_ORIGIN` to the exact deployed frontend URL.

Use HTTPS in production and managed database backups. Do not enable demo seeding or use demo passwords on a public deployment.
