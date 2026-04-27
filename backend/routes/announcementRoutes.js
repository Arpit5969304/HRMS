import express from "express";

import {
  createAnnouncement,
  getAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcementController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ==============================
   ➤ CREATE (Admin only)
============================== */
router.post("/", protect, adminOnly, createAnnouncement);

/* ==============================
   ➤ GET ALL (Employee + Admin)
============================== */
router.get("/", protect, getAnnouncements);

/* ==============================
   ➤ GET SINGLE (Admin)
============================== */
router.get("/:id", protect, adminOnly, async (req, res) => {
  // optional helper route (future use)
});

/* ==============================
   ➤ UPDATE (Admin only)
============================== */
router.put("/:id", protect, adminOnly, updateAnnouncement);

/* ==============================
   ➤ DELETE (Admin only)
============================== */
router.delete("/:id", protect, adminOnly, deleteAnnouncement);

export default router;