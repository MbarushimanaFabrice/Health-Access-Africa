# Health Access Africa - Backend API

Backend API for Health Access Africa - A telehealth platform connecting patients with healthcare providers across Africa.

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (Access + Refresh Tokens)
- **Validation**: Zod
- **Documentation**: Swagger/OpenAPI
- **Password Hashing**: bcryptjs

---

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── config/                # Configuration files
│   │   ├── env.ts             # Environment variables
│   │   ├── db.ts              # Prisma client
│   │   └── swagger.ts         # Swagger/OpenAPI config
│   ├── middleware/            # Express middleware
│   │   ├── auth.middleware.ts     # JWT authentication
│   │   ├── role.middleware.ts     # Role-based access control
│   │   ├── validate.middleware.ts # Zod validation
│   │   └── error.middleware.ts    # Global error handler
│   ├── modules/               # Feature modules
│   │   ├── auth/              # Authentication (register, login, me)
│   │   ├── users/             # User management
│   │   ├── patients/          # Patient profiles
│   │   ├── appointments/      # Appointment booking/management
│   │   ├── consultations/     # Telehealth consultations
│   │   ├── health-info/       # Health information/articles
│   │   ├── notifications/     # User notifications
│   │   └── admin/             # Admin panel
│   ├── utils/                 # Utility functions
│   │   ├── jwt.util.ts        # JWT utilities
│   │   ├── password.util.ts   # Password hashing
│   │   └── apiResponse.util.ts # API response formatting
│   ├── types/                 # TypeScript types
│   │   └── express.d.ts       # Express type extensions
│   ├── app.ts                 # Express app setup
│   └── server.ts              # Server entry point
├── package.json
├── tsconfig.json
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and JWT secrets

# Set up database
npx prisma migrate dev --name init
npx prisma db seed

# Start development server
npm run dev
```

### Environment Variables

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

### Available Scripts

```bash
npm run dev          # Start dev server with hot reload
npm run build        # Compile TypeScript
npm start            # Run production build
npm run prisma:studio # Open Prisma Studio
npm run prisma:migrate # Run migrations
npm run prisma:seed  # Seed database
npm run prisma:generate # Generate Prisma Client
```

---

## API Documentation

### Swagger UI

Available at: `http://localhost:3000/api-docs`

### Base URL

```
http://localhost:3000/api
```

---

## Authentication

All protected routes require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Token Refresh

```http
POST /api/auth/refresh
Cookie: refreshToken=<refresh_token>
```

---

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | Register new user (patient/doctor) |
| POST | `/login` | Public | Login user |
| GET | `/me` | Authenticated | Get current user profile |
| POST | `/refresh` | Refresh Token | Refresh access token |
| POST | `/logout` | Authenticated | Logout (blacklist refresh token) |

### Users (`/api/users`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Authenticated | Get all users (paginated) |
| GET | `/:id` | Authenticated | Get user by ID |
| PATCH | `/:id` | Self/Admin | Update user profile |
| DELETE | `/:id` | Admin | Delete user |

### Patients (`/api/patients`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/:id` | Self/Doctor/Admin | Get patient profile |
| PATCH | `/:id` | Self/Doctor | Update patient profile |
| GET | `/` | Doctor/Admin | List all patients |

### Appointments (`/api/appointments`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Patient | Book appointment |
| GET | `/me` | Patient/Doctor | Get my appointments |
| GET | `/:id` | Patient/Doctor | Get appointment details |
| PATCH | `/:id/status` | Doctor | Update appointment status |
| DELETE | `/:id` | Patient | Cancel appointment (pending only) |

### Consultations (`/api/consultations`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Doctor | Start consultation |
| PATCH | `/:id` | Doctor | Update consultation |
| GET | `/:appointmentId` | Patient/Doctor | Get consultation details |

### Health Information (`/api/health-info`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Authenticated | List health articles (paginated) |
| GET | `/:id` | Authenticated | Get article by ID |
| POST | `/` | Admin | Create health article |
| PATCH | `/:id` | Admin | Update health article |
| DELETE | `/:id` | Admin | Delete health article |

### Notifications (`/api/notifications`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/me` | Authenticated | Get my notifications |
| PATCH | `/:id/read` | Authenticated | Mark notification as read |
| PATCH | `/read-all` | Authenticated | Mark all as read |

### Admin (`/api/admin`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/users` | Admin | List all users (paginated) |
| PATCH | `/users/:id/status` | Admin | Toggle user active status |
| DELETE | `/users/:id` | Admin | Delete user |
| GET | `/stats` | Admin | Get platform statistics |

---

## Database Schema

### Core Models

- **User** - Base user with role (patient/doctor/admin)
- **DoctorProfile** - Doctor-specific info (specialty, hospital, bio, experience)
- **PatientProfile** - Patient-specific info (DOB, gender, allergies, conditions)
- **Appointment** - Appointment booking with status tracking
- **Consultation** - Telehealth consultation linked to appointment
- **HealthInfo** - Health articles/information (admin created)
- **Notification** - User notifications

### Enums

- **Role**: `patient`, `doctor`, `admin`
- **AppointmentStatus**: `pending`, `confirmed`, `cancelled`, `completed`
- **ConsultationStatus**: `not_started`, `in_progress`, `completed`

---

## Role-Based Access Control (RBAC)

| Role | Permissions |
|------|-------------|
| **Patient** | Book/cancel appointments, view own appointments/consultations, view health info, manage own profile |
| **Doctor** | View/manage assigned appointments, create/update consultations, view assigned patients, view health info |
| **Admin** | Full access: manage users, health info, view stats, admin panel |

---

## Validation Schemas

All endpoints use Zod for validation. Key schemas:

- **Auth**: Register (name, email, password, role, phone, district), Login (email, password)
- **Appointments**: patientId, doctorId, appointmentDate, appointmentTime, reason
- **Consultations**: appointmentId, notes, status
- **Patients**: dateOfBirth, gender, allergies, chronicConditions, notes
- **HealthInfo**: title, content, category

---

## Error Handling

Standard error response format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [...] // validation errors if applicable
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Testing

```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm run test:coverage
```

---

## Deployment

### Build for Production

```bash
npm run build
npm start
```

### Docker

```bash
docker build -t health-access-api .
docker run -p 3000:3000 --env-file .env health-access-api
```

### Environment Variables (Production)

Ensure these are set in production:
- `NODE_ENV=production`
- Secure `JWT_SECRET` and `JWT_REFRESH_SECRET`
- Production `DATABASE_URL`
- `CLIENT_URL` for CORS

---

## Project Structure Documentation

See [FILE_STRUCTURE.md](./FILE_STRUCTURE.md) for detailed file-by-file documentation.

---

## License

MIT License - Health Access Africa Project