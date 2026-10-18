import connectDB from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Bill from '@/models/Bill';
import AuditLog from '@/models/AuditLog';
import { requireRole, requireAuth } from '@/lib/auth';
import { apiResponse, apiError, parseBody, getSearchParams, paginationMeta } from '@/lib/utils';
import { createPaymentSchema } from '@/validators/payment.validator';

// GET /api/payments
export async function GET(request) {
  const { error, status, session } = await requireAuth();
  if (error) return apiError(error, status);

  await connectDB();
  const params = getSearchParams(request);
  const page = parseInt(params.get('page') || '1');
  const limit = parseInt(params.get('limit') || '20');
  const skip = (page - 1) * limit;

  const filter = {};
  if (session.user.role === 'student') {
    filter.student = session.user.id;
  } else {
    const studentId = params.get('student');
    if (studentId) filter.student = studentId;
    const billId = params.get('bill');
    if (billId) filter.bill = billId;
  }

  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .populate('student', 'name email studentId')
      .populate('bill', 'billingPeriod totalAmountInPaise status')
      .populate('recordedBy', 'name')
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(limit),
    Payment.countDocuments(filter),
  ]);

  return apiResponse({ payments, pagination: paginationMeta(total, page, limit) });
}

// POST /api/payments — record a payment (admin/manager only)
export async function POST(request) {
  const { error, status, session } = await requireRole(['admin', 'manager']);
  if (error) return apiError(error, status);

  await connectDB();
  const body = await parseBody(request);
  if (!body) return apiError('Invalid request body');

  const parsed = createPaymentSchema.safeParse(body);
  if (!parsed.success) return apiError('Validation failed', 400, parsed.error.flatten().fieldErrors);

  const bill = await Bill.findById(parsed.data.billId);
  if (!bill) return apiError('Bill not found', 404);

  if (bill.status === 'paid') return apiError('Bill is already fully paid', 400);

  // Prevent overpayment
  const paymentAmount = parsed.data.amountInPaise;
  if (paymentAmount > bill.balanceAmountInPaise) {
    return apiError(`Payment amount (${paymentAmount}) exceeds outstanding balance (${bill.balanceAmountInPaise})`, 400);
  }

  // Create payment record
  const payment = await Payment.create({
    bill: bill._id,
    student: bill.student,
    amountInPaise: paymentAmount,
    paymentMode: parsed.data.paymentMode,
    paymentDate: new Date(parsed.data.paymentDate),
    transactionReference: parsed.data.transactionReference,
    notes: parsed.data.notes,
    recordedBy: session.user.id,
  });

  // Update bill
  bill.paidAmountInPaise += paymentAmount;
  await bill.save(); // pre-save hook recalculates balance and status

  // Audit log
  await AuditLog.create({
    action: 'PAYMENT_RECORDED',
    entity: 'Payment',
    entityId: payment._id,
    performedBy: session.user.id,
    newData: { amountInPaise: paymentAmount, paymentMode: parsed.data.paymentMode, billId: bill._id },
  });

  return apiResponse({ payment, bill }, 'Payment recorded successfully', 201);
}
