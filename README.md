# Health Access Africa

A telehealth platform connecting patients in rural and underserved communities in Rwanda / East Africa with licensed doctors — without travelling to a health facility. The system provides role-based portals for **Patients**, **Doctors**, and **Admins** to manage appointments, video consultations, patient records, health information, and notifications.

| | |
|---|---|
| **Live application** | https://health-access-africa.vercel.app/ |
| **API base URL** | https://healthcare.iduka.store/api |
| **API documentation (Swagger)** | https://healthcare.iduka.store/api-docs |

This is a monorepo containing two applications:

- **`backend/`** — REST API built with Express.js, TypeScript, PostgreSQL, and Prisma.
- **`frontend/`** — Web client built with TanStack Start (React 19), TanStack Router/Query, and TailwindCSS v4.

---

## Table of Contents

- [Demo Accounts](#demo-accounts)
- [Architecture Overview](#architecture-overview)
- [Deployment](#deployment)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup & Installation](#setup--installation)
- [Running the Project](#running-the-project)
- [Environment Variables](#environment-variables)
- [User Roles & Portals](#user-roles--portals)
- [Implemented Requirements](#implemented-requirements)
- [API Documentation](#api-documentation)
- [Available Scripts](#available-scripts)
- [Troubleshooting](#troubleshooting)
- [Author](#author)
- [License](#license)

---

## Demo Accounts

Use these accounts on the [live application](https://health-access-africa.vercel.app/) to explore each portal.

| Role | Email | Password |
|------|-------|----------|
| **Doctor** | `johnmugabo@gmail.com` | `Mugabo@pass123` |
| **Patient** | `mukunzicedric@gmail.com` | `pj4f4DJr6wTDyCr` |
| **System Admin** | `admin@healthaccessafrica.rw` | `Password123!` |

> To see a video consultation end-to-end, sign in as the **doctor** in one browser window and as the **patient** in another (or use a private/incognito window). The doctor starts the call; the patient then joins from the notification or the appointment.

If you run the project locally, `npx prisma db seed` creates its own set of Rwanda-based demo users (admins, doctors, and patients) and prints their credentials to the terminal.

---

## Architecture Overview

```
┌──────────────────────┐         HTTPS / REST         ┌──────────────────────┐
│      Frontend        │  ───────────────────────────▶ │       Backend        │
│  TanStack Start SPA  │  ◀─────────────────────────── │   Express REST API   │
│  (React 19 + Vite)   │        JSON + JWT auth        │  (Node + TypeScript) │
└──────────┬───────────┘                              └──────────┬───────────┘
           │                                                     │ Prisma ORM
           │ WebRTC                                              ▼
           ▼                                          ┌──────────────────────┐
┌──────────────────────┐                              │     PostgreSQL       │
│  Jitsi Meet (video)  │                              └──────────────────────┘
└──────────────────────┘
```

- The **backend** exposes a JWT-authenticated REST API with role-based access control (RBAC) enforced in middleware, not just hidden in the UI.
- The **frontend** consumes the API and renders three distinct portals depending on the authenticated user's role.
- **Video consultations** run over Jitsi Meet. The backend generates an unguessable room ID per consultation, and only that appointment's own doctor and patient may join.

---

## Deployment

| Component | Host | URL |
|-----------|------|-----|
| **Frontend** | **Vercel** (Git-connected, auto-deploys on push) | https://health-access-africa.vercel.app/ |
| **Backend API** | **Self-managed Linux server** (Node process behind an Nginx reverse proxy with TLS) | https://healthcare.iduka.store/api |
| **Database** | **PostgreSQL on the same Linux server**, reachable only from the API | — |
| **Video** | Jitsi Meet (`meet.jit.si`) | — |

Deployment notes:

- The backend's `CORS_ORIGIN` must include the deployed Vercel domain, otherwise the browser blocks API calls.
- On the Linux server the API is built with `npm run build` and started from `dist/` (`npm start`), kept alive by a process manager, with `NODE_ENV=production`.
- Database schema changes are applied on the server with `npx prisma migrate deploy` (not `migrate dev`, which is for local development only).
- PostgreSQL is not exposed publicly — the API connects to it over localhost.

---

## Tech Stack

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: JWT bearer tokens, bcrypt password hashing, forced password change on first login
- **Validation**: Zod
- **API Docs**: Swagger / OpenAPI (`swagger-jsdoc` + `swagger-ui-express`)

### Frontend
- **Framework**: TanStack Start (React 19 + Vite, SSR)
- **Routing**: TanStack Router (file-based)
- **Data Fetching**: TanStack Query (React Query v5) over Axios
- **Styling**: TailwindCSS v4 + CVA + Tailwind Merge
- **UI**: Radix UI primitives + Lucide icons
- **Forms**: React Hook Form + Zod
- **Video**: `@jitsi/react-sdk`
- **Charts**: Recharts · **Toasts**: Sonner · **Dates**: date-fns

---

## Project Structure

```
Health-access-africa/
├── backend/                          # Express REST API
│   ├── prisma/
│   │   ├── schema.prisma             # Database schema (models, enums, relations)
│   │   ├── seed.ts                   # Seeds demo users & content
│   │   └── migrations/               # Prisma migration history
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.ts                # Loads & validates environment variables
│   │   │   ├── db.ts                 # Prisma client singleton
│   │   │   └── swagger.ts            # OpenAPI setup for /api-docs
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts    # Verifies JWT, attaches req.user
│   │   │   ├── role.middleware.ts    # Role-based access control
│   │   │   ├── validate.middleware.ts# Zod request validation
│   │   │   ├── requirePasswordChange.middleware.ts
│   │   │   └── error.middleware.ts   # Central error handler
│   │   ├── modules/                  # Feature modules (routes/controller/service/schema)
│   │   │   ├── auth/                 # register, login, me, change-password
│   │   │   ├── users/                # user management
│   │   │   ├── patients/             # patient profiles & records
│   │   │   ├── appointments/         # booking, confirm, cancel
│   │   │   ├── availability/         # doctor availability slots
│   │   │   ├── consultations/        # telehealth consultations & video rooms
│   │   │   ├── health-info/          # health articles
│   │   │   ├── notifications/        # user notifications
│   │   │   └── admin/                # admin panel, stats & reports
│   │   ├── utils/                    # jwt, password, apiResponse helpers
│   │   ├── types/                    # TypeScript type extensions
│   │   ├── app.ts                    # Express app: CORS, routes, Swagger, errors
│   │   └── server.ts                 # Server entry point
│   ├── FILE_STRUCTURE.md             # File-by-file backend documentation
│   ├── README.md                     # Backend docs & full API reference
│   ├── .env.example                  # Template for backend/.env
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                         # TanStack Start web client
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                   # Radix-based primitive components
│   │   │   ├── admin-layout.tsx      # Admin portal shell
│   │   │   ├── doctor-layout.tsx     # Doctor portal shell
│   │   │   ├── patient-layout.tsx    # Patient portal shell
│   │   │   ├── role-layout.tsx       # Shared role-guard layout
│   │   │   ├── consultation-form.tsx
│   │   │   └── status-badge.tsx
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── lib/
│   │   │   ├── api-client.ts         # Axios instance, auth interceptors
│   │   │   ├── api/                  # Typed API modules per domain
│   │   │   ├── adapters.ts           # API ↔ UI shape mapping
│   │   │   └── utils.ts
│   │   ├── state/
│   │   │   ├── auth.tsx              # Auth context (session, role, logout)
│   │   │   └── app-state.tsx
│   │   ├── routes/                   # File-based routes
│   │   │   ├── index.tsx             # Public landing page
│   │   │   ├── login.tsx  register.tsx  set-password.tsx
│   │   │   ├── patient.*.tsx         # Patient portal pages
│   │   │   ├── doctor.*.tsx          # Doctor portal pages
│   │   │   ├── admin.*.tsx           # Admin portal pages
│   │   │   └── call.$appointmentId.tsx  # Jitsi video consultation room
│   │   ├── router.tsx                # Router + Query client configuration
│   │   ├── server.ts                 # SSR server entry
│   │   └── start.ts                  # Client entry
│   ├── public/                       # Static assets
│   ├── README.md                     # Frontend-specific docs
│   ├── .env.example                  # Template for frontend/.env
│   ├── vite.config.ts
│   └── package.json
│
├── .gitignore
└── README.md                         # ← You are here
```

---

## Prerequisites

Install these before you start:

| Tool | Version | Notes |
|------|---------|-------|
| **Node.js** | 18 or newer | Required by both apps |
| **PostgreSQL** | 14 or newer | Must be running locally, or use a hosted instance |
| **npm** | bundled with Node | Used for the backend |
| **Bun** | latest | Recommended for the frontend (`npm` also works) |
| **Git** | any | To clone the repository |

Check your versions:

```bash
node -v
psql --version
```

---

## Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/MbarushimanaFabrice/Health-Access-Africa.git
cd Health-Access-Africa
```

### 2. Create the database

```bash
createdb health_access_africa
# or inside psql:  CREATE DATABASE health_access_africa;
```

### 3. Backend setup

```bash
cd backend

# Install dependencies
npm install

# Create the environment file
cp .env.example .env
```

Edit `backend/.env` and set at minimum `DATABASE_URL` and `JWT_SECRET` — the server refuses to start without them.

```bash
# Generate the Prisma client
npm run prisma:generate

# Create the database tables
npm run prisma:migrate

# Seed demo users, doctors, appointments and health articles
npx prisma db seed

# Start the API (http://localhost:4441)
npm run dev
```

The seed script prints every generated login to the terminal. Keep that output.

Verify the API is up:

```bash
curl http://localhost:4441/health
```

### 4. Frontend setup

Open a **second terminal**:

```bash
cd frontend

# Install dependencies
bun install        # or: npm install

# Create the environment file
cp .env.example .env
```

`frontend/.env` points the app at your local API — the default already matches the backend's default port:

```env
VITE_API_URL=http://localhost:4441/api
VITE_JITSI_DOMAIN=meet.jit.si
```

> If you changed `PORT` in `backend/.env`, update `VITE_API_URL` to match.

Then start the dev server:

```bash
bun dev            # or: npm run dev
```

Open http://localhost:8080 and sign in with a seeded account.

---

## Running the Project

Both services run at the same time, in separate terminals:

| Service | Directory | Command | URL |
|---------|-----------|---------|-----|
| Backend API | `backend/` | `npm run dev` | http://localhost:4441/api |
| API docs (Swagger) | `backend/` | — | http://localhost:4441/api-docs |
| Health check | `backend/` | — | http://localhost:4441/health |
| Frontend | `frontend/` | `bun dev` | http://localhost:8080 |
| Prisma Studio (DB GUI) | `backend/` | `npm run prisma:studio` | http://localhost:5555 |

> The backend defaults to port **4441** and the frontend dev server to port **8080**, so they do not collide. If you change the backend `PORT`, update `VITE_API_URL` in `frontend/.env` **and** `CORS_ORIGIN` in `backend/.env`.

### Production build

```bash
# Backend
cd backend && npm run build && npm start

# Frontend
cd frontend && bun run build && bun run preview
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | **yes** | — | PostgreSQL connection string |
| `JWT_SECRET` | **yes** | — | Secret used to sign JWT access tokens |
| `JWT_EXPIRES_IN` | no | `7d` | Access token lifetime |
| `PORT` | no | `4441` | Port the API listens on |
| `CORS_ORIGIN` | no | `http://localhost:8080` | Allowed browser origin — set this to your frontend URL |
| `NODE_ENV` | no | `development` | `development` or `production` |

```env
DATABASE_URL=postgresql://user:password@localhost:5432/health_access_africa
JWT_SECRET=replace-with-a-long-random-string
JWT_EXPIRES_IN=7d
PORT=4441
CORS_ORIGIN=http://localhost:8080
NODE_ENV=development
```

### Frontend (`frontend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | no | `https://healthcare.iduka.store/api` | Base URL of the backend API. Set this to `http://localhost:4441/api` for local development. |
| `VITE_JITSI_DOMAIN` | no | `meet.jit.si` | Jitsi server used for video consultations. Set this if you self-host Jitsi. |

```env
VITE_API_URL=http://localhost:4441/api
VITE_JITSI_DOMAIN=meet.jit.si
```

> Both apps ship a `.env.example` — copy it to `.env` and edit. `.env` files are gitignored and never committed.

---

## User Roles & Portals

| Role | Portal | Capabilities |
|------|--------|--------------|
| **Patient** | `/patient/*` | Register/sign in, book and cancel appointments, join video consultations, browse health information, view notifications, manage profile |
| **Doctor** | `/doctor/*` | Publish availability slots, confirm/decline appointments, start video consultations, view their own patients' records, read health information |
| **Admin** | `/admin/*` | Manage users (activate/deactivate), manage doctors and patients, publish/unpublish health articles, view appointments, stats, reports, and system settings |

Access control is enforced at three layers: the auth context redirects each user to their own portal, route layouts guard the portal shells, and the API's role middleware rejects cross-role requests — a patient calling a doctor or admin endpoint directly gets a `403`.

---

## Implemented Requirements

Every functional requirement in the SRS is implemented and running on the live URL.

| # | Requirement | Where to see it | Status |
|---|-------------|-----------------|--------|
| 1 | User registration | `/register` → patient account created | ✅ |
| 2 | User login | `/login` → JWT issued | ✅ |
| 3 | Authentication & role-based routing | Redirect to the correct portal; blocked cross-role access | ✅ |
| 4 | Telehealth video consultation | Doctor starts call → patient joins the same Jitsi room | ✅ |
| 5 | Appointment booking | `/patient/book` — patient picks a real free slot | ✅ |
| 6 | Appointment management | `/doctor/appointments` and `/doctor/availability` | ✅ |
| 7 | Patient records management | `/doctor/patients` — doctor sees only their own patients | ✅ |
| 8 | Health information access | `/patient/health-info`, published from `/admin/health-info` | ✅ |
| 9 | Notifications | `/patient/notifications` — booking and "call started" alerts | ✅ |
| 10 | Admin management | `/admin/*` — users, doctors, articles, stats, reports | ✅ |
| 11 | Consultation notes | `/doctor/appointments` — doctor drafts notes privately, then shares them with the patient | ✅ |

**Known limitations (transparent):** video consultations depend on the public Jitsi service, so the doctor authenticates once as the room moderator when starting a call — self-hosting Jitsi removes this step and is configurable via `VITE_JITSI_DOMAIN`. Notifications are delivered in-app only (no email/SMS). An AI-assisted consultation summary is the next planned milestone.

---

## API Documentation

Interactive Swagger documentation, where every endpoint can be tried directly:

- **Local**: http://localhost:4441/api-docs
- **Deployed**: https://healthcare.iduka.store/api-docs

Base API URL: `http://localhost:4441/api` (local) · `https://healthcare.iduka.store/api` (deployed)

| Group | Purpose |
|-------|---------|
| `/auth` | Register, login, current user, change password |
| `/users` | User management |
| `/patients` | Patient profiles and records |
| `/appointments` | Booking, confirming, cancelling appointments |
| `/availability` | Doctor availability slots |
| `/consultations` | Telehealth consultations and video rooms |
| `/health-info` | Health articles |
| `/notifications` | User notifications |
| `/admin` | Admin operations, stats and reports |

Authenticate in Swagger with **Authorize → `Bearer {your-token}`**, using the token returned by `POST /api/auth/login`.

For the full endpoint reference, RBAC matrix, database schema, and validation schemas, see **[`backend/README.md`](./backend/README.md)** and **[`backend/FILE_STRUCTURE.md`](./backend/FILE_STRUCTURE.md)**.

---

## Available Scripts

### Backend (`cd backend`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the API with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled production build |
| `npm run prisma:generate` | Generate the Prisma client |
| `npm run prisma:migrate` | Create/apply migrations (development) |
| `npm run prisma:studio` | Open Prisma Studio (database GUI) |
| `npx prisma db seed` | Seed demo users and content |
| `npx prisma migrate deploy` | Apply existing migrations (production) |

### Frontend (`cd frontend`)

| Command | Description |
|---------|-------------|
| `bun dev` | Start the dev server on port 8080 |
| `bun run build` | Production build |
| `bun run preview` | Preview the production build |
| `bun run lint` | Run ESLint |
| `bun run format` | Format code with Prettier |

---

## Troubleshooting

| Symptom | Cause & fix |
|---------|-------------|
| `Missing required environment variable: DATABASE_URL` | `backend/.env` is missing or incomplete — set `DATABASE_URL` and `JWT_SECRET`. |
| CORS error in the browser console | `CORS_ORIGIN` in `backend/.env` does not match the frontend origin. Set it to `http://localhost:8080` locally, or the Vercel domain in production. |
| Login works but every request returns `401` | The frontend is pointed at a different API than the one that issued the token. Check `VITE_API_URL` in `frontend/.env`. |
| `Can't reach database server` | PostgreSQL isn't running, or the credentials/database name in `DATABASE_URL` are wrong. |
| Prisma type errors after pulling changes | Run `npm run prisma:generate`, then `npm run prisma:migrate`. |
| Video call opens but the other person can't join | The appointment must be **confirmed**, and the doctor must start the call before the patient can join. |
| Port already in use | Change `PORT` in `backend/.env`, or `server.port` in `frontend/vite.config.ts`. |

---

## Author

**Fabrice Mbarushimana** — Introduction to Software Engineering, African Leadership University, July 2026.

---

## License

- **Backend**: MIT License — Health Access Africa Project
- **Frontend**: Private project — Health Access Africa
