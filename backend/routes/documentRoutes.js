import express from "express";
import upload from "../middleware/upload.js";

import {
  uploadDocument,
  getAllDocuments,
  getEmployeeDocuments,
  updateDocumentStatus,
  deleteDocument,
} from "../controllers/documentController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ==============================
   📌 EMPLOYEE ROUTES
============================== */

// 🔥 Upload Document (Employee)
router.post(
  "/upload",
  protect,
  upload.single("document"), // ✅ must match frontend
  uploadDocument
);

// 🔥 Get own documents
router.get("/my-documents", protect, getEmployeeDocuments);

// 🔥 Delete own document (employee allowed)
router.delete("/delete/:id", protect, deleteDocument);


/* ==============================
   📌 ADMIN ROUTES
============================== */

// 🔥 Get all documents
router.get("/all", protect, adminOnly, getAllDocuments);

// 🔥 Update document status
router.put("/status/:id", protect, adminOnly, updateDocumentStatus);

// 🔥 Admin delete
router.delete("/admin-delete/:id", protect, adminOnly, deleteDocument);

export default router;