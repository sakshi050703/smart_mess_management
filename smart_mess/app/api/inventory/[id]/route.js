import connectDB from '@/lib/mongodb';
import Inventory from '@/models/Inventory';
import StockTransaction from '@/models/StockTransaction';
import { requireRole } from '@/lib/auth';
import { apiResponse, apiError, parseBody } from '@/lib/utils';

// GET /api/inventory/[id]
export async function GET(request, { params }) {
  const { error, status } = await requireRole(['admin', 'manager', 'kitchen']);
  if (error) return apiError(error, status);

  await connectDB();
  const { id } = await params;
  const item = await Inventory.findById(id);
  if (!item) return apiError('Inventory item not found', 404);

  return apiResponse({ item });
}

// PATCH /api/inventory/[id] — update item or stock
export async function PATCH(request, { params }) {
  const { error, status, session } = await requireRole(['admin', 'manager', 'kitchen']);
  if (error) return apiError(error, status);

  await connectDB();
  const { id } = await params;
  const body = await parseBody(request);
  if (!body) return apiError('Invalid request body');

  const item = await Inventory.findById(id);
  if (!item) return apiError('Inventory item not found', 404);

  // If adjusting stock:
  if (body.currentStock !== undefined && body.currentStock !== item.currentStock) {
    const prev = item.currentStock;
    const next = Number(body.currentStock);
    const diff = next - prev;

    await StockTransaction.create({
      inventory: item._id,
      type: body.transactionType || (diff >= 0 ? 'in' : 'out'),
      quantity: Math.abs(diff),
      previousStock: prev,
      newStock: next,
      reason: body.reason || 'Stock adjustment',
      mealType: body.mealType || null,
      recordedBy: session.user.id,
    });
  }

  // Update fields
  const allowed = ['name', 'category', 'unit', 'currentStock', 'minimumStock', 'costPerUnit', 'supplier', 'notes', 'isActive'];
  allowed.forEach(field => {
    if (body[field] !== undefined) item[field] = body[field];
  });

  await item.save();

  return apiResponse({ item }, 'Inventory item updated successfully');
}

// DELETE /api/inventory/[id] — soft deactivate
export async function DELETE(request, { params }) {
  const { error, status } = await requireRole(['admin', 'manager']);
  if (error) return apiError(error, status);

  await connectDB();
  const { id } = await params;
  const item = await Inventory.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!item) return apiError('Inventory item not found', 404);

  return apiResponse({ item }, 'Inventory item deactivated successfully');
}
