import { z } from 'zod';

export const createConsultationSchema = z.object({
  appointmentId: z.string().uuid('Invalid appointment ID'),
  notes: z.string().optional(),
  status: z
    .enum(['not_started', 'in_progress', 'completed'])
    .optional()
    .default('not_started'),
});

export const updateConsultationSchema = z.object({
  notes: z.string().optional(),
  status: z.enum(['not_started', 'in_progress', 'completed']).optional(),
});

export type CreateConsultationInput = z.infer<typeof createConsultationSchema>;
export type UpdateConsultationInput = z.infer<typeof updateConsultationSchema>;
