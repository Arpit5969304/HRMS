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

/* ==============================
   🔥 EMPLOYEE ROUTES
============================== */

// ✅ CHECK-IN / CHECK-OUT
router.post("/check-in", protect, checkIn);
router.post("/check-out", protect, checkOut);

// ✅ GET OWN ATTENDANCE
router.get("/me", protect, getEmployeeAttendance);

// ✅ TODAY STATUS
router.get("/today", protect, getTodayStatus);

/* ==============================
   🔥 ADMIN ROUTES
============================== */

// ✅ GET ALL
router.get("/", protect, adminOnly, getAllAttendance);

// ✅ DELETE (SOFT DELETE)
router.delete("/:id", protect, adminOnly, deleteAttendance);

export default router;