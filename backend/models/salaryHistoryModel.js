import mongoose from "mongoose";

const salaryHistorySchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },

    salary: {
      basic: { type: Number, required: true, min: 0 },
      hra: { type: Number, default: 0, min: 0 },
      conveyance: { type: Number, default: 0, min: 0 },
      medical: { type: Number, default: 0, min: 0 },
      lta: { type: Number, default: 0, min: 0 },
      special: { type: Number, default: 0, min: 0 },
    },

    totalSalary: {
      type: Number,
      min: 0,
    },

    month: {
      type: Number, // 1-12
      required: true,
      min: 1,
      max: 12,
    },

    year: {
      type: Number,
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

/* ==============================
   🔥 AUTO TOTAL CALCULATION
============================== */
salaryHistorySchema.pre("save", function (next) {
  const s = this.salary;

  this.totalSalary =
    (s.basic || 0) +
    (s.hra || 0) +
    (s.conveyance || 0) +
    (s.medical || 0) +
    (s.lta || 0) +
    (s.special || 0);

  next();
});

/* ==============================
   🔥 UNIQUE (1 per month)
============================== */
salaryHistorySchema.index(
  { employee: 1, month: 1, year: 1 },
  { unique: true }
);

/* ==============================
   🔥 PERFORMANCE INDEX
============================== */
salaryHistorySchema.index({ createdAt: -1 });

export default mongoose.model("SalaryHistory", salaryHistorySchema);