import { z } from 'zod';

export const createPaymentSchema = z.object({
  billId: z.string().min(1, 'Bill ID is required'),
  amountInPaise: z.number().positive('Amount must be positive'),
  paymentMode: z.enum(['cash', 'upi', 'bank_transfer']),
  paymentDate: z.string().or(z.date()),
  transactionReference: z.string().optional(),
  notes: z.string().optional(),
});

export const reversePaymentSchema = z.object({
  paymentId: z.string().min(1, 'Payment ID is required'),
  reversalReason: z.string().min(5, 'Reversal reason is required (min 5 chars)'),
});
