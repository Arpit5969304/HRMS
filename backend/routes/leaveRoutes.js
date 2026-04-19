import express from "express";
import {
  applyLeave,
  getAllLeaves,
  getEmployeeLeaves,
  updateLeaveStatus,
  deleteLeave,
} from "../controllers/LeaveController.js";

// 🔥 ADD THIS
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ==============================
   ➤ APPLY LEAVE (Employee)
============================== */
router.post("/", protect, applyLeave);

/* ==============================
   ➤ GET OWN LEAVES (SAFE 🔐)
============================== */
router.get("/me", protect, getEmployeeLeaves);

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