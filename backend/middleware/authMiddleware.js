import jwt from "jsonwebtoken";
import Employee from "../models/Employee.js";

/* ==============================
   🔐 PROTECT ROUTES
============================== */
export const protect = async (req, res, next) => {
  try {
    let token;

    // 🔥 Get token
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        message: "Not authorized, token missing",
      });
    }

    // 🔥 Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 Get user
    const user = await Employee.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("AUTH ERROR:", error.message);

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

/* ==============================
   🔐 ADMIN ONLY
============================== */
export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "Admin") {
    return res.status(403).json({
      message: "Admin access only",
    });
  }

  next();
};