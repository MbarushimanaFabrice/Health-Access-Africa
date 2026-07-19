# Health Access Africa

A telehealth platform connecting patients in rural Africa (Rwanda) with doctors and healthcare providers. The system provides role-based portals for **Patients**, **Doctors**, and **Admins** to manage appointments, telehealth consultations, health information, and notifications.

This is a monorepo containing two applications:

- **`backend/`** — REST API built with Express.js, TypeScript, PostgreSQL, and Prisma.
- **`frontend/`** — Web client built with TanStack Start (React 19), TanStack Router/Query, and TailwindCSS v4.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup & Installation](#setup--installation)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
- [Running the Project](#running-the-project)
- [Environment Variables](#environment-variables)
- [User Roles & Portals](#user-roles--portals)
- [API Documentation](#api-documentation)
- [Available Scripts](#available-scripts)
- [License](#license)

---

## Architecture Overview

```
┌──────────────────────┐         HTTP / REST          ┌──────────────────────┐
│      Frontend        │  ───────────────────────────▶ │       Backend        │
│  TanStack Start SPA  │  ◀─────────────────────────── │   Express REST API   │
│  (React 19 + Vite)   │        JSON + JWT auth        │   (Node + TypeScript)│
└──────────────────────┘                               └──────────┬───────────┘
                                                                   │ Prisma ORM
                                                                   ▼
                                                        ┌──────────────────────┐
                                                        │     PostgreSQL       │
                                                        └──────────────────────┘
```

- The **backend** exposes a JWT-authenticated REST API (access + refresh tokens) with role-based access control.
- The **frontend** consumes the API and renders three distinct portals depending on the authenticated user's role.

---

## Tech Stack

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: JWT (access + refresh tokens), bcrypt password hashing
- **Validation**: Zod
- **API Docs**: Swagger / OpenAPI

### Frontend
- **Framework**: TanStack Start (React 19 + Vite, SSR)
- **Routing**: TanStack Router (file-based)
- **Data Fetching**: TanStack Query (React Query v5)
- **Styling**: TailwindCSS v4 + CVA + Tailwind Merge
- **UI**: Radix UI primitives + Lucide icons
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts · **Toasts**: Sonner · **Dates**: date-fns

---

## Project Structure

```
Health-access-africa/
├── backend/                     # Express REST API
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   ├── seed.ts              # Database seed script
│   │   └── migrations/          # Prisma migrations
│   ├── src/
│   │   ├── config/              # env, db (Prisma client), swagger
│   │   ├── middleware/          # auth, role (RBAC), validate, error
│   │   ├── modules/             # Feature modules
│   │   │   ├── auth/            # register, login, refresh, me
│   │   │   ├── users/           # user management
│   │   │   ├── patients/        # patient profiles
│   │   │   ├── appointments/    # appointment booking/management
│   │   │   ├── consultations/   # telehealth consultations
│   │   │   ├── health-info/     # health articles
│   │   │   ├── notifications/   # user notifications
│   │   │   └── admin/           # admin panel & stats
│   │   ├── utils/               # jwt, password, apiResponse helpers
│   │   ├── types/               # TypeScript type extensions
│   │   ├── app.ts               # Express app setup
│   │   └── server.ts            # Server entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md                # Backend-specific docs & full API reference
│
├── frontend/                    # TanStack Start web client
│   ├── src/
│   │   ├── components/          # Shared UI + role layouts
│   │   │   └── ui/              # Radix UI primitive components
│   │   ├── hooks/               # Custom React hooks
│   │   ├── lib/                 # Utilities + API client
│   │   ├── mock/                # Mock data for development
│   │   ├── routes/              # File-based routes (admin.*, doctor.*, patient.*)
│   │   ├── state/              # React Context (auth, app-state)
│   │   ├── router.tsx           # Router configuration
│   │   ├── server.ts            # Server entry (SSR)
│   │   └── start.ts             # Client entry
│   ├── public/                  # Static assets
│   ├── package.json
│   ├── vite.config.ts
│   └── README.md                # Frontend-specific docs
│
├── .gitignore
└── README.md                    # ← You are here
```

---

## Prerequisites

- **Node.js** 18+
- **PostgreSQL** 14+
- **Bun** (recommended for the frontend) or npm/yarn/pnpm
- **npm** (for the backend)

---

## Setup & Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Health-access-africa
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create the environment file and edit it (see Environment Variables below)
cp .env.example .env   # if no example exists, create .env manually

# Generate the Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# (Optional) Seed the database with sample data
npx prisma db seed

# Start the dev server (http://localhost:3000)
npm run dev
```

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies (Bun recommended)
bun install
# or: npm install

# Create a .env file (see Environment Variables below)

# Start the dev server
bun dev
# or: npm run dev
```

---

## Running the Project

Run both services concurrently in separate terminals:

| Service  | Command (in its directory) | Default URL                     |
|----------|----------------------------|---------------------------------|
| Backend  | `npm run dev`              | http://localhost:3000           |
| Frontend | `bun dev`                  | http://localhost:3000 (Vite)    |
| API Docs | —                          | http://localhost:3000/api-docs  |

> Note: If both default to the same port, adjust `PORT` in the backend `.env` or the Vite dev port so they don't collide.

---

## Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/health_access_africa
JWT_SECRET=your-super-secret-jwt-secret
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_URL=http://localhost:3000
```

---

## User Roles & Portals

The platform serves three roles, each with a dedicated portal in the frontend:

| Role        | Portal        | Capabilities |
|-------------|---------------|--------------|
| **Patient** | `/patient/*`  | Book/cancel appointments, view consultations, browse health info, manage profile |
| **Doctor**  | `/doctor/*`   | Manage assigned appointments, run consultations, view patient records |
| **Admin**   | `/admin/*`    | Manage users, doctors, health info, view stats & reports, system settings |

---

## API Documentation

The backend exposes interactive Swagger documentation at:

```
http://localhost:3000/api-docs
```

Base API URL: `http://localhost:3000/api`

Key endpoint groups: `/auth`, `/users`, `/patients`, `/appointments`, `/consultations`, `/health-info`, `/notifications`, `/admin`.

For the full endpoint reference, RBAC matrix, database schema, and validation schemas, see **[`backend/README.md`](./backend/README.md)**.

---

## Available Scripts

### Backend

| Command                   | Description                          |
|---------------------------|--------------------------------------|
| `npm run dev`             | Start dev server with hot reload     |
| `npm run build`           | Compile TypeScript to `dist/`        |
| `npm start`               | Run the production build             |
| `npm run prisma:migrate`  | Run database migrations              |
| `npm run prisma:studio`   | Open Prisma Studio (DB GUI)          |
| `npm run prisma:generate` | Generate the Prisma client           |

### Frontend

| Command           | Description                  |
|-------------------|------------------------------|
| `bun dev`         | Start development server     |
| `bun run build`   | Production build             |
| `bun run preview` | Preview the production build |
| `bun run lint`    | Run ESLint                   |
| `bun run format`  | Format code with Prettier    |

---

## License

- **Backend**: MIT License — Health Access Africa Project
- **Frontend**: Private project — Health Access Africa
