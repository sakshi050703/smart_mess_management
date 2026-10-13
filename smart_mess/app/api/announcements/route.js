import connectDB from '@/lib/mongodb';
import Announcement from '@/models/Announcement';
import { requireAuth, requireRole } from '@/lib/auth';
import { apiResponse, apiError, parseBody, getSearchParams } from '@/lib/utils';

// GET /api/announcements
export async function GET(request) {
  const { error, status, session } = await requireAuth();
  if (error) return apiError(error, status);

  await connectDB();
  const filter = {};

  if (session.user.role === 'student' || session.user.role === 'kitchen') {
    filter.isPublished = true;
    filter.targetRoles = { $in: [session.user.role, 'all'] };
    filter.$or = [
      { expiresAt: { $exists: false } },
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } },
    ];
  }

  const announcements = await Announcement.find(filter)
    .populate('createdBy', 'name role')
    .sort({ pinned: -1, createdAt: -1 });

  return apiResponse({ announcements });
}

// POST /api/announcements
export async function POST(request) {
  const { error, status, session } = await requireRole(['admin', 'manager']);
  if (error) return apiError(error, status);

  await connectDB();
  const body = await parseBody(request);
  if (!body) return apiError('Invalid request body');

  const { title, content, type = 'general', targetRoles = ['all'], isPublished = true, pinned = false, expiresAt } = body;
  if (!title || !content) {
    return apiError('Title and content are required', 400);
  }

  const announcement = await Announcement.create({
    title,
    content,
    type,
    targetRoles,
    isPublished,
    publishedAt: isPublished ? new Date() : null,
    pinned: Boolean(pinned),
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    createdBy: session.user.id,
  });

  return apiResponse({ announcement }, 'Announcement created successfully', 201);
}

// PATCH /api/announcements
export async function PATCH(request) {
  const { error, status } = await requireRole(['admin', 'manager']);
  if (error) return apiError(error, status);

  await connectDB();
  const body = await parseBody(request);
  if (!body || !body.id) {
    return apiError('Announcement id is required', 400);
  }

  const { id, ...updates } = body;
  if (updates.isPublished && !updates.publishedAt) {
    updates.publishedAt = new Date();
  }

  const announcement = await Announcement.findByIdAndUpdate(id, { $set: updates }, { new: true });
  if (!announcement) return apiError('Announcement not found', 404);

  return apiResponse({ announcement }, 'Announcement updated successfully');
}

// DELETE /api/announcements
export async function DELETE(request) {
  const { error, status } = await requireRole(['admin', 'manager']);
  if (error) return apiError(error, status);

  await connectDB();
  const params = getSearchParams(request);
  const id = params.get('id');
  if (!id) return apiError('Announcement id is required', 400);

  const announcement = await Announcement.findByIdAndDelete(id);
  if (!announcement) return apiError('Announcement not found', 404);

  return apiResponse({ announcement }, 'Announcement deleted successfully');
}
