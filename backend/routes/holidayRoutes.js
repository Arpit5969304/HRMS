import express from "express";
import {
  createHoliday,
  getHolidays,
  updateHoliday,
  deleteHoliday,
  toggleApproveHoliday,
} from "../controllers/holidayController.js";

// 🔥 ADD THIS
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// ➤ GET ALL (All logged-in users)
router.get("/", protect, getHolidays);

// ➤ CREATE (Admin only)
router.post("/", protect, adminOnly, createHoliday);

// ➤ UPDATE (Admin only)
router.put("/:id", protect, adminOnly, updateHoliday);

// ➤ DELETE (Admin only)
router.delete("/:id", protect, adminOnly, deleteHoliday);

// ➤ APPROVE / TOGGLE (Admin only)
router.patch("/approve/:id", protect, adminOnly, toggleApproveHoliday);

export default router;