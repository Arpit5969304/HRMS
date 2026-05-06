import mongoose from "mongoose";

const salaryBreakdownSchema = new mongoose.Schema(
  {
    basic: { type: Number, required: true, min: 0, default: 0 },
    hra: { type: Number, min: 0, default: 0 },
    conveyance: { type: Number, min: 0, default: 0 },
    medical: { type: Number, min: 0, default: 0 },
    lta: { type: Number, min: 0, default: 0 },
    special: { type: Number, min: 0, default: 0 },
  },
  { _id: false },
);

const payrollSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    salary: {
      type: salaryBreakdownSchema,
      required: true,
    },
    grossSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    workingDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    weeklyOffDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    holidayDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    presentDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    lateDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    halfDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    paidLeaveDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    unpaidLeaveDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    unpaidAttendanceDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    absentDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    payableDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    deductionDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    perDaySalary: {
      type: Number,
      default: 0,
      min: 0,
    },
    deductionAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    payableSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["Paid"],
      default: "Paid",
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
  },
  { timestamps: true },
);

payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });
payrollSchema.index({ paidAt: -1 });

export default mongoose.model("Payroll", payrollSchema);
