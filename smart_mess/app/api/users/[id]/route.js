import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { requireRole } from '@/lib/auth';
import { apiResponse, apiError, parseBody } from '@/lib/utils';
import { updateUserSchema } from '@/validators/auth.validator';

// GET /api/users/[id]
export async function GET(request, { params }) {
  const { error, status } = await requireRole(['admin', 'manager']);
  if (error) return apiError(error, status);

  await connectDB();
  const user = await User.findById(params.id).select('-password');
  if (!user) return apiError('User not found', 404);

  return apiResponse({ user });
}

// PATCH /api/users/[id]
export async function PATCH(request, { params }) {
  const { error, status, session } = await requireRole(['admin', 'manager']);
  if (error) return apiError(error, status);

  await connectDB();
  const body = await parseBody(request);
  if (!body) return apiError('Invalid request body');

  // Only admin can change roles
  if (body.role && session.user.role !== 'admin') {
    return apiError('Only admin can change user roles', 403);
  }

  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) return apiError('Validation failed', 400, parsed.error.flatten().fieldErrors);

  const user = await User.findByIdAndUpdate(params.id, { $set: parsed.data }, { new: true, runValidators: true }).select('-password');
  if (!user) return apiError('User not found', 404);

  return apiResponse({ user }, 'User updated');
}

// DELETE /api/users/[id] — deactivate only (admin only)
export async function DELETE(request, { params }) {
  const { error, status } = await requireRole(['admin']);
  if (error) return apiError(error, status);

  await connectDB();
  const user = await User.findByIdAndUpdate(params.id, { $set: { isActive: false } }, { new: true }).select('-password');
  if (!user) return apiError('User not found', 404);

  return apiResponse({ user }, 'User deactivated');
}
