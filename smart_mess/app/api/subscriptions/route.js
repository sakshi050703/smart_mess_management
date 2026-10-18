import connectDB from '@/lib/mongodb';
import Subscription from '@/models/Subscription';
import MealPlan from '@/models/MealPlan';
import Bill from '@/models/Bill';
import { requireRole, requireAuth } from '@/lib/auth';
import { apiResponse, apiError, parseBody, getSearchParams, paginationMeta } from '@/lib/utils';

// GET /api/subscriptions
export async function GET(request) {
  const { error, status, session } = await requireAuth();
  if (error) return apiError(error, status);

  await connectDB();
  const params = getSearchParams(request);
  const page = parseInt(params.get('page') || '1');
  const limit = parseInt(params.get('limit') || '20');
  const skip = (page - 1) * limit;

  const filter = {};
  // Students can only see their own subscriptions
  if (session.user.role === 'student') {
    filter.student = session.user.id;
  } else {
    const studentId = params.get('student');
    if (studentId) filter.student = studentId;
    const status2 = params.get('status');
    if (status2) filter.status = status2;
  }

  const [subs, total] = await Promise.all([
    Subscription.find(filter).populate('student', 'name email studentId').populate('mealPlan').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Subscription.countDocuments(filter),
  ]);

  return apiResponse({ subscriptions: subs, pagination: paginationMeta(total, page, limit) });
}

// POST /api/subscriptions — admin/manager creates subscription
export async function POST(request) {
  const { error, status, session } = await requireRole(['admin', 'manager']);
  if (error) return apiError(error, status);

  await connectDB();
  const body = await parseBody(request);
  if (!body) return apiError('Invalid request body');

  const { studentId, mealPlanId, startDate, endDate, notes } = body;
  if (!studentId || !mealPlanId || !startDate || !endDate) {
    return apiError('studentId, mealPlanId, startDate, endDate are required');
  }

  const plan = await MealPlan.findById(mealPlanId);
  if (!plan) return apiError('Meal plan not found', 404);

  // Check for overlapping active subscription
  const overlap = await Subscription.findOne({
    student: studentId,
    status: 'active',
    $or: [
      { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } },
    ],
  });
  if (overlap) return apiError('Student already has an active subscription for this period', 409);

  const subscription = await Subscription.create({
    student: studentId,
    mealPlan: mealPlanId,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    priceInPaise: plan.priceInPaise,
    notes,
    createdBy: session.user.id,
  });

  // Auto-generate bill
  const start = new Date(startDate);
  const bill = await Bill.create({
    student: studentId,
    subscription: subscription._id,
    billingPeriod: {
      startDate: start,
      endDate: new Date(endDate),
      label: start.toLocaleString('default', { month: 'long', year: 'numeric' }),
    },
    totalAmountInPaise: plan.priceInPaise,
    paidAmountInPaise: 0,
    dueDate: new Date(new Date(endDate).getTime() + 7 * 24 * 60 * 60 * 1000),
    generatedBy: session.user.id,
  });

  return apiResponse({ subscription, bill }, 'Subscription created and bill generated', 201);
}
