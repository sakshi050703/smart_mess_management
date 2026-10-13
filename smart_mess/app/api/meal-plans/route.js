import connectDB from '@/lib/mongodb';
import MealPlan from '@/models/MealPlan';
import { requireAuth, requireRole } from '@/lib/auth';
import { apiResponse, apiError, parseBody, getSearchParams } from '@/lib/utils';

// GET /api/meal-plans
export async function GET(request) {
  const { error, status } = await requireAuth();
  if (error) return apiError(error, status);

  await connectDB();
  const params = getSearchParams(request);
  const activeOnly = params.get('activeOnly') === 'true';

  const filter = {};
  if (activeOnly) filter.isActive = true;

  const mealPlans = await MealPlan.find(filter).sort({ priceInPaise: 1 });
  return apiResponse({ mealPlans });
}

// POST /api/meal-plans
export async function POST(request) {
  const { error, status, session } = await requireRole(['admin', 'manager']);
  if (error) return apiError(error, status);

  await connectDB();
  const body = await parseBody(request);
  if (!body) return apiError('Invalid request body');

  const { name, description, durationDays, includedMeals, priceInPaise, isActive } = body;

  if (!name || !durationDays || priceInPaise === undefined) {
    return apiError('Name, durationDays, and priceInPaise are required', 400);
  }

  const mealPlan = await MealPlan.create({
    name,
    description: description || '',
    durationDays: Number(durationDays),
    includedMeals: includedMeals || { breakfast: true, lunch: true, snacks: false, dinner: true },
    priceInPaise: Number(priceInPaise),
    isActive: isActive !== undefined ? isActive : true,
    createdBy: session.user.id,
  });

  return apiResponse({ mealPlan }, 'Meal plan created successfully', 201);
}
