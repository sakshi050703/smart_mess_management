import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'snacks', 'dinner'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ['food_quality', 'cleanliness', 'service', 'portion', 'variety', 'general'],
      default: 'general',
    },
    managerResponse: {
      type: String,
      trim: true,
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    respondedAt: Date,
  },
  { timestamps: true }
);

FeedbackSchema.index({ student: 1, date: -1 });
FeedbackSchema.index({ rating: 1 });

const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);
export default Feedback;
