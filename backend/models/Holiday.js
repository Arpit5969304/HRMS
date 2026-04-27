import mongoose from "mongoose";

const holidaySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Holiday name is required"],
      trim: true,
      maxlength: 100,
    },

    date: {
      type: Date,
      required: [true, "Date is required"],
      validate: {
        validator: function (value) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return value >= today;
        },
        message: "Holiday date cannot be in the past",
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300,
    },

    isNational: {
      type: Boolean,
      default: false,
      index: true,
    },

    approved: {
      type: Boolean,
      default: false,
      index: true,
    },

    type: {
      type: String,
      enum: {
        values: ["Festival", "Company", "Optional"],
        message: "Invalid holiday type",
      },
      default: "Festival",
    },

    year: {
      type: Number,
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true },
);

/* ==============================
   🔥 AUTO YEAR SET
============================== */
holidaySchema.pre("save", function () {
  if (this.date) {
    this.year = new Date(this.date).getFullYear();
  }
});

/* ==============================
   🔥 UNIQUE (PER DAY)
============================== */
holidaySchema.index({ date: 1, name: 1 }, { unique: true });
/* ==============================
   🔥 PERFORMANCE INDEX
============================== */
holidaySchema.index({ year: 1, approved: 1 });
export default mongoose.model("Holiday", holidaySchema);
