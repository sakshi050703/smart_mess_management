import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { requireAuth } from '@/lib/auth';
import { apiResponse, apiError, parseBody, getSearchParams, paginationMeta } from '@/lib/utils';

// GET /api/notifications
export async function GET(request) {
  const { error, status, session } = await requireAuth();
  if (error) return apiError(error, status);

  await connectDB();
  const params = getSearchParams(request);
  const page = parseInt(params.get('page') || '1');
  const limit = parseInt(params.get('limit') || '20');
  const unread = params.get('unread');
  const skip = (page - 1) * limit;

  const filter = { recipient: session.user.id };
  if (unread === 'true') filter.isRead = false;

  const [notifications, total] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
  ]);

  return apiResponse({ notifications, pagination: paginationMeta(total, page, limit) });
}

// POST /api/notifications — mark as read or create
export async function POST(request) {
  const { error, status, session } = await requireAuth();
  if (error) return apiError(error, status);

  await connectDB();
  const body = await parseBody(request);

  if (body?.markAllRead) {
    await Notification.updateMany({ recipient: session.user.id, isRead: false }, { $set: { isRead: true, readAt: new Date() } });
    return apiResponse({}, 'All notifications marked as read');
  }

  if (body?.markRead && body?.id) {
    const notif = await Notification.findOneAndUpdate(
      { _id: body.id, recipient: session.user.id },
      { $set: { isRead: true, readAt: new Date() } },
      { new: true }
    );
    return apiResponse({ notification: notif });
  }

  return apiError('Invalid action');
}
