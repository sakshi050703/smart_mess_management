import connectDB from '@/lib/mongodb';
import Menu from '@/models/Menu';
import Subscription from '@/models/Subscription';
import MealBooking from '@/models/MealBooking';
import Attendance from '@/models/Attendance';
import Bill from '@/models/Bill';
import Announcement from '@/models/Announcement';
import Notification from '@/models/Notification';
import { requireAuth } from '@/lib/auth';
import { startOfDay, endOfDay } from '@/lib/utils';

// GET /api/dashboard/student
export async function GET() {
  const { error, status, session } = await requireAuth();
  if (error) return Response.json({ error }, { status });

  if (session.user.role !== 'student') {
    return Response.json({ error: 'Only students can access this endpoint' }, { status: 403 });
  }

  await connectDB();

  const studentId = session.user.id;
  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    activeSubscription,
    todayMenu,
    todayBookings,
    monthAttendance,
    bills,
    announcements,
    unreadNotifications,
  ] = await Promise.all([
    // Active subscription
    Subscription.findOne({
      student: studentId,
      status: 'active',
      startDate: { $lte: todayEnd },
      endDate: { $gte: todayStart },
    }).populate('mealPlan'),

    // Today's menu
    Menu.findOne({
      date: { $gte: todayStart, $lte: todayEnd },
      isPublished: true,
    }),

    // Today's bookings for this student
    MealBooking.find({
      student: studentId,
      date: { $gte: todayStart, $lte: todayEnd },
    }),

    // Month's attendance count
    Attendance.countDocuments({
      student: studentId,
      date: { $gte: monthStart, $lte: todayEnd },
      status: 'present',
    }),

    // Unpaid/partial/overdue bills
    Bill.find({
      student: studentId,
      status: { $in: ['unpaid', 'partial', 'overdue'] },
    }).sort({ dueDate: 1 }),

    // Announcements
    Announcement.find({
      isPublished: true,
      targetRoles: { $in: ['student', 'all'] },
      $or: [{ expiresAt: null }, { expiresAt: { $gt: today } }],
    }).sort({ pinned: -1, createdAt: -1 }).limit(4),

    // Unread notifications
    Notification.countDocuments({
      user: studentId,
      isRead: false,
    }),
  ]);

  // Outstanding amount in paise
  const pendingAmountInPaise = bills.reduce((acc, b) => acc + (b.balanceAmountInPaise || 0), 0);

  // Map today's booking status
  const bookingStatusByMeal = {
    breakfast: todayBookings.find(b => b.mealType === 'breakfast')?.status || 'none',
    lunch: todayBookings.find(b => b.mealType === 'lunch')?.status || 'none',
    snacks: todayBookings.find(b => b.mealType === 'snacks')?.status || 'none',
    dinner: todayBookings.find(b => b.mealType === 'dinner')?.status || 'none',
  };

  return Response.json({
    success: true,
    data: {
      activeSubscription,
      todayMenu,
      bookingStatusByMeal,
      monthAttendance,
      pendingBillsCount: bills.length,
      pendingAmountInPaise,
      nextDueDate: bills[0]?.dueDate || null,
      announcements,
      unreadNotifications,
    },
  });
}
