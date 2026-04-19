import mongoose from "mongoose";

const holidaySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    date: {
      type: Date,
      required: true,
      set: (val) => {
        const d = new Date(val);
        d.setHours(0, 0, 0, 0); // 🔥 normalize
        return d;
      },
      index: true,
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
      enum: ["Festival", "Company", "Optional"],
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
  { timestamps: true }
);

/* ==============================
   🔥 AUTO YEAR SET
============================== */
holidaySchema.pre("save", function (next) {
  if (this.date) {
    this.year = new Date(this.date).getFullYear();
  }
  next();
});

/* ==============================
   🔥 UNIQUE (PER DAY)
============================== */
holidaySchema.index({ date: 1 }, { unique: true });

/* ==============================
   🔥 PERFORMANCE INDEX
============================== */
holidaySchema.index({ year: 1, approved: 1 });

export default mongoose.model("Holiday", holidaySchema);