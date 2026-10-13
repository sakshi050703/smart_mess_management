import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'manager', 'kitchen', 'student']).optional(),
  phone: z.string().optional(),
  studentId: z.string().optional(),
  rollNumber: z.string().optional(),
  department: z.string().optional(),
  course: z.string().optional(),
  year: z.number().min(1).max(6).optional(),
  roomNumber: z.string().optional(),
  hostel: z.string().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  rollNumber: z.string().optional(),
  department: z.string().optional(),
  course: z.string().optional(),
  year: z.number().min(1).max(6).optional(),
  roomNumber: z.string().optional(),
  hostel: z.string().optional(),
  isActive: z.boolean().optional(),
});
