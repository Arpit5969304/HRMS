import express from "express";
import upload from "../middleware/upload.js";

import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  deleteEmployee,
  updateEmployee,
  updateMyProfile,
} from "../controllers/employeeController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// ➤ CREATE EMPLOYEE (Admin only)
router.post("/", protect, upload.single("profileImage"),adminOnly, createEmployee);

// ➤ GET ALL EMPLOYEES
router.get("/", protect, getEmployees);

// ✅ GET OWN PROFILE (IMPORTANT - ABOVE :id)
router.get("/me", protect, (req, res) => {
  res.json(req.user);
});

// ✅ UPDATE OWN PROFILE
router.put("/me", protect, upload.single("profileImage"), updateMyProfile);

// ➤ GET SINGLE EMPLOYEE
router.get("/:id", protect, getEmployeeById);

// ➤ UPDATE EMPLOYEE (Admin only)
router.put("/:id", protect, adminOnly,upload.single("profileImage"),updateEmployee);

// ➤ DELETE EMPLOYEE (Admin only)
router.delete("/:id", protect, adminOnly, deleteEmployee);

export default router;
