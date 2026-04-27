import mongoose from "mongoose";

const employeeAccountSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      unique: true,
      index: true,
    },

    bankName: {
      type: String,
      required: true,
      trim: true,
    },

    accountNumber: {
      type: String,
      required: true,
      trim: true,
    },

    ifscCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    panNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

/* 🔥 MASK ACCOUNT NUMBER */
employeeAccountSchema.methods.maskAccount = function () {
  const acc = this.accountNumber;
  return acc.slice(0, -4).replace(/./g, "X") + acc.slice(-4);
};

export default mongoose.model("EmployeeAccount", employeeAccountSchema);