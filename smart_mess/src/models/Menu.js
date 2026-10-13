import mongoose from 'mongoose';

const MenuItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  isVeg: { type: Boolean, default: true },
  calories: { type: Number },
}, { _id: false });

const MealSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['breakfast', 'lunch', 'snacks', 'dinner'],
    required: true,
  },
  startTime: { type: String, required: true }, // e.g. "07:30"
  endTime: { type: String, required: true },   // e.g. "09:30"
  cutoffTime: { type: String, required: true }, // booking cutoff, e.g. "07:00"
  items: [MenuItemSchema],
  isEnabled: { type: Boolean, default: true },
}, { _id: false });

const MenuSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, 'Date is required'],
      index: true,
    },
    meals: [MealSchema],
    isPublished: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

MenuSchema.index({ date: 1, isPublished: 1 });

const Menu = mongoose.models.Menu || mongoose.model('Menu', MenuSchema);
export default Menu;
