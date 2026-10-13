import mongoose from 'mongoose';

const ComplaintSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Complaint title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['food_quality', 'hygiene', 'service', 'billing', 'staff', 'facilities', 'other'],
      default: 'other',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },
    resolution: {
      type: String,
      trim: true,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: Date,
    managerNotes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

ComplaintSchema.index({ student: 1, status: 1 });
ComplaintSchema.index({ status: 1, priority: 1 });

const Complaint = mongoose.models.Complaint || mongoose.model('Complaint', ComplaintSchema);
export default Complaint;
