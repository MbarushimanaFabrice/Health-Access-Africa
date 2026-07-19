import { z } from 'zod';

export const createDoctorSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(150),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(20).optional(),
  district: z.string().max(100).optional(),
  specialty: z.string().max(150).optional(),
  hospital: z.string().max(150).optional(),
  yearsExperience: z.number().int().min(0).max(70).optional(),
  temporaryPassword: z
    .string()
    .min(8, 'Temporary password must be at least 8 characters')
    .regex(/[A-Z]/, 'Temporary password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Temporary password must contain at least one number')
    .optional(),
});

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;
