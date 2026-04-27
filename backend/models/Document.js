import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },

    documentName: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "Aadhar Card",
        "PAN Card",
        "Resume",
        "Offer Letter",
        "Experience Letter",
      ],
    },

    filePath: {
      type: String,
      required: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    fileType: {
      type: String,
      enum: ["pdf", "jpg", "jpeg", "png"],
      required: true,
    },

    fileSize: {
      type: Number,
      required: true,
      max: 5 * 1024 * 1024, // 🔥 5MB limit
    },

    status: {
      type: String,
      enum: ["Pending", "Verified", "Rejected"],
      default: "Pending",
      index: true,
    },

    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

/* ==============================
   🔥 UNIQUE (1 document per type per employee)
============================== */
documentSchema.index(
  { employee: 1, documentName: 1 },
  { unique: true }
);

/* ==============================
   🔥 PERFORMANCE INDEXES
============================== */
documentSchema.index({ createdAt: -1 });

/* ==============================
   🔥 VALIDATION HOOK
============================== */
documentSchema.pre("save", function (next) {
  if (this.status === "Rejected" && !this.rejectionReason) {
    return next(new Error("Rejection reason is required when status is Rejected"));
  }

  next();
});

export default mongoose.model("Document", documentSchema);