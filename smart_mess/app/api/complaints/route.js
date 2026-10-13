import connectDB from '@/lib/mongodb';
import Complaint from '@/models/Complaint';
import { requireAuth } from '@/lib/auth';
import { apiResponse, apiError, parseBody, getSearchParams, paginationMeta } from '@/lib/utils';

// GET /api/complaints
export async function GET(request) {
  const { error, status, session } = await requireAuth();
  if (error) return apiError(error, status);

  await connectDB();
  const params = getSearchParams(request);
  const page = parseInt(params.get('page') || '1');
  const limit = parseInt(params.get('limit') || '20');
  const skip = (page - 1) * limit;

  const filter = {};
  if (session.user.role === 'student') {
    filter.student = session.user.id;
  }

  const complaintStatus = params.get('status');
  if (complaintStatus) filter.status = complaintStatus;

  const priority = params.get('priority');
  if (priority) filter.priority = priority;

  const category = params.get('category');
  if (category) filter.category = category;

  const [complaints, total] = await Promise.all([
    Complaint.find(filter)
      .populate('student', 'name email studentId')
      .populate('resolvedBy', 'name role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Complaint.countDocuments(filter),
  ]);

  return apiResponse({ complaints, pagination: paginationMeta(total, page, limit) });
}

// POST /api/complaints — student submits
export async function POST(request) {
  const { error, status, session } = await requireAuth();
  if (error) return apiError(error, status);

  await connectDB();
  const body = await parseBody(request);
  if (!body) return apiError('Invalid request body');

  const { title, description, category = 'other', priority = 'medium' } = body;
  if (!title || !description) {
    return apiError('Title and description are required', 400);
  }

  const complaint = await Complaint.create({
    student: session.user.id,
    title,
    description,
    category,
    priority,
    status: 'open',
  });

  return apiResponse({ complaint }, 'Complaint submitted successfully', 201);
}

// PATCH /api/complaints — admin/manager updates status & resolution
export async function PATCH(request) {
  const { error, status, session } = await requireAuth();
  if (error) return apiError(error, status);

  if (session.user.role !== 'admin' && session.user.role !== 'manager') {
    return apiError('Forbidden', 403);
  }

  await connectDB();
  const body = await parseBody(request);
  if (!body || !body.id) {
    return apiError('Complaint id is required', 400);
  }

  const updateFields = {};
  if (body.status) {
    updateFields.status = body.status;
    if (body.status === 'resolved' || body.status === 'closed') {
      updateFields.resolvedBy = session.user.id;
      updateFields.resolvedAt = new Date();
    }
  }
  if (body.resolution !== undefined) updateFields.resolution = body.resolution;
  if (body.managerNotes !== undefined) updateFields.managerNotes = body.managerNotes;
  if (body.priority) updateFields.priority = body.priority;

  const complaint = await Complaint.findByIdAndUpdate(
    body.id,
    { $set: updateFields },
    { new: true }
  ).populate('student', 'name email studentId');

  if (!complaint) return apiError('Complaint not found', 404);

  return apiResponse({ complaint }, 'Complaint updated successfully');
}
