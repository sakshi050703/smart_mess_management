import connectDB from '@/lib/mongodb';
import Menu from '@/models/Menu';
import { requireRole } from '@/lib/auth';
import { apiResponse, apiError, parseBody } from '@/lib/utils';

export async function GET(request, { params }) {
  await connectDB();
  const menu = await Menu.findById(params.id).populate('createdBy', 'name');
  if (!menu) return apiError('Menu not found', 404);
  return apiResponse({ menu });
}

export async function PATCH(request, { params }) {
  const { error, status, session } = await requireRole(['admin', 'manager']);
  if (error) return apiError(error, status);
  await connectDB();
  const body = await parseBody(request);
  const menu = await Menu.findByIdAndUpdate(params.id, { $set: { ...body, updatedBy: session.user.id } }, { new: true });
  if (!menu) return apiError('Menu not found', 404);
  return apiResponse({ menu }, 'Menu updated');
}

export async function DELETE(request, { params }) {
  const { error, status } = await requireRole(['admin']);
  if (error) return apiError(error, status);
  await connectDB();
  await Menu.findByIdAndDelete(params.id);
  return apiResponse({}, 'Menu deleted');
}
