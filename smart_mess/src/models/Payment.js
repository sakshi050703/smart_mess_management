import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema(
  {
    bill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bill',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amountInPaise: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Amount must be positive'],
    },
    paymentMode: {
      type: String,
      enum: ['cash', 'upi', 'bank_transfer'],
      required: [true, 'Payment mode is required'],
    },
    paymentDate: {
      type: Date,
      required: [true, 'Payment date is required'],
      default: Date.now,
    },
    transactionReference: {
      type: String,
      trim: true,
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
    // Reversal / correction support
    isReversed: {
      type: Boolean,
      default: false,
    },
    reversedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reversedAt: Date,
    reversalReason: String,
    // Link to original if this is a correction
    originalPayment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
  },
  { timestamps: true }
);

PaymentSchema.index({ bill: 1 });
PaymentSchema.index({ student: 1, paymentDate: -1 });
PaymentSchema.index({ recordedBy: 1 });

const Payment = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
export default Payment;
