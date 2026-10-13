import mongoose from 'mongoose';

const InventorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      unique: true,
    },
    category: {
      type: String,
      enum: ['vegetables', 'fruits', 'grains', 'dairy', 'spices', 'oil', 'beverages', 'other'],
      default: 'other',
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      trim: true, // e.g., kg, litre, pieces
    },
    currentStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    minimumStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    costPerUnit: {
      type: Number, // in paise
      default: 0,
    },
    supplier: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Virtual to check if low stock
InventorySchema.virtual('isLowStock').get(function () {
  return this.currentStock <= this.minimumStock;
});

InventorySchema.index({ category: 1 });
InventorySchema.index({ isActive: 1 });

const Inventory = mongoose.models.Inventory || mongoose.model('Inventory', InventorySchema);
export default Inventory;
