import express from "express";
import {
  createTask,
  getTasks,
  getEmployeeTasks,
  updateTaskStatus,
  deleteTask,
} from "../controllers/taskController.js";

// 🔥 ADD THIS
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
   ➤ GET OWN TASKS (Employee)
============================== */
router.get("/me", protect, getEmployeeTasks);

/* ==============================
   ➤ UPDATE TASK STATUS
============================== */
// 👉 Employee can update own task
// 👉 Admin can update any
router.put("/:id/status", protect, updateTaskStatus);

/* ==============================
   ➤ DELETE TASK (Admin only)
============================== */
router.delete("/:id", protect, adminOnly, deleteTask);

export default router;