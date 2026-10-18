import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'kitchen', 'student'],
      default: 'student',
    },
    phone: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Student-specific fields
    studentId: {
      type: String,
      sparse: true,
      unique: true,
    },
    rollNumber: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    course: {
      type: String,
      trim: true,
    },
    year: {
      type: Number,
    },
    roomNumber: {
      type: String,
      trim: true,
    },
    hostel: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
    },
    // Password reset
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Generate student ID for student role
UserSchema.pre('save', function (next) {
  if (this.role === 'student' && !this.studentId) {
    this.studentId = `STU${Date.now()}`;
  }
  next();
});

UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;
