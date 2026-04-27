import express from "express";
import {
  applyLeave,
  getAllLeaves,
  getEmployeeLeaves,
  getMyLeaves, // 🔥 added
  updateLeaveStatus,
  deleteLeave,
} from "../controllers/LeaveController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ==============================
   ➤ APPLY LEAVE (Employee)
============================== */
router.post("/", protect, applyLeave);

/* ==============================
   ➤ GET MY LEAVES (Employee)
============================== */
router.get("/my", protect, getMyLeaves);

/* ==============================
   ➤ GET SPECIFIC EMPLOYEE LEAVES
============================== */
router.get("/:employeeId", protect, getEmployeeLeaves);

/* ==============================
   ➤ GET ALL LEAVES (Admin)
============================== */
router.get("/", protect, adminOnly, getAllLeaves);

/* ==============================
   ➤ UPDATE STATUS (Admin only)
============================== */
router.put("/:id/status", protect, adminOnly, updateLeaveStatus);

/* ==============================
   ➤ DELETE LEAVE
============================== */
router.delete("/:id", protect, deleteLeave);

export default router;