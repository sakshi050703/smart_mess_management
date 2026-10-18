import connectDB from '@/lib/mongodb';
import Menu from '@/models/Menu';
import MealBooking from '@/models/MealBooking';
import Attendance from '@/models/Attendance';
import Inventory from '@/models/Inventory';
import FoodWastage from '@/models/FoodWastage';
import Subscription from '@/models/Subscription';
import Announcement from '@/models/Announcement';
import { requireRole } from '@/lib/auth';
import { startOfDay, endOfDay } from '@/lib/utils';

// GET /api/dashboard/kitchen
export async function GET() {
  const { error, status } = await requireRole(['admin', 'manager', 'kitchen']);
  if (error) return Response.json({ error }, { status });

  await connectDB();

  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);

  // 1. Today's published menu
  const todayMenu = await Menu.findOne({
    date: { $gte: todayStart, $lte: todayEnd },
    isPublished: true,
  });

  // 2. Active subscriptions count
  const activeSubs = await Subscription.find({
    status: 'active',
    startDate: { $lte: todayEnd },
    endDate: { $gte: todayStart },
  }).populate('mealPlan');

  // Meal counts based on subscriptions
  const planCounts = {
    breakfast: activeSubs.filter(s => s.mealPlan?.includedMeals?.breakfast).length,
    lunch: activeSubs.filter(s => s.mealPlan?.includedMeals?.lunch).length,
    snacks: activeSubs.filter(s => s.mealPlan?.includedMeals?.snacks).length,
    dinner: activeSubs.filter(s => s.mealPlan?.includedMeals?.dinner).length,
  };

  // 3. Bookings and skips for today
  const bookings = await MealBooking.find({
    date: { $gte: todayStart, $lte: todayEnd },
  });

  const bookingStats = {
    breakfast: { confirmed: 0, skipped: 0 },
    lunch: { confirmed: 0, skipped: 0 },
    snacks: { confirmed: 0, skipped: 0 },
    dinner: { confirmed: 0, skipped: 0 },
  };

  bookings.forEach(b => {
    if (bookingStats[b.mealType]) {
      if (b.status === 'confirmed') bookingStats[b.mealType].confirmed++;
      if (b.status === 'skipped') bookingStats[b.mealType].skipped++;
    }
  });

  // 4. Served attendance today
  const attendance = await Attendance.find({
    date: { $gte: todayStart, $lte: todayEnd },
    status: 'present',
  });

  const servedCounts = {
    breakfast: attendance.filter(a => a.mealType === 'breakfast').length,
    lunch: attendance.filter(a => a.mealType === 'lunch').length,
    snacks: attendance.filter(a => a.mealType === 'snacks').length,
    dinner: attendance.filter(a => a.mealType === 'dinner').length,
  };

  // Expected = (subscribed minus skipped) + manual bookings if any
  const expectedMeals = {
    breakfast: Math.max(0, planCounts.breakfast - bookingStats.breakfast.skipped),
    lunch: Math.max(0, planCounts.lunch - bookingStats.lunch.skipped),
    snacks: Math.max(0, planCounts.snacks - bookingStats.snacks.skipped),
    dinner: Math.max(0, planCounts.dinner - bookingStats.dinner.skipped),
  };

  // 5. Low stock inventory alerts
  const inventoryItems = await Inventory.find({ isActive: true });
  const lowStockItems = inventoryItems
    .filter(item => item.currentStock <= item.minimumStock)
    .map(item => ({
      _id: item._id,
      name: item.name,
      currentStock: item.currentStock,
      minimumStock: item.minimumStock,
      unit: item.unit,
      category: item.category,
    }));

  // 6. Wastage today
  const todayWastage = await FoodWastage.find({
    date: { $gte: todayStart, $lte: todayEnd },
  });
  const totalWastageKg = todayWastage.reduce((sum, w) => sum + (w.totalQuantityKg || 0), 0);

  // 7. Announcements for kitchen
  const announcements = await Announcement.find({
    isPublished: true,
    targetRoles: { $in: ['kitchen', 'all'] },
    $or: [{ expiresAt: null }, { expiresAt: { $gt: today } }],
  }).sort({ pinned: -1, createdAt: -1 }).limit(5);

  return Response.json({
    success: true,
    data: {
      todayMenu,
      expectedMeals,
      servedCounts,
      bookingStats,
      lowStockItems,
      totalWastageKg,
      todayWastageRecords: todayWastage.length,
      announcements,
    },
  });
}
