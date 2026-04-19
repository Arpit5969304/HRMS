import mongoose from "mongoose";

const incrementSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: [1, "Increment must be greater than 0"],
    },

    remarks: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    // ✅ Admin tracking
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
  },
  { timestamps: true }
);

// 🔥 Optional: index for faster queries
incrementSchema.index({ employee: 1, createdAt: -1 });

export default mongoose.model("Increment", incrementSchema);