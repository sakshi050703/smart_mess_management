import connectDB from '@/lib/mongodb';
import MealBooking from '@/models/MealBooking';
import Menu from '@/models/Menu';
import Subscription from '@/models/Subscription';
import { requireAuth } from '@/lib/auth';
import { apiResponse, apiError, parseBody, getSearchParams, startOfDay, endOfDay } from '@/lib/utils';

// GET /api/meal-bookings
export async function GET(request) {
  const { error, status, session } = await requireAuth();
  if (error) return apiError(error, status);

  await connectDB();
  const params = getSearchParams(request);
  const date = params.get('date');

  const filter = {};
  if (session.user.role === 'student') {
    filter.student = session.user.id;
  } else {
    const studentId = params.get('student');
    if (studentId) filter.student = studentId;
  }

  if (date) {
    filter.date = { $gte: startOfDay(date), $lte: endOfDay(date) };
  }

  const bookings = await MealBooking.find(filter).populate('student', 'name studentId').sort({ date: -1, mealType: 1 }).limit(100);
  return apiResponse({ bookings });
}

// POST /api/meal-bookings — create or update booking
export async function POST(request) {
  const { error, status, session } = await requireAuth();
  if (error) return apiError(error, status);

  await connectDB();
  const body = await parseBody(request);
  if (!body) return apiError('Invalid request body');

  const { date, mealType, action } = body;
  const isSkip = action === 'skip' || body.status === 'skipped';
  if (!date || !mealType) return apiError('date and mealType are required');

  // Determine student
  const studentId = session.user.role === 'student' ? session.user.id : body.studentId;
  if (!studentId) return apiError('studentId is required');

  // Check active subscription
  const bookingDate = new Date(date);
  const activeSub = await Subscription.findOne({
    student: studentId,
    status: 'active',
    startDate: { $lte: bookingDate },
    endDate: { $gte: bookingDate },
  });
  if (!activeSub) return apiError('No active subscription for this date', 400);

  // Check menu & cutoff time
  const menu = await Menu.findOne({ date: { $gte: startOfDay(date), $lte: endOfDay(date) }, isPublished: true });
  if (!menu) return apiError('No published menu for this date', 400);

  const meal = menu.meals.find(m => m.mealType === mealType || m.type === mealType);
  if (meal && meal.isEnabled === false) return apiError('This meal is not available', 400);

  // Check cutoff time
  const now = new Date();
  if (meal && meal.cutoffTime && session.user.role === 'student') {
    const [cutH, cutM] = meal.cutoffTime.split(':').map(Number);
    const cutoff = new Date(bookingDate);
    cutoff.setHours(cutH, cutM, 0, 0);
    const isToday = bookingDate.toDateString() === now.toDateString();
    if (isToday && now > cutoff) {
      return apiError(`Booking cutoff for ${mealType} has passed (${meal.cutoffTime})`, 400);
    }
  }

  // Upsert booking
  const booking = await MealBooking.findOneAndUpdate(
    { student: studentId, date: { $gte: startOfDay(date), $lte: endOfDay(date) }, mealType },
    {
      student: studentId,
      subscription: activeSub._id,
      date: startOfDay(date),
      mealType,
      status: isSkip ? 'skipped' : 'confirmed',
      skippedAt: isSkip ? new Date() : undefined,
    },
    { upsert: true, new: true }
  );

  return apiResponse({ booking }, `Meal ${isSkip ? 'skipped' : 'booked'} successfully`, 201);
}
