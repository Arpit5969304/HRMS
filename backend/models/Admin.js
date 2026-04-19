import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email"],
      index: true,
    },

    phone: {
      type: String,
      trim: true,
      match: [/^[0-9]{10}$/, "Phone must be 10 digits"],
    },

    role: {
      type: String,
      enum: ["SuperAdmin", "Admin"],
      default: "Admin",
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // 🔥 hide password by default
    },

    profileImage: {
      type: String,
      default: "",
    },

    /* ==============================
       🔐 SECURITY FIELDS
    ============================== */

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: Date,

    passwordChangedAt: Date,

    /* ==============================
       🔁 RESET PASSWORD
    ============================== */

    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

/* ==============================
   🔥 INDEXES
============================== */
adminSchema.index({ createdAt: -1 });

export default mongoose.model("Admin", adminSchema);