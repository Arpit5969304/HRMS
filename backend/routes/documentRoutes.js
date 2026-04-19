import express from "express";
import upload from "../middleware/upload.js";

import {
  uploadDocument,
  getAllDocuments,
  getEmployeeDocuments,
  updateDocumentStatus,
  deleteDocument,
} from "../controllers/documentController.js";

// 🔥 ADD THIS
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// ➤ Upload (Employee)
router.post("/", protect, upload.single("file"), uploadDocument);

// ➤ Employee own documents (SAFE 🔐)
router.get("/me", protect, getEmployeeDocuments);

// ➤ Admin only
router.get("/", protect, adminOnly, getAllDocuments);
router.put("/:id/status", protect, adminOnly, updateDocumentStatus);
router.delete("/:id", protect, adminOnly, deleteDocument);

export default router;