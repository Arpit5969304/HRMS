import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },

    leaveType: {
      type: String,
      enum: [
        "Casual Leave",
        "Sick Leave",
        "Paid Leave",
        "Unpaid Leave",
        "Half Unpaid Leave",
      ],
      required: true,
    },

    fromDate: {
      type: Date,
      required: true,
    },

    toDate: {
      type: Date,
      required: true,
    },

    reason: {
      type: String,
      trim: true,
      maxlength: 300,
      required: function () {
        return this.leaveType !== "Paid Leave";
      },
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
      index: true,
    },

    totalDays: {
      type: Number,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    /* ==============================
       🔥 ADMIN CONTROL
    ============================== */

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },

    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 200,
    },
  },
  { timestamps: true }
);

/* ==============================
   🔥 INDEXES (OPTIMIZED)
============================== */
leaveSchema.index({ employee: 1, fromDate: 1, toDate: 1 });
leaveSchema.index({ employee: 1, status: 1 });

/* ==============================
   🔥 VALIDATIONS
============================== */
leaveSchema.pre("validate", function () {
  if (this.fromDate > this.toDate) {
    return next(new Error("Invalid date range"));
  }
});

/* ==============================
   🔥 AUTO CALCULATE DAYS (FIXED)
============================== */
leaveSchema.pre("save", function () {
  if (this.fromDate && this.toDate) {
    const start = new Date(this.fromDate);
    const end = new Date(this.toDate);

    // ✅ normalize time (important fix)
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const diff = end - start;

    let days = diff / (1000 * 60 * 60 * 24) + 1;

    if (this.leaveType === "Half Unpaid Leave") {
      days = 0.5;
    }

    this.totalDays = +days.toFixed(1);
  }

});

/* ==============================
   🔥 STATIC → OVERLAP CHECK (FIXED)
============================== */
leaveSchema.statics.checkOverlap = async function (
  employeeId,
  fromDate,
  toDate
) {
  const overlap = await this.findOne({
    employee: employeeId,
    status: { $ne: "Rejected" },
    fromDate: { $lte: toDate },
    toDate: { $gte: fromDate },
  });

  return !!overlap;
};

export default mongoose.model("Leave", leaveSchema);