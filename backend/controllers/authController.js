import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Employee from "../models/Employee.js";

const generateToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    },
  );

export const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    email = email.toLowerCase().trim();

    const user = await Employee.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        message: "Account is inactive. Contact admin",
      });
    }

    if (!user.password) {
      return res.status(500).json({
        message: "Password not found. Contact developer",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user);
    const userData = user.toObject();
    delete userData.password;

    res.json({
      message: "Login successful",
      token,
      user: userData,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

export const resetPasswordWithCode = async (req, res) => {
  try {
    let { email, recoveryCode, newPassword } = req.body;

    if (!email || !recoveryCode || !newPassword) {
      return res.status(400).json({
        message: "Email, recovery code and new password are required",
      });
    }

    email = email.toLowerCase().trim();
    recoveryCode = recoveryCode.trim();
    newPassword = newPassword.trim();

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters",
      });
    }

    const user = await Employee.findOne({ email }).select(
      "+password +recoveryCodeHash",
    );

    if (!user) {
      return res.status(404).json({
        message: "No account found with this email",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        message: "Account is inactive. Contact admin",
      });
    }

    if (!user.recoveryCodeHash) {
      return res.status(400).json({
        message:
          "Recovery code is not set for this account. Sign in first and save one from your profile, or contact admin.",
      });
    }

    const isRecoveryCodeValid = await bcrypt.compare(
      recoveryCode,
      user.recoveryCodeHash,
    );

    if (!isRecoveryCodeValid) {
      return res.status(401).json({
        message: "Invalid recovery code",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({
      message: "Password reset successful. You can now log in.",
    });
  } catch (error) {
    console.error("RESET PASSWORD WITH CODE ERROR:", error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.json({
      message: "Logout successful",
    });
  } catch (error) {
    console.error("LOGOUT ERROR:", error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};
