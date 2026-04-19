import express from "express";
import {
  getRemarks,
  updateRemark,
  approveRemarks,
} from "../controllers/remarkController.js";

// 🔥 ADD THIS
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ==============================
   ➤ GET REMARKS
============================== */
// 👉 Admin → all
// 👉 Employee → only own (handle in controller)
router.get("/", protect, getRemarks);

/* ==============================
   ➤ UPDATE REMARK
============================== */
// 👉 Admin OR employee (own only)
router.put("/:id", protect, updateRemark);

/* ==============================
   ➤ APPROVE REMARKS
============================== */
// 👉 Admin only
router.post("/approve", protect, adminOnly, approveRemarks);

export default router;