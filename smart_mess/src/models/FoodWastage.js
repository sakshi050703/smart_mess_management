import mongoose from 'mongoose';

const FoodWastageSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'snacks', 'dinner'],
      required: true,
    },
    items: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        unit: { type: String, required: true },
        reason: { type: String },
      },
    ],
    totalQuantityKg: {
      type: Number,
      default: 0,
    },
    estimatedValueInPaise: {
      type: Number,
      default: 0,
    },
    preparedQuantity: {
      type: Number,
      default: 0,
    },
    servedQuantity: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

FoodWastageSchema.index({ date: -1, mealType: 1 });

const FoodWastage = mongoose.models.FoodWastage || mongoose.model('FoodWastage', FoodWastageSchema);
export default FoodWastage;
