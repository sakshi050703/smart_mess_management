import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_mess';

async function seed() {
  console.log(`Connecting to MongoDB at: ${MONGODB_URI}`);
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB successfully.');

  const db = mongoose.connection.db;

  // 1. Users
  const rawUsers = [
    { name: 'Admin User', email: 'admin@mess.com', password: 'password123', role: 'admin', phone: '9876543210', isActive: true },
    { name: 'Mess Manager', email: 'manager@mess.com', password: 'password123', role: 'manager', phone: '9876543211', isActive: true },
    { name: 'Kitchen Staff', email: 'kitchen@mess.com', password: 'password123', role: 'kitchen', phone: '9876543212', isActive: true },
    { name: 'Rahul Kumar', email: 'student@mess.com', password: 'password123', role: 'student', phone: '9876543213', studentId: 'STU1001', rollNumber: 'CS2021001', department: 'Computer Science', course: 'B.Tech', year: 3, roomNumber: 'A-201', hostel: 'Boys Hostel A', isActive: true },
    { name: 'Priya Sharma', email: 'priya@mess.com', password: 'password123', role: 'student', phone: '9876543214', studentId: 'STU1002', rollNumber: 'EC2021002', department: 'Electronics', course: 'B.Tech', year: 2, roomNumber: 'G-105', hostel: 'Girls Hostel G', isActive: true },
    { name: 'Amit Singh', email: 'amit@mess.com', password: 'password123', role: 'student', phone: '9876543215', studentId: 'STU1003', rollNumber: 'ME2022003', department: 'Mechanical', course: 'B.Tech', year: 2, roomNumber: 'B-312', hostel: 'Boys Hostel B', isActive: true },
  ];

  const usersCollection = db.collection('users');
  const userMap = {};

  for (const u of rawUsers) {
    const existing = await usersCollection.findOne({ email: u.email });
    if (!existing) {
      const hashedPassword = await bcrypt.hash(u.password, 12);
      const res = await usersCollection.insertOne({
        ...u,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      userMap[u.role] = userMap[u.role] || res.insertedId;
      if (u.role === 'admin') userMap.admin = res.insertedId;
      console.log(`Created user: ${u.name} (${u.email}) [${u.role}]`);
    } else {
      userMap[u.role] = userMap[u.role] || existing._id;
      if (u.role === 'admin') userMap.admin = existing._id;
      console.log(`User already exists: ${u.email}`);
    }
  }

  const adminId = userMap.admin;

  // 2. Meal Plans
  const plansCollection = db.collection('mealplans');
  const rawPlans = [
    { name: 'Full Day Plan', description: 'All 4 meals: Breakfast, Lunch, Snacks, Dinner', durationDays: 30, includedMeals: { breakfast: true, lunch: true, snacks: true, dinner: true }, priceInPaise: 300000, isActive: true, createdBy: adminId, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Lunch & Dinner', description: 'Lunch and Dinner only', durationDays: 30, includedMeals: { breakfast: false, lunch: true, snacks: false, dinner: true }, priceInPaise: 220000, isActive: true, createdBy: adminId, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Breakfast & Lunch', description: 'Morning meals only', durationDays: 30, includedMeals: { breakfast: true, lunch: true, snacks: false, dinner: false }, priceInPaise: 180000, isActive: true, createdBy: adminId, createdAt: new Date(), updatedAt: new Date() },
  ];

  let firstPlanId = null;
  for (const p of rawPlans) {
    const existing = await plansCollection.findOne({ name: p.name });
    if (!existing) {
      const res = await plansCollection.insertOne(p);
      if (!firstPlanId) firstPlanId = res.insertedId;
      console.log(`Created meal plan: ${p.name}`);
    } else {
      if (!firstPlanId) firstPlanId = existing._id;
      console.log(`Meal plan already exists: ${p.name}`);
    }
  }

  // 3. Today's Menu
  const menusCollection = db.collection('menus');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const existingMenu = await menusCollection.findOne({ date: today });
  if (!existingMenu) {
    await menusCollection.insertOne({
      date: today,
      isPublished: true,
      createdBy: adminId,
      meals: [
        { type: 'breakfast', startTime: '07:30', endTime: '09:30', cutoffTime: '07:00', isEnabled: true, items: [{ name: 'Idli Sambar', isVeg: true }, { name: 'Coconut Chutney', isVeg: true }, { name: 'Tea / Coffee', isVeg: true }] },
        { type: 'lunch', startTime: '12:30', endTime: '14:30', cutoffTime: '12:00', isEnabled: true, items: [{ name: 'Dal Tadka', isVeg: true }, { name: 'Jeera Rice', isVeg: true }, { name: 'Roti', isVeg: true }, { name: 'Aloo Sabzi', isVeg: true }, { name: 'Salad', isVeg: true }] },
        { type: 'snacks', startTime: '17:00', endTime: '18:00', cutoffTime: '16:30', isEnabled: true, items: [{ name: 'Samosa', isVeg: true }, { name: 'Tea', isVeg: true }] },
        { type: 'dinner', startTime: '20:00', endTime: '21:30', cutoffTime: '19:30', isEnabled: true, items: [{ name: 'Paneer Butter Masala', isVeg: true }, { name: 'Naan', isVeg: true }, { name: 'Dal Makhani', isVeg: true }, { name: 'Rice', isVeg: true }, { name: 'Gulab Jamun', isVeg: true }] },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("Created today's menu");
  }

  // 4. Inventory
  const invCollection = db.collection('inventories');
  const items = [
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

  for (const item of items) {
    const existing = await invCollection.findOne({ name: item.name });
    if (!existing) {
      await invCollection.insertOne({ ...item, createdAt: new Date(), updatedAt: new Date() });
      console.log(`Created inventory item: ${item.name}`);
    }
  }

  // 5. Announcements
  const annCollection = db.collection('announcements');
  const announcements = [
    { title: 'Welcome to SmartMess!', content: 'We are excited to launch the Smart Mess Management System. You can now book meals, view menus, and manage your subscriptions online.', type: 'general', targetRoles: ['all'], isPublished: true, publishedAt: new Date(), pinned: true, createdBy: adminId, createdAt: new Date(), updatedAt: new Date() },
    { title: 'Special Dinner on Diwali', content: 'Special festive dinner will be served on Diwali. Do not miss the sweets and special dishes!', type: 'menu_change', targetRoles: ['student', 'all'], isPublished: true, publishedAt: new Date(), createdBy: adminId, createdAt: new Date(), updatedAt: new Date() },
  ];

  for (const ann of announcements) {
    const existing = await annCollection.findOne({ title: ann.title });
    if (!existing) {
      await annCollection.insertOne(ann);
      console.log(`Created announcement: ${ann.title}`);
    }
  }

  console.log('\n✅ Database seeded successfully!');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
