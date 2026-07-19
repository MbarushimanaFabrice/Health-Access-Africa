import { z } from 'zod';

export const createAppointmentSchema = z.object({
  doctorId: z.string().uuid('Invalid doctor ID'),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  appointmentTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be HH:MM format'),
  reason: z.string().max(500).optional(),
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(['confirmed', 'cancelled', 'completed'], {
    errorMap: () => ({
      message: 'Status must be confirmed, cancelled, or completed',
    }),
  }),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentStatusInput = z.infer<typeof updateAppointmentStatusSchema>;
