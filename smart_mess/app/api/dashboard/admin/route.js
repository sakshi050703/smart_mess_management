import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Subscription from '@/models/Subscription';
import Bill from '@/models/Bill';
import MealBooking from '@/models/MealBooking';
import Attendance from '@/models/Attendance';
import FoodWastage from '@/models/FoodWastage';
import Complaint from '@/models/Complaint';
import { requireRole } from '@/lib/auth';
import { startOfDay, endOfDay } from '@/lib/utils';

export async function GET() {
  const { error, status } = await requireRole(['admin', 'manager']);
  if (error) return Response.json({ error }, { status });

  await connectDB();

  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [
    totalStudents,
    activeSubscriptions,
    expiredSubscriptions,
    todayBookings,
    todayAttendance,
    unpaidBills,
    overdueAmount,
    paidThisMonth,
    openComplaints,
    todayWastage,
    expiringSubscriptions,
  ] = await Promise.all([
    User.countDocuments({ role: 'student', isActive: true }),
    Subscription.countDocuments({ status: 'active' }),
    Subscription.countDocuments({ status: 'expired' }),
    MealBooking.countDocuments({ date: { $gte: todayStart, $lte: todayEnd }, status: 'confirmed' }),
    Attendance.countDocuments({ date: { $gte: todayStart, $lte: todayEnd }, status: 'present' }),
    Bill.countDocuments({ status: { $in: ['unpaid', 'overdue', 'partial'] } }),
    Bill.aggregate([{ $match: { status: { $in: ['unpaid', 'overdue'] } } }, { $group: { _id: null, total: { $sum: '$balanceAmountInPaise' } } }]),
    Bill.aggregate([{ $match: { status: 'paid', updatedAt: { $gte: monthStart, $lte: monthEnd } } }, { $group: { _id: null, total: { $sum: '$totalAmountInPaise' } } }]),
    Complaint.countDocuments({ status: { $in: ['open', 'in_progress'] } }),
    FoodWastage.aggregate([{ $match: { date: { $gte: todayStart, $lte: todayEnd } } }, { $group: { _id: null, total: { $sum: '$totalQuantityKg' } } }]),
    Subscription.countDocuments({ status: 'active', endDate: { $lte: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) } }),
  ]);

  // Today's bookings by meal type
  const bookingsByMeal = await MealBooking.aggregate([
    { $match: { date: { $gte: todayStart, $lte: todayEnd } } },
    { $group: { _id: '$mealType', confirmed: { $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] } }, skipped: { $sum: { $cond: [{ $eq: ['$status', 'skipped'] }, 1, 0] } } } },
  ]);

  // Weekly attendance trend
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const weeklyAttendance = await Attendance.aggregate([
    { $match: { date: { $gte: sevenDaysAgo }, status: 'present' } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  return Response.json({
    success: true,
    data: {
      totalStudents,
      activeSubscriptions,
      expiredSubscriptions,
      expiringSubscriptions,
      todayBookings,
      todayAttendance,
      unpaidBills,
      openComplaints,
      totalOutstandingPaise: overdueAmount[0]?.total || 0,
      paidThisMonthPaise: paidThisMonth[0]?.total || 0,
      todayWastageKg: todayWastage[0]?.total || 0,
      bookingsByMeal,
      weeklyAttendance,
    },
  });
}
