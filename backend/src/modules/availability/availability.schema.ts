import { z } from 'zod';

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format');
const timeString = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be HH:MM format');

export const createSlotsSchema = z.object({
  dates: z.array(dateString).min(1, 'Select at least one date').max(60),
  times: z.array(timeString).min(1, 'Select at least one time').max(48),
});

export type CreateSlotsInput = z.infer<typeof createSlotsSchema>;
