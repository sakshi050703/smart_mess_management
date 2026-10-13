import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import MealPlan from '@/models/MealPlan';
import Subscription from '@/models/Subscription';
import Menu from '@/models/Menu';
import Bill from '@/models/Bill';
import Announcement from '@/models/Announcement';
import Inventory from '@/models/Inventory';

/**
 * POST /api/seed
 * Seeds the database with initial data for demo purposes.
 * Only works in development. Remove or protect in production.
 */
export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return Response.json({ error: 'Seeding is disabled in production' }, { status: 403 });
  }

  await connectDB();

  // Create demo users
  const users = [
    { name: 'Admin User', email: 'admin@mess.com', password: 'password123', role: 'admin', phone: '9876543210' },
    { name: 'Mess Manager', email: 'manager@mess.com', password: 'password123', role: 'manager', phone: '9876543211' },
    { name: 'Kitchen Staff', email: 'kitchen@mess.com', password: 'password123', role: 'kitchen', phone: '9876543212' },
    { name: 'Rahul Kumar', email: 'student@mess.com', password: 'password123', role: 'student', phone: '9876543213', rollNumber: 'CS2021001', department: 'Computer Science', course: 'B.Tech', year: 3, roomNumber: 'A-201', hostel: 'Boys Hostel A' },
    { name: 'Priya Sharma', email: 'priya@mess.com', password: 'password123', role: 'student', phone: '9876543214', rollNumber: 'EC2021002', department: 'Electronics', course: 'B.Tech', year: 2, roomNumber: 'G-105', hostel: 'Girls Hostel G' },
    { name: 'Amit Singh', email: 'amit@mess.com', password: 'password123', role: 'student', phone: '9876543215', rollNumber: 'ME2022003', department: 'Mechanical', course: 'B.Tech', year: 2, roomNumber: 'B-312', hostel: 'Boys Hostel B' },
  ];

  const createdUsers = [];
  for (const userData of users) {
    const existing = await User.findOne({ email: userData.email });
    if (!existing) {
      const user = await User.create(userData);
      createdUsers.push(user);
    } else {
      createdUsers.push(existing);
    }
  }

  const adminUser = createdUsers.find(u => u.role === 'admin');
  const students = createdUsers.filter(u => u.role === 'student');

  // Create meal plans
  const mealPlans = [
    { name: 'Full Day Plan', description: 'All 4 meals: Breakfast, Lunch, Snacks, Dinner', durationDays: 30, includedMeals: { breakfast: true, lunch: true, snacks: true, dinner: true }, priceInPaise: 300000, isActive: true, createdBy: adminUser._id },
    { name: 'Lunch & Dinner', description: 'Lunch and Dinner only', durationDays: 30, includedMeals: { breakfast: false, lunch: true, snacks: false, dinner: true }, priceInPaise: 220000, isActive: true, createdBy: adminUser._id },
    { name: 'Breakfast & Lunch', description: 'Morning meals only', durationDays: 30, includedMeals: { breakfast: true, lunch: true, snacks: false, dinner: false }, priceInPaise: 180000, isActive: true, createdBy: adminUser._id },
  ];

  const createdPlans = [];
  for (const plan of mealPlans) {
    const existing = await MealPlan.findOne({ name: plan.name });
    if (!existing) {
      createdPlans.push(await MealPlan.create(plan));
    } else {
      createdPlans.push(existing);
    }
  }

  // Create subscriptions for students
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  for (const student of students) {
    const existing = await Subscription.findOne({ student: student._id, status: 'active' });
    if (!existing) {
      const plan = createdPlans[0];
      const sub = await Subscription.create({
        student: student._id,
        mealPlan: plan._id,
        startDate: monthStart,
        endDate: monthEnd,
        status: 'active',
        priceInPaise: plan.priceInPaise,
        createdBy: adminUser._id,
      });

      // Create bill for this subscription
      const billExists = await Bill.findOne({ student: student._id, subscription: sub._id });
      if (!billExists) {
        await Bill.create({
          student: student._id,
          subscription: sub._id,
          billingPeriod: {
            startDate: monthStart,
            endDate: monthEnd,
            label: now.toLocaleString('default', { month: 'long', year: 'numeric' }),
          },
          totalAmountInPaise: plan.priceInPaise,
          paidAmountInPaise: 0,
          balanceAmountInPaise: plan.priceInPaise,
          dueDate: new Date(now.getFullYear(), now.getMonth() + 1, 7),
          generatedBy: adminUser._id,
        });
      }
    }
  }

  // Create today's menu
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const existingMenu = await Menu.findOne({ date: today });
  if (!existingMenu) {
    await Menu.create({
      date: today,
      isPublished: true,
      createdBy: adminUser._id,
      meals: [
        { type: 'breakfast', startTime: '07:30', endTime: '09:30', cutoffTime: '07:00', isEnabled: true, items: [{ name: 'Idli Sambar', isVeg: true }, { name: 'Coconut Chutney', isVeg: true }, { name: 'Tea / Coffee', isVeg: true }] },
        { type: 'lunch', startTime: '12:30', endTime: '14:30', cutoffTime: '12:00', isEnabled: true, items: [{ name: 'Dal Tadka', isVeg: true }, { name: 'Jeera Rice', isVeg: true }, { name: 'Roti', isVeg: true }, { name: 'Aloo Sabzi', isVeg: true }, { name: 'Salad', isVeg: true }] },
        { type: 'snacks', startTime: '17:00', endTime: '18:00', cutoffTime: '16:30', isEnabled: true, items: [{ name: 'Samosa', isVeg: true }, { name: 'Tea', isVeg: true }] },
        { type: 'dinner', startTime: '20:00', endTime: '21:30', cutoffTime: '19:30', isEnabled: true, items: [{ name: 'Paneer Butter Masala', isVeg: true }, { name: 'Naan', isVeg: true }, { name: 'Dal Makhani', isVeg: true }, { name: 'Rice', isVeg: true }, { name: 'Gulab Jamun', isVeg: true }] },
      ],
    });
  }

  // Create inventory items
  const inventoryItems = [
    { name: 'Rice', category: 'grains', unit: 'kg', currentStock: 150, minimumStock: 50 },
    { name: 'Dal (Toor)', category: 'grains', unit: 'kg', currentStock: 30, minimumStock: 20 },
    { name: 'Wheat Flour', category: 'grains', unit: 'kg', currentStock: 80, minimumStock: 30 },
    { name: 'Milk', category: 'dairy', unit: 'litre', currentStock: 40, minimumStock: 30 },
    { name: 'Cooking Oil', category: 'oil', unit: 'litre', currentStock: 15, minimumStock: 20 },
    { name: 'Tomatoes', category: 'vegetables', unit: 'kg', currentStock: 10, minimumStock: 5 },
    { name: 'Onions', category: 'vegetables', unit: 'kg', currentStock: 25, minimumStock: 10 },
    { name: 'Potatoes', category: 'vegetables', unit: 'kg', currentStock: 8, minimumStock: 15 },
    { name: 'Paneer', category: 'dairy', unit: 'kg', currentStock: 5, minimumStock: 3 },
    { name: 'Sugar', category: 'other', unit: 'kg', currentStock: 20, minimumStock: 10 },
  ];

  for (const item of inventoryItems) {
    const existing = await Inventory.findOne({ name: item.name });
    if (!existing) {
      await Inventory.create(item);
    }
  }

  // Create announcements
  const announcements = [
    { title: 'Welcome to SmartMess!', content: 'We are excited to launch the Smart Mess Management System. You can now book meals, view menus, and manage your subscriptions online.', type: 'general', targetRoles: ['all'], isPublished: true, publishedAt: new Date(), pinned: true, createdBy: adminUser._id },
    { title: 'Special Dinner on Diwali', content: 'Special festive dinner will be served on Diwali. Do not miss the sweets and special dishes!', type: 'menu_change', targetRoles: ['student', 'all'], isPublished: true, publishedAt: new Date(), createdBy: adminUser._id },
  ];

  for (const ann of announcements) {
    const existing = await Announcement.findOne({ title: ann.title });
    if (!existing) {
      await Announcement.create(ann);
    }
  }

  return Response.json({
    success: true,
    message: 'Database seeded successfully!',
    data: {
      users: users.map(u => ({ name: u.name, email: u.email, role: u.role })),
      mealPlans: mealPlans.map(p => p.name),
      studentsSubscribed: students.length,
    },
  });
}
