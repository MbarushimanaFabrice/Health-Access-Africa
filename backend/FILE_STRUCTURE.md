# Health Access Africa - Backend File Structure Documentation

Detailed file-by-file documentation for the backend API.

---

## Root Directory

```
backend/
├── prisma/
│   ├── schema.prisma         # Prisma schema (database models, enums, relations)
│   ├── seed.ts              # Database seeding script
│   └── migrations/          # Prisma migration files
├── src/
│   ├── config/              # Configuration files
│   ├── middleware/          # Express middleware
│   ├── modules/             # Feature modules (feature-based architecture)
│   ├── utils/               # Utility functions
│   ├── types/               # TypeScript type definitions
│   ├── app.ts               # Express app configuration
│   └── server.ts            # Server entry point
├── .env                     # Environment variables (not committed)
├── .env.example             # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## Prisma

### `prisma/schema.prisma`

**Database Schema Definition**

**Enums:**
- `Role` - `patient`, `doctor`, `admin`
- `AppointmentStatus` - `pending`, `confirmed`, `cancelled`, `completed`
- `ConsultationStatus` - `not_started`, `in_progress`, `completed`

**Models:**

| Model | Description | Key Fields |
|-------|-------------|------------|
| `User` | Base user with authentication | id, fullName, email, passwordHash, role, phone, district, isActive |
| `DoctorProfile` | Doctor-specific profile | userId (unique), specialty, hospital, bio, yearsExperience |
| `PatientProfile` | Patient-specific profile | userId (unique), dateOfBirth, gender, allergies, chronicConditions, notes |
| `Appointment` | Appointment booking | patientId, doctorId, appointmentDate, appointmentTime, reason, status |
| `Consultation` | Telehealth consultation | appointmentId (unique), notes, status, startedAt, endedAt |
| `HealthInfo` | Health education content | title, content, category, authorId |
| `Notification` | User notifications | userId, message, type, isRead |

**Key Relations:**
- User 1:1 DoctorProfile / PatientProfile
- User 1:N Appointments (as patient & doctor)
- Appointment 1:1 Consultation
- User 1:N Notifications
- User 1:N HealthInfo (author)

### `prisma/seed.ts`

**Database Seeding Script**

Seeds the database with:
- 1 Admin user
- 5 Doctor users with profiles
- 6 Patient users with profiles
- Sample health information articles
- All users use password: `Password123!`

Run with: `npx prisma db seed`

---

## Configuration (`src/config/`)

### `src/config/env.ts`

**Environment Configuration**

Validates and exports all environment variables using Zod schema:

```typescript
// Exported config object
export const env = {
  NODE_ENV: 'development' | 'production' | 'test',
  PORT: number,
  DATABASE_URL: string,
  JWT_SECRET: string,
  JWT_REFRESH_SECRET: string,
  JWT_EXPIRES_IN: string,      // e.g., '15m'
  JWT_REFRESH_EXPIRES_IN: string, // e.g., '7d'
  CLIENT_URL: string,           // CORS origin
}
```

### `src/config/db.ts`

**Prisma Client Singleton**

Exports a single PrismaClient instance to prevent multiple connections in development.

```typescript
import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();
```

### `src/config/swagger.ts`

**Swagger/OpenAPI Configuration**

Configures Swagger UI with:
- OpenAPI 3.0 specification
- JWT Bearer authentication scheme
- Server configuration
- Tag definitions for all modules
- Path to route files for JSDoc parsing

Serves at: `/api-docs`

---

## Middleware (`src/middleware/`)

### `src/middleware/auth.middleware.ts`

**JWT Authentication Middleware**

Exports:
- `authenticate` - Verifies access token, attaches `req.user` (UserPayload)
- `optionalAuth` - Attaches user if token present, doesn't throw if missing
- `generateTokens(user)` - Generates access + refresh token pair
- `verifyRefreshToken(token)` - Verifies refresh token

**UserPayload type:**
```typescript
interface UserPayload {
  userId: string;
  email: string;
  role: Role;
}
```

### `src/middleware/role.middleware.ts`

**Role-Based Access Control Middleware**

Exports:
- `authorize(...roles: Role[])` - Middleware factory for role checking

Usage:
```typescript
router.get('/admin-only', authenticate, authorize('admin'), handler);
router.get('/doctor-patient', authenticate, authorize('doctor', 'patient'), handler);
```

### `src/middleware/validate.middleware.ts`

**Zod Validation Middleware**

Exports:
- `validate(schema)` - Validates req.body, req.query, req.params

Usage:
```typescript
router.post('/', authenticate, validate(createAppointmentSchema), handler);
```

### `src/middleware/error.middleware.ts`

**Global Error Handler**

Exports:
- `errorHandler` - Express error handler middleware
- `AppError` - Custom error class with statusCode, isOperational
- `asyncHandler` - Wrapper for async route handlers to catch errors

**Error Response Format:**
```json
{
  "success": false,
  "message": "Error message",
  "errors": []  // validation errors if ZodError
}
```

---

## Utilities (`src/utils/`)

### `src/utils/jwt.util.ts`

**JWT Token Utilities**

- `generateAccessToken(payload)` - Creates short-lived access token
- `generateRefreshToken(payload)` - Creates long-lived refresh token
- `verifyAccessToken(token)` - Verifies access token
- `verifyRefreshToken(token)` - Verifies refresh token
- `decodeToken(token)` - Decodes without verification

### `src/utils/password.util.ts`

**Password Hashing Utilities**

- `hashPassword(password)` - bcrypt hash with salt rounds 12
- `comparePassword(password, hash)` - Compares plain password with hash

### `src/utils/apiResponse.util.ts`

**Standardized API Response Format**

```typescript
// Success response
ApiResponse.success(res, data, message, statusCode)
// Error response
ApiResponse.error(res, message, statusCode, errors)

// Response format:
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

---

## Types (`src/types/`)

### `src/types/express.d.ts`

**Express Type Extensions**

Extends Express Request interface:
```typescript
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;  // Set by auth middleware
    }
  }
}
```

---

## Core Application (`src/`)

### `src/app.ts`

**Express Application Setup**

Configures:
- CORS (with CLIENT_URL origin)
- JSON/URL-encoded body parsing
- Helmet security headers
- Request logging (morgan)
- Swagger UI at `/api-docs`
- Health check at `/health`
- API routes at `/api`
- Global error handler
- 404 handler

### `src/server.ts`

**Server Entry Point**

- Connects to database
- Starts HTTP server on configured PORT
- Graceful shutdown handlers (SIGTERM, SIGINT)
- Prints server URLs on startup

---

## Modules (`src/modules/`)

Each module follows the same structure:
```
module-name/
├── module-name.routes.ts    # Route definitions
├── module-name.controller.ts # Request handlers
├── module-name.service.ts    # Business logic
└── module-name.schema.ts     # Zod validation schemas
```

---

### `src/modules/auth/`

#### `auth.schema.ts`

**Validation Schemas:**
- `registerSchema` - fullName, email, password, role, phone?, district?
- `loginSchema` - email, password
- `refreshTokenSchema` - refreshToken (in cookie/body)

#### `auth.service.ts`

**Authentication Business Logic:**
- `register(data)` - Creates user, hashes password, generates tokens
- `login(email, password)` - Verifies credentials, generates tokens
- `getMe(userId)` - Returns user with profile
- `refreshTokens(refreshToken)` - Rotates refresh token, returns new pair
- `logout(refreshToken)` - Blacklists refresh token (in production: Redis)

#### `auth.controller.ts`

**Request Handlers:**
- `register` - POST /register
- `login` - POST /login
- `getMe` - GET /me
- `refresh` - POST /refresh
- `logout` - POST /logout

#### `auth.routes.ts`

**Routes:**
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/refresh
POST   /api/auth/logout
```

---

### `src/modules/users/`

#### `users.schema.ts`

- `updateUserSchema` - Partial update (fullName, phone, district, isActive)

#### `users.service.ts`

- `getAllUsers(query)` - Paginated list with filters
- `getUserById(id)` - Single user with profile
- `updateUser(id, data, requesterId, requesterRole)` - Self or admin update
- `deleteUser(id)` - Admin only

#### `users.controller.ts`

- `getAllUsers` - GET /users
- `getUserById` - GET /users/:id
- `updateUser` - PATCH /users/:id
- `deleteUser` - DELETE /users/:id

#### `users.routes.ts`

```
GET    /api/users
GET    /api/users/:id
PATCH  /api/users/:id
DELETE /api/users/:id
```

---

### `src/modules/patients/`

#### `patients.schema.ts`

- `createPatientProfileSchema` - dateOfBirth, gender, allergies?, chronicConditions?, notes?
- `updatePatientProfileSchema` - All optional

#### `patients.service.ts`

- `getPatientProfile(userId)` - Returns user + patient profile
- `updatePatientProfile(userId, data)` - Upserts patient profile
- `getAllPatients(query)` - Doctor/Admin only, paginated

#### `patients.controller.ts`

- `getProfile` - GET /patients/:id
- `updateProfile` - PATCH /patients/:id
- `getAllPatients` - GET /patients

#### `patients.routes.ts`

```
GET    /api/patients/:id
PATCH  /api/patients/:id
GET    /api/patients
```

---

### `src/modules/appointments/`

#### `appointments.schema.ts`

- `createAppointmentSchema` - patientId, doctorId, appointmentDate, appointmentTime, reason?
- `updateAppointmentStatusSchema` - status (enum)

#### `appointments.service.ts`

- `createAppointment(patientId, data)` - Creates appointment, validates doctor exists
- `getMyAppointments(userId, role, query)` - Paginated, filtered by role
- `getAppointmentById(id, userId, role)` - Authorization check
- `updateAppointmentStatus(id, doctorId, status)` - Doctor only, valid transitions
- `cancelAppointment(id, patientId)` - Patient only, pending only

#### `appointments.controller.ts`

- `createAppointment` - POST /appointments
- `getMyAppointments` - GET /appointments/me
- `getAppointmentById` - GET /appointments/:id
- `updateAppointmentStatus` - PATCH /appointments/:id/status
- `cancelAppointment` - DELETE /appointments/:id

#### `appointments.routes.ts`

```
POST   /api/appointments
GET    /api/appointments/me
GET    /api/appointments/:id
PATCH  /api/appointments/:id/status
DELETE /api/appointments/:id
```

---

### `src/modules/consultations/`

#### `consultations.schema.ts`

- `createConsultationSchema` - appointmentId, notes?
- `updateConsultationSchema` - notes?, status?

#### `consultations.service.ts`

- `createConsultation(doctorId, data)` - Creates consultation, updates appointment status
- `updateConsultation(id, doctorId, data)` - Doctor only
- `getConsultationByAppointment(appointmentId, userId, role)` - Patient/Doctor access

#### `consultations.controller.ts`

- `createConsultation` - POST /consultations
- `updateConsultation` - PATCH /consultations/:id
- `getConsultation` - GET /consultations/:appointmentId

#### `consultations.routes.ts`

```
POST   /api/consultations
PATCH  /api/consultations/:id
GET    /api/consultations/:appointmentId
```

---

### `src/modules/health-info/`

#### `health-info.schema.ts`

- `createHealthInfoSchema` - title, content, category?
- `updateHealthInfoSchema` - All optional
- `querySchema` - page, limit, category, search

#### `health-info.service.ts`

- `createHealthInfo(authorId, data)` - Admin only
- `getAllHealthInfo(query)` - Paginated, searchable, filterable
- `getHealthInfoById(id)` - Single article
- `updateHealthInfo(id, data)` - Admin only
- `deleteHealthInfo(id)` - Admin only

#### `health-info.controller.ts`

- `createHealthInfo` - POST /health-info
- `getAllHealthInfo` - GET /health-info
- `getHealthInfoById` - GET /health-info/:id
- `updateHealthInfo` - PATCH /health-info/:id
- `deleteHealthInfo` - DELETE /health-info/:id

#### `health-info.routes.ts`

```
GET    /api/health-info
GET    /api/health-info/:id
POST   /api/health-info          (Admin)
PATCH  /api/health-info/:id      (Admin)
DELETE /api/health-info/:id      (Admin)
```

---

### `src/modules/notifications/`

#### `notifications.service.ts`

- `getMyNotifications(userId, query)` - Paginated, unread count
- `markAsRead(id, userId)` - Single notification
- `markAllAsRead(userId)` - Bulk update

#### `notifications.controller.ts`

- `getMyNotifications` - GET /notifications/me
- `markAsRead` - PATCH /notifications/:id/read
- `markAllAsRead` - PATCH /notifications/read-all

#### `notifications.routes.ts`

```
GET  /api/notifications/me
PATCH /api/notifications/:id/read
PATCH /api/notifications/read-all
```

---

### `src/modules/admin/`

#### `admin.service.ts`

- `getAllUsers(query)` - Paginated user management
- `toggleUserStatus(id, isActive)` - Activate/deactivate user
- `deleteUser(id)` - Hard delete
- `getStats()` - Dashboard statistics (counts by role, appointments, consultations)

#### `admin.controller.ts`

- `getAllUsers` - GET /admin/users
- `toggleUserStatus` - PATCH /admin/users/:id/status
- `deleteUser` - DELETE /admin/users/:id
- `getStats` - GET /admin/stats

#### `admin.routes.ts`

```
GET    /api/admin/users
PATCH  /api/admin/users/:id/status
DELETE /api/admin/users/:id
GET    /api/admin/stats
```

**All routes require Admin role**

---

## Module Registration Flow

Each module's routes are imported and registered in `src/app.ts`:

```typescript
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import patientRoutes from './modules/patients/patients.routes';
import appointmentRoutes from './modules/appointments/appointments.routes';
import consultationRoutes from './modules/consultations/consultations.routes';
import healthInfoRoutes from './modules/health-info/health-info.routes';
import notificationRoutes from './modules/notifications/notifications.routes';
import adminRoutes from './modules/admin/admin.routes';

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/health-info', healthInfoRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
```

---

## Development Workflow

### Adding a New Module

1. Create folder: `src/modules/new-module/`
2. Create files: `routes.ts`, `controller.ts`, `service.ts`, `schema.ts`
3. Implement following existing patterns
4. Register routes in `src/app.ts`
5. Add Swagger JSDoc comments to controller methods
6. Run `npm run dev` and verify at `/api-docs`

### Database Changes

1. Modify `prisma/schema.prisma`
2. Run: `npx prisma migrate dev --name migration_name`
3. Run: `npx prisma generate`
4. Update seed.ts if needed
5. Run: `npx prisma db seed`

### Adding Validation

1. Add Zod schema to `module.schema.ts`
2. Import and use in routes: `validate(schema)`
3. Types are inferred automatically

### Adding Middleware

1. Create in `src/middleware/`
2. Export middleware function
3. Apply in routes: `router.get('/', authenticate, authorize('role'), handler)`

---

## Key Patterns

### Service Layer Pattern
- Controllers handle HTTP (req/res)
- Services contain business logic
- Services use Prisma client directly
- Services throw AppError for errors

### Error Handling
```typescript
// In service
if (!user) throw new AppError('User not found', 404);

// In controller (wrapped with asyncHandler)
const user = await userService.getUserById(id);
return ApiResponse.success(res, user);
```

### Validation
```typescript
// schema.ts
export const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

// routes.ts
router.post('/', validate(createSchema), controller.create);
```

### Role-Based Access
```typescript
// Applied in routes
router.patch('/:id/status', 
  authenticate, 
  authorize('doctor'), 
  controller.updateStatus
);
```

---

## Testing Endpoints

### Health Check
```bash
curl http://localhost:3000/health
# {"status":"ok","timestamp":"..."}
```

### Swagger Docs
```
http://localhost:3000/api-docs
```

### Example Requests

**Register:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"John Doe","email":"john@example.com","password":"Password123!","role":"patient","phone":"+250788123456","district":"Kigali"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Password123!"}'
```

**Authenticated Request:**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Environment-Specific Notes

### Development
- `ts-node-dev` with hot reload
- Prisma Studio available
- Detailed error messages
- CORS open to localhost:3000

### Production
- Compiled JavaScript in `dist/`
- `NODE_ENV=production`
- Secure cookies for refresh tokens
- Rate limiting recommended
- Redis for refresh token blacklist
- PM2 or similar process manager

---

## Related Files

- [README.md](./README.md) - Main project documentation
- [prisma/schema.prisma](../prisma/schema.prisma) - Database schema
- [package.json](../package.json) - Dependencies and scripts
- [tsconfig.json](../tsconfig.json) - TypeScript configuration