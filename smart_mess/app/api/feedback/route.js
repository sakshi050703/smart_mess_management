import connectDB from '@/lib/mongodb';
import Feedback from '@/models/Feedback';
import { requireAuth } from '@/lib/auth';
import { apiResponse, apiError, parseBody, getSearchParams, paginationMeta } from '@/lib/utils';

// GET /api/feedback
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

  const category = params.get('category');
  if (category) filter.category = category;

  const rating = params.get('rating');
  if (rating) filter.rating = Number(rating);

  const [feedbackList, total] = await Promise.all([
    Feedback.find(filter)
      .populate('student', 'name email studentId')
      .populate('respondedBy', 'name role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Feedback.countDocuments(filter),
  ]);

  return apiResponse({ feedback: feedbackList, pagination: paginationMeta(total, page, limit) });
}

// POST /api/feedback — student submits
export async function POST(request) {
  const { error, status, session } = await requireAuth();
  if (error) return apiError(error, status);

  await connectDB();
  const body = await parseBody(request);
  if (!body) return apiError('Invalid request body');

  const { rating, comment, mealType, category = 'general' } = body;
  if (!rating || rating < 1 || rating > 5) {
    return apiError('Rating between 1 and 5 is required', 400);
  }

  const feedback = await Feedback.create({
    student: session.user.id,
    rating: Number(rating),
    comment: comment || '',
    mealType: mealType || undefined,
    category,
    date: new Date(),
  });

  return apiResponse({ feedback }, 'Feedback submitted successfully', 201);
}

// PATCH /api/feedback — manager response
export async function PATCH(request) {
  const { error, status, session } = await requireAuth();
  if (error) return apiError(error, status);

  if (session.user.role !== 'admin' && session.user.role !== 'manager') {
    return apiError('Forbidden', 403);
  }

  await connectDB();
  const body = await parseBody(request);
  if (!body || !body.feedbackId || !body.managerResponse) {
    return apiError('feedbackId and managerResponse are required', 400);
  }

  const feedback = await Feedback.findByIdAndUpdate(
    body.feedbackId,
    {
      managerResponse: body.managerResponse,
      respondedBy: session.user.id,
      respondedAt: new Date(),
    },
    { new: true }
  ).populate('student', 'name email studentId');

  if (!feedback) return apiError('Feedback not found', 404);

  return apiResponse({ feedback }, 'Response added successfully');
}
