import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { setupSwagger } from './config/swagger';
import { errorHandler } from './middleware/error.middleware';

// Route imports
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import appointmentsRoutes from './modules/appointments/appointments.routes';
import consultationsRoutes from './modules/consultations/consultations.routes';
import patientsRoutes from './modules/patients/patients.routes';
import healthInfoRoutes from './modules/health-info/health-info.routes';
import notificationsRoutes from './modules/notifications/notifications.routes';
import adminRoutes from './modules/admin/admin.routes';

const app = express();

// ─── Global Middleware ──────────────────────────────────────────────────────
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Swagger Documentation ──────────────────────────────────────────────────
setupSwagger(app);

// ─── Health Check ───────────────────────────────────────────────────────────
/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Server health check
 *     security: []
 *     responses:
 *       200:
 *         description: Server is running
 */
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Health Access Africa API is running 🏥',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// ─── API Routes ─────────────────────────────────────────────────────────────
// /api/auth is intentionally exempt from requirePasswordChange — a user with
// mustChangePassword=true must still be able to call /auth/me and
// /auth/change-password. Every other router applies authenticate then
// requirePasswordChange per-route (see each *.routes.ts file).
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/consultations', consultationsRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/health-info', healthInfoRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/admin', adminRoutes);

// ─── 404 Handler ────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
