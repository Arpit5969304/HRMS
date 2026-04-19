import express from "express";

import {
  createAnnouncement,
  getAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcementController.js";

// 🔥 ADD THIS
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// ➤ CREATE (Admin only)
router.post("/", protect, adminOnly, createAnnouncement);

// ➤ GET ALL (Logged-in users)
router.get("/", protect, getAnnouncements);

// ➤ UPDATE (Admin only)
router.put("/:id", protect, adminOnly, updateAnnouncement);

// ➤ DELETE (Admin only)
router.delete("/:id", protect, adminOnly, deleteAnnouncement);

export default router;