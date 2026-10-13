import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MealBooking',
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'snacks', 'dinner'],
      required: [true, 'Meal type is required'],
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late'],
      default: 'present',
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    servedAt: Date,
    notes: String,
  },
  { timestamps: true }
);

// Prevent duplicate attendance records
AttendanceSchema.index({ student: 1, date: 1, mealType: 1 }, { unique: true });
AttendanceSchema.index({ date: 1, mealType: 1 });

const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
export default Attendance;
