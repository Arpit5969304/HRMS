import express from "express";
import {
  createTask,
  getTasks,
  getEmployeeTasks,
  updateTaskStatus,
  deleteTask,
} from "../controllers/taskController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ==============================
   ➤ CREATE TASK (Admin only)
============================== */
router.post("/", protect, adminOnly, createTask);

/* ==============================
   ➤ GET ALL TASKS (Admin)
============================== */
router.get("/", protect, adminOnly, getTasks);

/* ==============================
   ➤ GET MY TASKS (Employee)
============================== */
router.get("/my", protect, getEmployeeTasks);

/* ==============================
   ➤ GET SPECIFIC EMPLOYEE TASKS (Admin)
============================== */
router.get("/employee/:employeeId", protect, adminOnly, getEmployeeTasks);

/* ==============================
   ➤ UPDATE TASK STATUS
============================== */
router.put("/:id/status", protect, updateTaskStatus);

/* ==============================
   ➤ DELETE TASK (Admin only)
============================== */
router.delete("/:id", protect, adminOnly, deleteTask);

export default router;