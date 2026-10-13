import connectDB from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import MealBooking from '@/models/MealBooking';
import { requireAuth, requireRole } from '@/lib/auth';
import { apiResponse, apiError, parseBody, getSearchParams, paginationMeta } from '@/lib/utils';
import { startOfDay, endOfDay } from 'date-fns';

// GET /api/attendance
export async function GET(request) {
  const { error, status, session } = await requireAuth();
  if (error) return apiError(error, status);

  await connectDB();
  const params = getSearchParams(request);
  const page = parseInt(params.get('page') || '1');
  const limit = parseInt(params.get('limit') || '30');
  const skip = (page - 1) * limit;

  const filter = {};
  if (session.user.role === 'student') {
    filter.student = session.user.id;
  } else {
    const student = params.get('student');
    if (student) filter.student = student;
  }

  const mealType = params.get('mealType');
  if (mealType) filter.mealType = mealType;

  const dateParam = params.get('date');
  if (dateParam) {
    const targetDate = new Date(dateParam);
    filter.date = {
      $gte: startOfDay(targetDate),
      $lte: endOfDay(targetDate),
    };
  }

  const attendanceStatus = params.get('status');
  if (attendanceStatus) filter.status = attendanceStatus;

  const [records, total] = await Promise.all([
    Attendance.find(filter)
      .populate('student', 'name email studentId')
      .populate('markedBy', 'name role')
      .sort({ date: -1, mealType: 1 })
      .skip(skip)
      .limit(limit),
    Attendance.countDocuments(filter),
  ]);

  return apiResponse({ records, pagination: paginationMeta(total, page, limit) });
}

// POST /api/attendance
export async function POST(request) {
  const { error, status, session } = await requireRole(['admin', 'manager', 'kitchen']);
  if (error) return apiError(error, status);

  await connectDB();
  const body = await parseBody(request);
  if (!body) return apiError('Invalid request body');

  const { studentId, date, mealType, status: attendanceStatus = 'present', notes } = body;

  if (!studentId || !date || !mealType) {
    return apiError('studentId, date, and mealType are required', 400);
  }

  const attendanceDate = startOfDay(new Date(date));

  // Find booking if exists
  const booking = await MealBooking.findOne({
    student: studentId,
    date: { $gte: attendanceDate, $lte: endOfDay(attendanceDate) },
    mealType,
  });

  const record = await Attendance.findOneAndUpdate(
    {
      student: studentId,
      date: attendanceDate,
      mealType,
    },
    {
      $set: {
        booking: booking?._id,
        status: attendanceStatus,
        markedBy: session.user.id,
        servedAt: attendanceStatus === 'present' ? new Date() : null,
        notes: notes || '',
      },
    },
    { upsert: true, new: true, runValidators: true }
  ).populate('student', 'name email studentId');

  return apiResponse({ record }, 'Attendance marked successfully', 201);
}
