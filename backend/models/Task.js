import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },

    department: {
      type: String,
      enum: ["HR", "IT", "Finance"], // can be dynamic later
      required: true,
      index: true,
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
      index: true,
    },

    deadline: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const input = new Date(value);
          input.setHours(0, 0, 0, 0);

          return input >= today;
        },
        message: "Deadline cannot be in the past",
      },
      index: true,
    },

    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
      index: true,
    },

    // 🔥 who assigned task (admin / manager)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

/* ==============================
   🔥 COMPOUND INDEX (FAST FILTER)
============================== */
taskSchema.index({ employee: 1, status: 1 });
taskSchema.index({ department: 1, status: 1 });

/* ==============================
   🔥 NORMALIZE DEADLINE
============================== */
taskSchema.pre("save", function () {
  if (this.deadline) {
    const d = new Date(this.deadline);
    d.setHours(0, 0, 0, 0);
    this.deadline = d;
  }
});

export default mongoose.model("Task", taskSchema);