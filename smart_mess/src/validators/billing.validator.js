import { z } from 'zod';

export const createBillSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  subscriptionId: z.string().optional(),
  billingPeriodStart: z.string().or(z.date()),
  billingPeriodEnd: z.string().or(z.date()),
  billingPeriodLabel: z.string().optional(),
  totalAmountInPaise: z.number().positive('Amount must be positive'),
  dueDate: z.string().or(z.date()),
  notes: z.string().optional(),
});

export const updateBillSchema = z.object({
  notes: z.string().optional(),
  dueDate: z.string().or(z.date()).optional(),
  status: z.enum(['unpaid', 'partial', 'paid', 'overdue', 'waived']).optional(),
});
