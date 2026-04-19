import express from "express";
import {
  getProfile,
  updateProfile,
} from "../controllers/adminController.js";

import upload from "../middleware/upload.js";

// 🔥 ADD THIS
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// ➤ GET PROFILE (Admin only, own profile)
router.get("/me", protect, adminOnly, getProfile);

// ➤ UPDATE PROFILE (Admin only)
router.put(
  "/me",
  protect,
  adminOnly,
  upload.single("image"),
  updateProfile
);

export default router;