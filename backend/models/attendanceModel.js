import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },

    date: {
      type: Date,
      required: true,
      default: () => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
      },
      set: (val) => {
        const d = new Date(val);
        d.setHours(0, 0, 0, 0);
        return d;
      },
      index: true,
    },

    checkIn: Date,

    checkOut: {
      type: Date,
      validate: {
        validator: function (val) {
          if (!val || !this.checkIn) return true;
          return val > this.checkIn;
        },
        message: "Check-out must be after check-in",
      },
    },

    workingHours: {
      type: Number,
      min: 0,
    },

    remark: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },

    approved: {
      type: Boolean,
      default: false,
      index: true,
    },

    status: {
      type: String,
      enum: ["present", "absent", "late", "half-day"],
      default: "present",
      index: true,
    },

    /* ==============================
       🔥 ADMIN CONTROL
    ============================== */
    manuallyUpdated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

/* ==============================
   🔥 UNIQUE (1 per day)
============================== */
attendanceSchema.index(
  { employee: 1, date: 1 },
  { unique: true }
);

/* ==============================
   🔥 AUTO CALCULATION
============================== */
attendanceSchema.pre("save", function (next) {
  // 🔥 skip if admin manually updated
  if (this.manuallyUpdated) return next();

  // ✅ working hours
  if (this.checkIn && this.checkOut && this.checkOut > this.checkIn) {
    const diff = this.checkOut - this.checkIn;
    this.workingHours = +(diff / (1000 * 60 * 60)).toFixed(2);
  }

  // ✅ status logic
  if (!this.checkIn) {
    this.status = "absent";
  } else {
    const hour = new Date(this.checkIn).getHours();

    if (hour >= 10) {
      this.status = "late";
    } else {
      this.status = "present";
    }
  }

  // ✅ half-day override (highest priority)
  if (this.workingHours && this.workingHours < 4) {
    this.status = "half-day";
  }

  next();
});

/* ==============================
   🔥 STATIC METHOD (SAFE CREATE)
============================== */
attendanceSchema.statics.safeCheckIn = async function (data) {
  try {
    return await this.create(data);
  } catch (err) {
    if (err.code === 11000) {
      throw new Error("Already checked in today");
    }
    throw err;
  }
};

export default mongoose.model("Attendance", attendanceSchema);