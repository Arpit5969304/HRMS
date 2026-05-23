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
      select: false,
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    googleAvatar: {
      type: String,
      default: "",
      trim: true,
    },

    loginOtpHash: {
      type: String,
      select: false,
      default: "",
    },

    loginOtpExpiresAt: {
      type: Date,
      select: false,
      default: null,
    },

    passwordResetOtpHash: {
      type: String,
      select: false,
      default: "",
    },

    passwordResetOtpExpiresAt: {
      type: Date,
      select: false,
      default: null,
    },

    recoveryCodeHash: {
      type: String,
      select: false,
      default: "",
    },

    recoveryCodeUpdatedAt: {
      type: Date,
      default: null,
    },

    phone: {
      type: String,
      match: [/^[0-9]{10}$/, "Phone must be 10 digits"],
      trim: true,
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },

    department: {
      type: String,
      enum: ["HR", "IT", "Finance", "Human Resources"],
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
        validator: (value) => value < new Date(),
        message: "DOB must be in past",
      },
    },

    profileImage: {
      type: String,
      default: "",
    },

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

employeeSchema.virtual("fullName").get(function getFullName() {
  return `${this.firstName} ${this.lastName}`;
});

employeeSchema.index({ email: 1 });
employeeSchema.index({ employeeId: 1 });
employeeSchema.index({ department: 1 });
employeeSchema.index({ status: 1 });
employeeSchema.index({ googleId: 1 }, { sparse: true });

employeeSchema.pre("save", function trimEmployeeData() {
  if (this.firstName) this.firstName = this.firstName.trim();
  if (this.lastName) this.lastName = this.lastName.trim();
  if (this.phone) this.phone = this.phone.trim();
  if (this.address) this.address = this.address.trim();
});

export default mongoose.model("Employee", employeeSchema);
