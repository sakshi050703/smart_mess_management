import mongoose from 'mongoose';

const AnnouncementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['menu_change', 'holiday', 'timing_change', 'maintenance', 'general'],
      default: 'general',
    },
    targetRoles: {
      type: [String],
      enum: ['admin', 'manager', 'kitchen', 'student', 'all'],
      default: ['all'],
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: Date,
    expiresAt: Date,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    pinned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

AnnouncementSchema.index({ isPublished: 1, expiresAt: 1 });
AnnouncementSchema.index({ targetRoles: 1 });

const Announcement = mongoose.models.Announcement || mongoose.model('Announcement', AnnouncementSchema);
export default Announcement;
