import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { requireRole, requireAuth } from '@/lib/auth';
import { apiResponse, apiError, parseBody, getSearchParams, paginationMeta } from '@/lib/utils';
import { registerSchema, updateUserSchema } from '@/validators/auth.validator';

// GET /api/users — list all users (admin/manager)
export async function GET(request) {
  const { error, status, session } = await requireRole(['admin', 'manager']);
  if (error) return apiError(error, status);

  await connectDB();
  const params = getSearchParams(request);
  const page = parseInt(params.get('page') || '1');
  const limit = parseInt(params.get('limit') || '20');
  const role = params.get('role') || '';
  const search = params.get('search') || '';
  const isActive = params.get('isActive');
  const skip = (page - 1) * limit;

  const filter = {};
  if (role) filter.role = role;
  if (isActive !== null && isActive !== '') filter.isActive = isActive === 'true';
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { studentId: { $regex: search, $options: 'i' } },
      { rollNumber: { $regex: search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return apiResponse({ users, pagination: paginationMeta(total, page, limit) });
}

// POST /api/users — create a new user (admin only)
export async function POST(request) {
  const { error, status, session } = await requireRole(['admin']);
  if (error) return apiError(error, status);

  await connectDB();
  const body = await parseBody(request);
  if (!body) return apiError('Invalid request body');

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return apiError('Validation failed', 400, parsed.error.flatten().fieldErrors);

  const existing = await User.findOne({ email: parsed.data.email });
  if (existing) return apiError('Email already in use', 409);

  const user = await User.create(parsed.data);
  return apiResponse({ user: { ...user.toObject(), password: undefined } }, 'User created successfully', 201);
}
