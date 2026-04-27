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
      validate: {
        validator: function (value) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const input = new Date(value);
          input.setHours(0, 0, 0, 0);

          return input >= today;
        },
        message: "Expiry date cannot be in the past",
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true, // 🔥 important
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* ==============================
   🔥 AUTO EXPIRE FLAG
============================== */
announcementSchema.virtual("isExpired").get(function () {
  return this.expiryDate < new Date();
});

/* ==============================
   🔥 AUTO DEACTIVATE EXPIRED
============================== */
announcementSchema.pre("save", function () {
  if (this.expiryDate < new Date()) {
    this.isActive = false;
  }
});

/* ==============================
   🔥 INDEXES (PERFORMANCE)
============================== */
announcementSchema.index({ createdAt: -1 });
announcementSchema.index({ department: 1, isActive: 1 });

export default mongoose.model("Announcement", announcementSchema);