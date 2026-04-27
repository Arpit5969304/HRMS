import mongoose from "mongoose";

/* ==============================
   🔥 HELPERS
============================== */
const normalizeDate = (val = new Date()) => {
  const d = new Date(val);
  d.setHours(0, 0, 0, 0);
  return d;
};

const calculateWorkingHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut || checkOut <= checkIn) return 0;
  const diff = checkOut - checkIn;
  return +(diff / (1000 * 60 * 60)).toFixed(2);
};

const calculateStatus = (doc) => {
  if (!doc.checkIn) return "absent";

  // half-day has highest priority
  if (doc.workingHours && doc.workingHours < 4) {
    return "half-day";
  }

  const hour = new Date(doc.checkIn).getHours();
  return hour >= 10 ? "late" : "present";
};

/* ==============================
   🔥 SCHEMA
============================== */
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
      default: normalizeDate,
      set: normalizeDate,
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
      default: 0,
    },

    remark: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },

    remarkUpdatedAt: {
      type: Date,
    },

    reason: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },

    reasonUpdatedAt: {
      type: Date,
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

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

/* ==============================
   🔥 INDEXES
============================== */
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });
attendanceSchema.index({ approved: 1, date: -1 });

/* ==============================
   🔥 PRE SAVE (CREATE / SAVE)
============================== */
attendanceSchema.pre("save", function () {
  // ✅ working hours
  this.workingHours = calculateWorkingHours(this.checkIn, this.checkOut);

  // ✅ status
  this.status = calculateStatus(this);

});

/* ==============================
   🔥 PRE UPDATE (CRITICAL FIX)
============================== */
attendanceSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();

  if (!update) return next();

  const docToUpdate = await this.model.findOne(this.getQuery());

  const checkIn = update.checkIn || docToUpdate.checkIn;
  const checkOut = update.checkOut || docToUpdate.checkOut;

  // ✅ working hours
  const hours = calculateWorkingHours(checkIn, checkOut);
  update.workingHours = hours;

  // ✅ status
  update.status = calculateStatus({
    checkIn,
    workingHours: hours,
  });

  // ✅ remark tracking
  if (update.remark !== undefined) {
    update.remarkUpdatedAt = new Date();
  }

  // ✅ reason tracking (MISSING BEFORE ❌)
  if (update.reason !== undefined) {
    update.reasonUpdatedAt = new Date();
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
