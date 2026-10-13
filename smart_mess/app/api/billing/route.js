import connectDB from '@/lib/mongodb';
import Bill from '@/models/Bill';
import Payment from '@/models/Payment';
import AuditLog from '@/models/AuditLog';
import { requireRole, requireAuth } from '@/lib/auth';
import { apiResponse, apiError, parseBody, getSearchParams, paginationMeta } from '@/lib/utils';
import { createBillSchema } from '@/validators/billing.validator';

// GET /api/billing
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
    const billStatus = params.get('status');
    if (billStatus) filter.status = billStatus;
  }

  const [bills, total] = await Promise.all([
    Bill.find(filter).populate('student', 'name email studentId').populate('subscription').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Bill.countDocuments(filter),
  ]);

  return apiResponse({ bills, pagination: paginationMeta(total, page, limit) });
}

// POST /api/billing — generate bill (admin/manager)
export async function POST(request) {
  const { error, status, session } = await requireRole(['admin', 'manager']);
  if (error) return apiError(error, status);

  await connectDB();
  const body = await parseBody(request);
  if (!body) return apiError('Invalid request body');

  const parsed = createBillSchema.safeParse(body);
  if (!parsed.success) return apiError('Validation failed', 400, parsed.error.flatten().fieldErrors);

  const bill = await Bill.create({
    student: parsed.data.studentId,
    subscription: parsed.data.subscriptionId || undefined,
    billingPeriod: {
      startDate: new Date(parsed.data.billingPeriodStart),
      endDate: new Date(parsed.data.billingPeriodEnd),
      label: parsed.data.billingPeriodLabel || '',
    },
    totalAmountInPaise: parsed.data.totalAmountInPaise,
    paidAmountInPaise: 0,
    dueDate: new Date(parsed.data.dueDate),
    notes: parsed.data.notes,
    generatedBy: session.user.id,
  });

  return apiResponse({ bill }, 'Bill generated', 201);
}
