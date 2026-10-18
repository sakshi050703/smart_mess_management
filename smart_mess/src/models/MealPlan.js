import mongoose from 'mongoose';

const MealPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    durationDays: {
      type: Number,
      required: [true, 'Duration is required'],
      min: 1,
    },
    includedMeals: {
      breakfast: { type: Boolean, default: true },
      lunch: { type: Boolean, default: true },
      snacks: { type: Boolean, default: false },
      dinner: { type: Boolean, default: true },
    },
    priceInPaise: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const MealPlan = mongoose.models.MealPlan || mongoose.model('MealPlan', MealPlanSchema);
export default MealPlan;
