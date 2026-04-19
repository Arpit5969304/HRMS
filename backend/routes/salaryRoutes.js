import express from "express";
import {
  saveSalary,
  applyIncrement,
  getSalaryHistory,
  getIncrementHistory,
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
   ➤ GET SALARY HISTORY
============================== */

// ✅ Admin view
router.get("/admin/:employeeId", protect, adminOnly, getSalaryHistory);

// ✅ Employee own
router.get("/me/history", protect, getSalaryHistory);

/* ==============================
   ➤ GET INCREMENT HISTORY
============================== */

// ✅ Admin view
router.get("/admin/increment/:employeeId", protect, adminOnly, getIncrementHistory);

// ✅ Employee own
router.get("/me/increment", protect, getIncrementHistory);

export default router;