import mongoose from 'mongoose';

const MealBookingSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
    },
    date: {
      type: Date,
      required: [true, 'Booking date is required'],
    },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'snacks', 'dinner'],
      required: [true, 'Meal type is required'],
    },
    status: {
      type: String,
      enum: ['confirmed', 'skipped', 'cancelled'],
      default: 'confirmed',
    },
    skippedAt: Date,
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate bookings for same student, date, and meal type
MealBookingSchema.index({ student: 1, date: 1, mealType: 1 }, { unique: true });
MealBookingSchema.index({ date: 1, mealType: 1 });
MealBookingSchema.index({ student: 1, date: -1 });

const MealBooking = mongoose.models.MealBooking || mongoose.model('MealBooking', MealBookingSchema);
export default MealBooking;
