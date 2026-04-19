import mongoose from "mongoose";

const salarySchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    // Salary Structure
    basic: { type: Number, required: true },
    hra: { type: Number, default: 0 },
    conveyance: { type: Number, default: 0 },
    medical: { type: Number, default: 0 },
    lta: { type: Number, default: 0 },
    special: { type: Number, default: 0 },

    netSalary: Number,

    effectiveDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// 🔥 Auto calculate net salary
salarySchema.pre("save", function () {
  this.netSalary =
    this.basic +
    this.hra +
    this.conveyance +
    this.medical +
    this.lta +
    this.special;
});

export default mongoose.model("Salary", salarySchema);