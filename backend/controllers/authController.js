import Employee from "../models/Employee.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/* ==============================
   ➤ GENERATE TOKEN
============================== */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    }
  );
};

/* ==============================
   ➤ LOGIN
============================== */


export const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    email = email.toLowerCase().trim();

    // 🔥 FIX HERE
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

    // 🔥 SAFE CHECK
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


/* ==============================
   ➤ LOGOUT
============================== */
export const logout = async (req, res) => {
  try {
    // 🔥 If using cookies:
    // res.clearCookie("token");

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