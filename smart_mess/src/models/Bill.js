import mongoose from 'mongoose';

const BillSchema = new mongoose.Schema(
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
    billingPeriod: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      label: { type: String }, // e.g. "October 2025"
    },
    totalAmountInPaise: {
      type: Number,
      required: true,
      min: 0,
    },
    paidAmountInPaise: {
      type: Number,
      default: 0,
      min: 0,
    },
    balanceAmountInPaise: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['unpaid', 'partial', 'paid', 'overdue', 'waived'],
      default: 'unpaid',
    },
    dueDate: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Recalculate balance before saving
BillSchema.pre('save', function (next) {
  this.balanceAmountInPaise = this.totalAmountInPaise - this.paidAmountInPaise;

  if (this.paidAmountInPaise === 0) {
    this.status = new Date() > this.dueDate ? 'overdue' : 'unpaid';
  } else if (this.paidAmountInPaise >= this.totalAmountInPaise) {
    this.status = 'paid';
    this.paidAmountInPaise = this.totalAmountInPaise;
    this.balanceAmountInPaise = 0;
  } else {
    this.status = 'partial';
  }

  next();
});

BillSchema.index({ student: 1, status: 1 });
BillSchema.index({ dueDate: 1, status: 1 });
BillSchema.index({ 'billingPeriod.startDate': 1 });

const Bill = mongoose.models.Bill || mongoose.model('Bill', BillSchema);
export default Bill;
