import connectDB from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Bill from '@/models/Bill';
import AuditLog from '@/models/AuditLog';
import { requireRole } from '@/lib/auth';
import { apiResponse, apiError, parseBody } from '@/lib/utils';
import { reversePaymentSchema } from '@/validators/payment.validator';

// GET /api/payments/[id]
export async function GET(request, { params }) {
  const { error, status } = await requireRole(['admin', 'manager']);
  if (error) return apiError(error, status);

  await connectDB();
  const payment = await Payment.findById(params.id)
    .populate('student', 'name email studentId')
    .populate('bill')
    .populate('recordedBy', 'name')
    .populate('reversedBy', 'name');

  if (!payment) return apiError('Payment not found', 404);
  return apiResponse({ payment });
}

// DELETE /api/payments/[id] — reverse a payment (admin only)
export async function DELETE(request, { params }) {
  const { error, status, session } = await requireRole(['admin']);
  if (error) return apiError(error, status);

  await connectDB();
  const body = await parseBody(request);
  const parsed = reversePaymentSchema.safeParse({ paymentId: params.id, reversalReason: body?.reversalReason });
  if (!parsed.success) return apiError('reversalReason is required (min 5 characters)');

  const payment = await Payment.findById(params.id);
  if (!payment) return apiError('Payment not found', 404);
  if (payment.isReversed) return apiError('Payment already reversed', 400);

  // Reverse the payment
  payment.isReversed = true;
  payment.reversedBy = session.user.id;
  payment.reversedAt = new Date();
  payment.reversalReason = body.reversalReason;
  await payment.save();

  // Update bill balance
  const bill = await Bill.findById(payment.bill);
  if (bill) {
    bill.paidAmountInPaise = Math.max(0, bill.paidAmountInPaise - payment.amountInPaise);
    await bill.save();
  }

  // Audit
  await AuditLog.create({
    action: 'PAYMENT_REVERSED',
    entity: 'Payment',
    entityId: payment._id,
    performedBy: session.user.id,
    previousData: { amountInPaise: payment.amountInPaise, isReversed: false },
    newData: { isReversed: true, reversalReason: body.reversalReason },
    notes: body.reversalReason,
  });

  return apiResponse({ payment }, 'Payment reversed successfully');
}
