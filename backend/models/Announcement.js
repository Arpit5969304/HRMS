import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    department: {
      type: String,
      enum: ["All", "HR", "IT", "Finance"],
      default: "All",
      index: true,
    },

    priority: {
      type: String,
      enum: ["Normal", "Medium", "High"],
      default: "Normal",
      index: true,
    },

    expiryDate: {
      type: Date,
      required: true,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

/* ==============================
   🔥 AUTO EXPIRE LOGIC
============================== */
announcementSchema.virtual("isExpired").get(function () {
  return this.expiryDate < new Date();
});

/* ==============================
   🔥 INDEXES (PERFORMANCE)
============================== */
announcementSchema.index({ createdAt: -1 });

export default mongoose.model("Announcement", announcementSchema);