import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
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

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // 🔐 IMPORTANT
    },

    phone: {
      type: String,
      match: [/^[0-9]{10}$/, "Phone must be 10 digits"],
      trim: true,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },

    department: {
      type: String,
      enum: ["HR", "IT", "Finance"],
      required: true,
      index: true,
    },

    designation: {
      type: String,
      trim: true,
    },

    role: {
      type: String,
      enum: ["Admin", "Employee"],
      default: "Employee",
    },

    // 🔥 RELATION (BEST PRACTICE)
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },

    employmentType: {
      type: String,
      enum: ["Full-Time", "Part-Time", "Intern"],
    },

    status: {
      type: String,
      enum: ["active", "inactive", "terminated"],
      default: "active",
      index: true,
    },

    joinDate: {
      type: Date,
      default: Date.now,
    },

    dob: {
      type: Date,
      validate: {
        validator: (v) => v < new Date(),
        message: "DOB must be in past",
      },
    },

    profileImage: {
      type: String,
      default: "",
    },

    // 🔥 Soft delete support
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

/* ==============================
   🔥 VIRTUALS
============================== */

// Full Name
employeeSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

/* ==============================
   🔥 INDEXES (PERFORMANCE)
============================== */
employeeSchema.index({ email: 1 });
employeeSchema.index({ employeeId: 1 });
employeeSchema.index({ department: 1 });
employeeSchema.index({ status: 1 });

/* ==============================
   🔥 CLEAN DATA BEFORE SAVE
============================== */
employeeSchema.pre("save", function (next) {
  if (this.firstName) this.firstName = this.firstName.trim();
  if (this.lastName) this.lastName = this.lastName.trim();
  if (this.phone) this.phone = this.phone.trim();
});

export default mongoose.model("Employee", employeeSchema);
