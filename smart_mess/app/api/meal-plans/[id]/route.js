import connectDB from '@/lib/mongodb';
import MealPlan from '@/models/MealPlan';
import { requireAuth, requireRole } from '@/lib/auth';
import { apiResponse, apiError, parseBody } from '@/lib/utils';

// GET /api/meal-plans/[id]
export async function GET(request, { params }) {
  const { error, status } = await requireAuth();
  if (error) return apiError(error, status);

  await connectDB();
  const { id } = await params;
  const mealPlan = await MealPlan.findById(id);
  if (!mealPlan) return apiError('Meal plan not found', 404);

  return apiResponse({ mealPlan });
}

// PATCH /api/meal-plans/[id]
export async function PATCH(request, { params }) {
  const { error, status } = await requireRole(['admin', 'manager']);
  if (error) return apiError(error, status);

  await connectDB();
  const { id } = await params;
  const body = await parseBody(request);
  if (!body) return apiError('Invalid request body');

  const mealPlan = await MealPlan.findByIdAndUpdate(
    id,
    { $set: body },
    { new: true, runValidators: true }
  );

  if (!mealPlan) return apiError('Meal plan not found', 404);

  return apiResponse({ mealPlan }, 'Meal plan updated successfully');
}

// DELETE /api/meal-plans/[id] - soft deactivate
export async function DELETE(request, { params }) {
  const { error, status } = await requireRole(['admin', 'manager']);
  if (error) return apiError(error, status);

  await connectDB();
  const { id } = await params;
  const mealPlan = await MealPlan.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  if (!mealPlan) return apiError('Meal plan not found', 404);

  return apiResponse({ mealPlan }, 'Meal plan deactivated successfully');
}
