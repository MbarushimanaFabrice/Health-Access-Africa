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

export const saveConsultationSchema = z.object({
  notes: z.string().max(10000).optional(),
  /** false (default) keeps the notes a private draft; true sends them to the patient. */
  share: z.boolean().optional().default(false),
});

export type CreateConsultationInput = z.infer<typeof createConsultationSchema>;
export type UpdateConsultationInput = z.infer<typeof updateConsultationSchema>;
export type SaveConsultationInput = z.infer<typeof saveConsultationSchema>;
