import express from "express";
import {
  getRemarks,
  updateRemark,
  approveRemarks,
  getEmployeeRemarks,
  addReason, // 🔥 IMPORTANT ADD THIS
} from "../controllers/remarkController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ==============================
   🔥 ADMIN ROUTES
============================== */

// 👉 GET all remarks (admin dashboard)
router.get("/admin", protect, adminOnly, getRemarks);

// 👉 UPDATE remark (admin only)
router.put("/admin/:id", protect, adminOnly, updateRemark);

// 👉 APPROVE remarks (bulk)
router.post("/admin/approve", protect, adminOnly, approveRemarks);

/* ==============================
   🔥 EMPLOYEE ROUTES
============================== */

// 👉 SUBMIT reason (employee)
router.post("/employee/reason/:id", protect, addReason);

// 👉 GET own remarks
router.get("/employee/:employeeId", protect, getEmployeeRemarks);

export default router;