import { z } from 'zod';

export const updatePatientProfileSchema = z.object({
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
    .optional(),
  gender: z.string().max(20).optional(),
  allergies: z.string().optional(),
  chronicConditions: z.string().optional(),
  notes: z.string().optional(),
  // Allow updating base user fields too
  fullName: z.string().min(2).max(150).optional(),
  phone: z.string().max(20).optional(),
  district: z.string().max(100).optional(),
});

export type UpdatePatientProfileInput = z.infer<typeof updatePatientProfileSchema>;
