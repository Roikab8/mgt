# School Management System

A full-stack starting implementation for a school portal, using React/Vite, Express, Prisma, and PostgreSQL. This branch currently provides secure authentication with rotating refresh sessions, role-aware dashboard access, student record endpoints, audit logging, and a relational schema for the planned school workflows. It is not yet a complete implementation of every requested feature (for example attendance/marks/fees workflows, CSV/PDF, backup scheduling, and full admin screens remain to be built).

## Requirements

- Node.js 20 or newer and npm
- PostgreSQL 15+
- Termux works for local development; see the Android instructions below.

## Local setup

1. Install Node.js, Git, and PostgreSQL, then clone and check out the feature branch:

   ```sh
   git clone https://github.com/Roikab8/mgt.git
   cd mgt
   git checkout build/school-management-system
   ```

2. Copy `.env.example` to `.env`, create a PostgreSQL database, and set `DATABASE_URL`. Generate separate random secrets (at least 32 characters) for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`. Never commit `.env`.
3. Install and initialize the app:

   ```sh
   npm install
   npm run db:generate
   npm run db:migrate --workspace backend -- --name init
   npm run db:seed
   npm run dev
   ```

   Frontend runs at `http://localhost:5173`; API at `http://localhost:4000`. Set `VITE_API_URL` in `frontend/.env` if the API is elsewhere. `FRONTEND_ORIGIN` must exactly match the frontend origin.
4. Demo seed is opt-in. Set `SEED_DEMO_DATA=true` in `.env` before running `npm run db:seed`. It creates these local demo accounts:

   - Super admin: `admin@school.com` / `Admin123!`
   - Teacher: `teacher1@school.com` / `Teacher123!`
   - Students: `student1@school.com` through `student10@school.com` / `Student123!`

   Demo passwords are for local testing only. Do not enable this seed on a public production deployment; change or delete demo accounts before exposing an instance.

## API overview

- `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET /api/dashboard`
- `GET /api/students` (student sees self; teacher sees assigned classes; staff see all)
- `POST /api/students`, `PATCH /api/students/:id`, `DELETE /api/students/:id` (admin roles only)
- `GET /api/audit-logs` (super admin only)
- `GET /health`

Access JWTs are short-lived and held in frontend memory. Refresh JWTs are rotated, stored only as SHA-256 hashes in PostgreSQL, and sent as HttpOnly cookies. All passwords use bcrypt. The API validates request bodies and applies security headers, CORS allowlisting, and rate limiting. This is a baseline: before production, add automated tests, monitoring, explicit data-retention policies, stronger account recovery and MFA protections, and complete the remaining role-scoped endpoints.

## Termux (Android)

In Termux:

```sh
pkg update -y
pkg install -y git nodejs-lts
# Clone the repo and enter the feature branch
git clone https://github.com/Roikab8/mgt.git
cd mgt
git checkout build/school-management-system
npm install
```

You still need a PostgreSQL server. The simplest Android route is a hosted PostgreSQL database (for example Supabase): create a database, copy its connection string into `.env`, and set the required secrets and `FRONTEND_ORIGIN`. Use the Termux editor `nano .env` to make the file. Do not publish `.env` or paste secrets into chat. Then run the database migration and seed steps above. Open `http://localhost:5173` in Android Chrome while `npm run dev` is running. On-device resource limits can make local builds slow; a cloud deployment is preferable for production.

## Deployment outline

### PostgreSQL / Supabase

Create a PostgreSQL database and keep its connection URL private. Configure `DATABASE_URL` for the backend service. Run `npm run db:deploy --workspace backend` as a release/deploy step after generating the Prisma client (`npm run db:generate --workspace backend`). Do not enable demo seeding in production.

### Backend / Render

Create a Node web service from this repository and set its root directory to the repository root. Build command: `npm install && npm run db:generate --workspace backend`; start command: `npm run start --workspace backend`. Configure `DATABASE_URL`, both JWT secrets, `FRONTEND_ORIGIN` (your deployed frontend origin), `NODE_ENV=production`, and `PORT` via Render environment settings. Add `npm run db:deploy --workspace backend` as a pre-deploy command if available. Verify `/health` after deploy.

### Frontend / Vercel

Import the repository, set the root directory to `frontend`, and set build command to `npm run build` and output directory to `dist`. Set `VITE_API_URL` to the backend origin (without a trailing slash). Since refresh uses cross-origin cookies in production, deploy frontend and API on HTTPS and set backend CORS origin exactly to the Vercel URL. For a stable production setup, use custom domains under the same site and configure cookie/CORS settings accordingly.

## Database backup

Use the managed PostgreSQL provider's scheduled backups or a secured `pg_dump` job with encrypted offsite storage and tested restore procedures. Automated backup/restore orchestration is not included in this initial branch. Never expose database backups from a public API endpoint.
