import { z } from 'zod';

export const menuItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  description: z.string().optional(),
  isVeg: z.boolean().default(true),
  calories: z.number().optional(),
});

export const mealSchema = z.object({
  type: z.enum(['breakfast', 'lunch', 'snacks', 'dinner']),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  cutoffTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  items: z.array(menuItemSchema).min(1, 'Add at least one item'),
  isEnabled: z.boolean().default(true),
});

export const createMenuSchema = z.object({
  date: z.string().or(z.date()),
  meals: z.array(mealSchema).min(1, 'Add at least one meal'),
  isPublished: z.boolean().default(false),
  notes: z.string().optional(),
});
