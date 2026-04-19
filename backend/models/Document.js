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

    fileUrl: {
      type: String,
      required: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    fileType: {
      type: String, // pdf, jpg etc
    },

    fileSize: {
      type: Number, // in bytes
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
    },
  },
  { timestamps: true }
);

/* ==============================
   🔥 UNIQUE (1 document per type)
============================== */
documentSchema.index(
  { employee: 1, documentName: 1 },
  { unique: true }
);

/* ==============================
   🔥 PERFORMANCE INDEXES
============================== */
documentSchema.index({ createdAt: -1 });

export default mongoose.model("Document", documentSchema);