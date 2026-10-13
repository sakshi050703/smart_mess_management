import connectDB from '@/lib/mongodb';
import Inventory from '@/models/Inventory';
import StockTransaction from '@/models/StockTransaction';
import { requireRole } from '@/lib/auth';
import { apiResponse, apiError, parseBody, getSearchParams } from '@/lib/utils';

// GET /api/inventory
export async function GET(request) {
  const { error, status } = await requireRole(['admin', 'manager', 'kitchen']);
  if (error) return apiError(error, status);

  await connectDB();
  const params = getSearchParams(request);
  const category = params.get('category');
  const lowStock = params.get('lowStock');

  const filter = { isActive: true };
  if (category) filter.category = category;

  const items = await Inventory.find(filter).sort({ name: 1 });

  const result = items.map(item => ({
    ...item.toObject(),
    isLowStock: item.currentStock <= item.minimumStock,
  }));

  if (lowStock === 'true') {
    return apiResponse({ items: result.filter(i => i.isLowStock) });
  }

  return apiResponse({ items: result });
}

// POST /api/inventory — add item or update stock
export async function POST(request) {
  const { error, status, session } = await requireRole(['admin', 'manager']);
  if (error) return apiError(error, status);

  await connectDB();
  const body = await parseBody(request);
  if (!body) return apiError('Invalid request body');

  const { name, category, unit, currentStock, minimumStock, costPerUnit, supplier, notes } = body;
  if (!name || !unit) return apiError('name and unit are required');

  const item = await Inventory.create({ name, category, unit, currentStock: currentStock || 0, minimumStock: minimumStock || 0, costPerUnit, supplier, notes });

  // Log initial stock transaction
  if (currentStock > 0) {
    await StockTransaction.create({
      inventory: item._id,
      type: 'in',
      quantity: currentStock,
      previousStock: 0,
      newStock: currentStock,
      reason: 'Initial stock',
      recordedBy: session.user.id,
    });
  }

  return apiResponse({ item }, 'Inventory item created', 201);
}
