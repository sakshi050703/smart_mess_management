import connectDB from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import Bill from '@/models/Bill';
import Payment from '@/models/Payment';
import FoodWastage from '@/models/FoodWastage';
import Inventory from '@/models/Inventory';
import { requireRole } from '@/lib/auth';
import { apiResponse, apiError, getSearchParams, formatCurrency } from '@/lib/utils';
import { startOfDay, endOfDay, format } from 'date-fns';

// GET /api/reports
export async function GET(request) {
  const { error, status } = await requireRole(['admin', 'manager']);
  if (error) return apiError(error, status);

  await connectDB();
  const params = getSearchParams(request);
  const type = params.get('type') || 'billing';
  const formatType = params.get('format') || 'json';
  const startDate = params.get('startDate');
  const endDate = params.get('endDate');

  const dateFilter = {};
  if (startDate) dateFilter.$gte = startOfDay(new Date(startDate));
  if (endDate) dateFilter.$lte = endOfDay(new Date(endDate));

  let data = [];
  let csvHeaders = [];
  let csvRows = [];

  if (type === 'billing') {
    const filter = {};
    if (startDate || endDate) filter.createdAt = dateFilter;
    const bills = await Bill.find(filter).populate('student', 'name studentId email').sort({ createdAt: -1 });

    csvHeaders = ['Bill ID', 'Student ID', 'Student Name', 'Total (INR)', 'Paid (INR)', 'Balance (INR)', 'Status', 'Due Date'];
    csvRows = bills.map(b => [
      b._id,
      b.student?.studentId || 'N/A',
      `"${b.student?.name || 'N/A'}"`,
      (b.totalAmountInPaise / 100).toFixed(2),
      (b.paidAmountInPaise / 100).toFixed(2),
      (b.balanceAmountInPaise / 100).toFixed(2),
      b.status,
      b.dueDate ? format(new Date(b.dueDate), 'yyyy-MM-dd') : 'N/A',
    ]);
    data = bills;
  } else if (type === 'payments') {
    const filter = { isReversed: false };
    if (startDate || endDate) filter.paymentDate = dateFilter;
    const payments = await Payment.find(filter).populate('student', 'name studentId').populate('recordedBy', 'name');

    csvHeaders = ['Receipt Number', 'Student ID', 'Student Name', 'Amount (INR)', 'Method', 'Date', 'Recorded By'];
    csvRows = payments.map(p => [
      p.receiptNumber,
      p.student?.studentId || 'N/A',
      `"${p.student?.name || 'N/A'}"`,
      (p.amountInPaise / 100).toFixed(2),
      p.paymentMethod,
      p.paymentDate ? format(new Date(p.paymentDate), 'yyyy-MM-dd') : 'N/A',
      `"${p.recordedBy?.name || 'N/A'}"`,
    ]);
    data = payments;
  } else if (type === 'attendance') {
    const filter = {};
    if (startDate || endDate) filter.date = dateFilter;
    const attendance = await Attendance.find(filter).populate('student', 'name studentId').sort({ date: -1 });

    csvHeaders = ['Date', 'Meal Type', 'Student ID', 'Student Name', 'Status', 'Served At'];
    csvRows = attendance.map(a => [
      a.date ? format(new Date(a.date), 'yyyy-MM-dd') : 'N/A',
      a.mealType,
      a.student?.studentId || 'N/A',
      `"${a.student?.name || 'N/A'}"`,
      a.status,
      a.servedAt ? format(new Date(a.servedAt), 'HH:mm') : 'N/A',
    ]);
    data = attendance;
  } else if (type === 'wastage') {
    const filter = {};
    if (startDate || endDate) filter.date = dateFilter;
    const wastage = await FoodWastage.find(filter).sort({ date: -1 });

    csvHeaders = ['Date', 'Meal Type', 'Waste Quantity (Kg)', 'Estimated Loss (INR)', 'Prepared Qty', 'Served Qty'];
    csvRows = wastage.map(w => [
      w.date ? format(new Date(w.date), 'yyyy-MM-dd') : 'N/A',
      w.mealType,
      w.totalQuantityKg,
      (w.estimatedValueInPaise / 100).toFixed(2),
      w.preparedQuantity,
      w.servedQuantity,
    ]);
    data = wastage;
  } else if (type === 'inventory') {
    const inventory = await Inventory.find({ isActive: true }).sort({ category: 1, name: 1 });

    csvHeaders = ['Item Name', 'Category', 'Current Stock', 'Min Stock', 'Unit', 'Cost/Unit (INR)', 'Status'];
    csvRows = inventory.map(i => [
      `"${i.name}"`,
      i.category,
      i.currentStock,
      i.minimumStock,
      i.unit,
      (i.costPerUnit / 100).toFixed(2),
      i.currentStock <= i.minimumStock ? 'LOW STOCK' : 'OK',
    ]);
    data = inventory;
  }

  if (formatType === 'csv') {
    const csvContent = [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n');
    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="smart-mess-${type}-report.csv"`,
      },
    });
  }

  return apiResponse({ type, count: data.length, data });
}
