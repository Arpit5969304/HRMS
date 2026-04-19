import express from "express";
import {
  checkIn,
  checkOut,
  getAllAttendance,
  getEmployeeAttendance,
  getTodayStatus,
  deleteAttendance,
} from "../controllers/attendanceController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// ➤ CHECK-IN / CHECK-OUT (Employee)
router.post("/check-in", protect, checkIn);
router.post("/check-out", protect, checkOut);

// ➤ EMPLOYEE OWN DATA (SAFE 🔐)
router.get("/me", protect, getEmployeeAttendance);
router.get("/today", protect, getTodayStatus);

// ➤ ADMIN ONLY
router.get("/", protect, adminOnly, getAllAttendance);

// ➤ DELETE (ADMIN)
router.delete("/:id", protect, adminOnly, deleteAttendance);

export default router;