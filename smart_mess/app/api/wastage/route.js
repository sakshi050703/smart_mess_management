import connectDB from '@/lib/mongodb';
import FoodWastage from '@/models/FoodWastage';
import { requireAuth, requireRole } from '@/lib/auth';
import { apiResponse, apiError, parseBody, getSearchParams, paginationMeta } from '@/lib/utils';
import { startOfDay, endOfDay } from 'date-fns';

// GET /api/wastage
export async function GET(request) {
  const { error, status } = await requireRole(['admin', 'manager', 'kitchen']);
  if (error) return apiError(error, status);

  await connectDB();
  const params = getSearchParams(request);
  const page = parseInt(params.get('page') || '1');
  const limit = parseInt(params.get('limit') || '20');
  const skip = (page - 1) * limit;

  const filter = {};
  const mealType = params.get('mealType');
  if (mealType) filter.mealType = mealType;

  const startDate = params.get('startDate');
  const endDate = params.get('endDate');
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = startOfDay(new Date(startDate));
    if (endDate) filter.date.$lte = endOfDay(new Date(endDate));
  }

  const [wastageList, total] = await Promise.all([
    FoodWastage.find(filter)
      .populate('recordedBy', 'name role')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit),
    FoodWastage.countDocuments(filter),
  ]);

  return apiResponse({ wastage: wastageList, pagination: paginationMeta(total, page, limit) });
}

// POST /api/wastage
export async function POST(request) {
  const { error, status, session } = await requireRole(['admin', 'manager', 'kitchen']);
  if (error) return apiError(error, status);

  await connectDB();
  const body = await parseBody(request);
  if (!body) return apiError('Invalid request body');

  const {
    date = new Date(),
    mealType,
    items = [],
    totalQuantityKg = 0,
    estimatedValueInPaise = 0,
    preparedQuantity = 0,
    servedQuantity = 0,
    notes = '',
  } = body;

  if (!mealType) {
    return apiError('mealType is required', 400);
  }

  const wastage = await FoodWastage.create({
    date: new Date(date),
    mealType,
    items,
    totalQuantityKg: Number(totalQuantityKg),
    estimatedValueInPaise: Number(estimatedValueInPaise),
    preparedQuantity: Number(preparedQuantity),
    servedQuantity: Number(servedQuantity),
    notes,
    recordedBy: session.user.id,
  });

  return apiResponse({ wastage }, 'Food wastage recorded successfully', 201);
}
