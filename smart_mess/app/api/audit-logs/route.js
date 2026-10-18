import connectDB from '@/lib/mongodb';
import AuditLog from '@/models/AuditLog';
import { requireRole } from '@/lib/auth';
import { apiResponse, apiError, getSearchParams, paginationMeta } from '@/lib/utils';

// GET /api/audit-logs (admin only)
export async function GET(request) {
  const { error, status } = await requireRole(['admin']);
  if (error) return apiError(error, status);

  await connectDB();
  const params = getSearchParams(request);
  const page = parseInt(params.get('page') || '1');
  const limit = parseInt(params.get('limit') || '30');
  const skip = (page - 1) * limit;

  const filter = {};
  const action = params.get('action');
  if (action) filter.action = action;

  const entity = params.get('entity');
  if (entity) filter.entity = entity;

  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .populate('performedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    AuditLog.countDocuments(filter),
  ]);

  return apiResponse({ logs, pagination: paginationMeta(total, page, limit) });
}
