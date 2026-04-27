import express from "express";
import {
  saveSalary,
  applyIncrement,
  getCurrentSalary,
  getSalaryHistory,
  getIncrementHistory,
  getMySalary, // 🔥 ADD THIS
} from "../controllers/salaryController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ==============================
   ➤ SAVE SALARY (Admin only)
============================== */
router.post("/save", protect, adminOnly, saveSalary);

/* ==============================
   ➤ APPLY INCREMENT (Admin only)
============================== */
router.post("/increment", protect, adminOnly, applyIncrement);

/* ==============================
   ➤ GET CURRENT SALARY (Admin)
============================== */
router.get("/admin/current/:employeeId", protect, adminOnly, getCurrentSalary);

/* ==============================
   ➤ GET MY SALARY (Employee) 🔥
============================== */
router.get("/my", protect, getMySalary);

/* ==============================
   ➤ GET SALARY HISTORY
============================== */
router.get("/admin/:employeeId", protect, adminOnly, getSalaryHistory);
router.get("/me/history", protect, getSalaryHistory);

/* ==============================
   ➤ GET INCREMENT HISTORY
============================== */
router.get("/admin/increment/:employeeId", protect, adminOnly, getIncrementHistory);
router.get("/me/increment", protect, getIncrementHistory);

export default router;
