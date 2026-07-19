import { z } from 'zod';

export const createHealthInfoSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().min(10),
  category: z.string().max(100).optional(),
  status: z.enum(['draft', 'published']).optional(),
});

export const updateHealthInfoSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  content: z.string().min(10).optional(),
  category: z.string().max(100).optional(),
  status: z.enum(['draft', 'published']).optional(),
});

export type CreateHealthInfoInput = z.infer<typeof createHealthInfoSchema>;
export type UpdateHealthInfoInput = z.infer<typeof updateHealthInfoSchema>;
