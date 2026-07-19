import { z } from 'zod';

export const updateMeSchema = z.object({
  fullName: z.string().min(2).max(150).optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().max(20).optional(),
  district: z.string().max(100).optional(),
  specialty: z.string().max(150).optional(),
  hospital: z.string().max(150).optional(),
  bio: z.string().max(1000).optional(),
  yearsExperience: z.number().int().min(0).max(70).optional(),
});

export type UpdateMeInput = z.infer<typeof updateMeSchema>;
