# Health Access Africa

Telehealth platform connecting patients in rural Rwanda with doctors and healthcare providers. Built with TanStack Start, React 19, TanStack Router, TanStack Query, TailwindCSS v4, and Radix UI.

## Tech Stack

- **Framework**: TanStack Start (React 19 + Vite)
- **Routing**: TanStack Router (file-based routing)
- **Data Fetching**: TanStack Query (React Query v5)
- **State Management**: React Context + TanStack Query
- **Styling**: TailwindCSS v4 + Tailwind Merge + CVA
- **UI Components**: Radix UI Primitives + Lucide React icons
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Forms/Validation**: React Hook Form + Zod
- **Notifications**: Sonner (toast notifications)
- **Date Handling**: date-fns
- **Linting/Formatting**: ESLint + Prettier
- **Build Tool**: Vite + TypeScript

## Project Structure

```
src/
├── components/          # Shared UI components
│   ├── ui/             # Radix UI primitive components
│   ├── admin-layout.tsx
│   ├── doctor-layout.tsx
│   ├── patient-layout.tsx
│   ├── role-layout.tsx
│   └── status-badge.tsx
├── hooks/              # Custom React hooks
├── lib/                # Utility functions, API client
├── mock/               # Mock data for development
├── routes/             # File-based routes (TanStack Router)
│   ├── admin.*         # Admin portal routes
│   ├── doctor.*        # Doctor portal routes
│   ├── patient.*       # Patient portal routes
│   ├── login.tsx       # Authentication
│   ├── register.tsx    # User registration
│   ├── set-password.tsx
│   ├── __root.tsx      # Root layout with providers
│   └── routeTree.gen.ts
├── state/              # React Context providers
│   ├── app-state.tsx
│   └── auth.tsx
├── styles.css          # Global styles + Tailwind
├── router.tsx          # Router configuration
├── server.ts           # Server entry (TanStack Start)
└── start.ts            # Client entry
```

## Portals & Routes

### Admin Portal (`/admin/*`)
- `/admin` - Dashboard
- `/admin/doctors` - Doctor management
- `/admin/patients` - Patient management
- `/admin/appointments` - Appointment oversight
- `/admin/health-info` - Health information management
- `/admin/notifications` - Notification management
- `/admin/reports` - Analytics & reports
- `/admin/settings` - System settings
- `/admin/users` - User management

### Doctor Portal (`/doctor/*`)
- `/doctor` - Dashboard
- `/doctor/appointments` - Appointment management
- `/doctor/consultations` - Video consultations
- `/doctor/patients` - Patient records
- `/doctor/health-info` - Health resources
- `/doctor/notifications` - Notifications
- `/doctor/settings` - Profile settings

### Patient Portal (`/patient/*`)
- `/patient` - Dashboard
- `/patient/book` - Book appointments
- `/patient/appointments` - My appointments
- `/patient/consultations` - Past consultations
- `/patient/health-info` - Health resources
- `/patient/notifications` - Notifications
- `/patient/profile` - Profile management

### Auth Routes
- `/login` - User login
- `/register` - User registration
- `/set-password` - Password setup

## Getting Started

### Prerequisites
- Node.js 18+
- Bun (recommended) or npm/yarn/pnpm

### Installation

```bash
# Using bun (recommended)
bun install

# Or with npm
npm install
```

### Development

```bash
# Start dev server
bun dev

# Or with npm
npm run dev
```

### Build

```bash
# Production build
bun run build

# Development build
bun run build:dev

# Preview production build
bun run preview
```

### Linting & Formatting

```bash
# Run ESLint
bun run lint

# Format with Prettier
bun run format
```

## Project Configuration

### TypeScript
- Strict mode enabled
- Path aliases configured (`@/*` → `src/*`)

### TailwindCSS v4
- Uses `@tailwindcss/vite` plugin
- Custom design system with CSS variables
- Font: Plus Jakarta Sans

### TanStack Router
- File-based routing in `src/routes/`
- Route tree auto-generated at `src/routeTree.gen.ts`
- Type-safe routing with route context

### TanStack Query
- QueryClient provided at root level
- Configured in `src/routes/__root.tsx`

## Environment Variables

Create a `.env` file in the root:

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_URL=http://localhost:3000
```

## Deployment

### Build for Production

```bash
bun run build
```

Output goes to `.output/` directory (configured for TanStack Start deployment).

### Deploy Targets
- **Vercel**: Connect repo, framework preset: TanStack Start
- **Netlify**: Build command `bun run build`, output `.output/public`
- **Docker**: Use provided Dockerfile (if available)
- **Node.js**: Run `.output/server/index.mjs`

## Project Scripts

| Command | Description |
|---------|-------------|
| `dev` | Start development server |
| `build` | Production build |
| `build:dev` | Development build |
| `preview` | Preview production build |
| `lint` | Run ESLint |
| `format` | Format with Prettier |

## Project Conventions

### File Naming
- Routes: `feature.page.tsx` (e.g., `admin.doctors.tsx`)
- Components: `kebab-case.tsx` (e.g., `status-badge.tsx`)
- Hooks: `use-feature.ts` (e.g., `use-auth.ts`)
- Types: `types.ts` or co-located with component

### Routing
- File-based routing in `src/routes/`
- Layout routes: `_layout.tsx` or role-specific layouts
- Dynamic routes: `$param.tsx`
- Optional segments: `{-$param}.tsx`

### State Management
- **Server state**: TanStack Query (React Query)
- **Client state**: React Context (`AuthProvider`, `AppStateProvider`)
- **Forms**: React Hook Form + Zod schemas

### Styling
- TailwindCSS v4 with CSS variables
- `cn()` utility for class merging (`src/lib/utils.ts`)
- CVA for component variants
- Radix UI primitives for accessible components

## Key Features

- **Multi-role portals**: Admin, Doctor, Patient dashboards
- **Role-based routing & layouts**
- **Authentication flow**: Login, Register, Password setup
- **Real-time notifications**: Sonner toasts
- **Responsive design**: Mobile-first with Tailwind
- **Accessible UI**: Radix UI primitives
- **Type-safe routing**: Full TypeScript integration
- **Server-side rendering**: TanStack Start SSR

## License

Private project - Health Access Africa
