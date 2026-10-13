import connectDB from '@/lib/mongodb';
import Menu from '@/models/Menu';
import { requireRole, auth } from '@/lib/auth';
import { apiResponse, apiError, parseBody, getSearchParams } from '@/lib/utils';
import { createMenuSchema } from '@/validators/menu.validator';

// GET /api/menus — list menus
export async function GET(request) {
  const session = await auth();
  if (!session?.user) return apiError('Unauthorized', 401);

  await connectDB();
  const params = getSearchParams(request);
  const date = params.get('date');
  const published = params.get('published');

  const filter = {};
  if (date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const dEnd = new Date(date);
    dEnd.setHours(23, 59, 59, 999);
    filter.date = { $gte: d, $lte: dEnd };
  }
  // Students can only see published menus
  if (session.user.role === 'student') {
    filter.isPublished = true;
  } else if (published !== null && published !== '') {
    filter.isPublished = published === 'true';
  }

  const menus = await Menu.find(filter).sort({ date: -1 }).limit(30).populate('createdBy', 'name');
  return apiResponse({ menus });
}

// POST /api/menus — create menu (admin/manager)
export async function POST(request) {
  const { error, status, session } = await requireRole(['admin', 'manager']);
  if (error) return apiError(error, status);

  await connectDB();
  const body = await parseBody(request);
  if (!body) return apiError('Invalid request body');

  const parsed = createMenuSchema.safeParse(body);
  if (!parsed.success) return apiError('Validation failed', 400, parsed.error.flatten().fieldErrors);

  // Check for duplicate date
  const dateObj = new Date(parsed.data.date);
  dateObj.setHours(0, 0, 0, 0);
  const dateEnd = new Date(parsed.data.date);
  dateEnd.setHours(23, 59, 59, 999);

  const existing = await Menu.findOne({ date: { $gte: dateObj, $lte: dateEnd } });
  if (existing) return apiError('A menu already exists for this date', 409);

  const menu = await Menu.create({ ...parsed.data, date: dateObj, createdBy: session.user.id });
  return apiResponse({ menu }, 'Menu created', 201);
}
