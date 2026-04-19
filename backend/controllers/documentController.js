import Document from "../models/Document.js";
import mongoose from "mongoose";

/* ==============================
   ➤ UPLOAD DOCUMENT (EMPLOYEE)
============================== */
export const uploadDocument = async (req, res) => {
  try {
    const employeeId = req.user._id; // ✅ SECURE
    const { documentName } = req.body;

    if (!documentName || !req.file) {
      return res.status(400).json({
        message: "Document name and file are required",
      });
    }

    const doc = await Document.create({
      employee: employeeId,
      documentName: documentName.trim(),
      fileUrl: req.file.path, // ✅ CLOUDINARY URL
      fileName: req.file.originalname,
    });

    res.status(201).json({
      message: "Document uploaded",
      document: doc,
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ==============================
   ➤ GET ALL (ADMIN)
============================== */
export const getAllDocuments = async (req, res) => {
  try {
    const docs = await Document.find()
      .populate("employee", "firstName lastName employeeId")
      .sort({ createdAt: -1 });

    res.json(docs);
  } catch (error) {
    console.error("GET ALL DOC ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ==============================
   ➤ GET OWN DOCUMENTS
============================== */
export const getEmployeeDocuments = async (req, res) => {
  try {
    const employeeId = req.user._id; // ✅ FIXED

    const docs = await Document.find({
      employee: employeeId,
    }).sort({ createdAt: -1 });

    res.json(docs);
  } catch (error) {
    console.error("GET EMP DOC ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ==============================
   ➤ UPDATE STATUS (ADMIN)
============================== */
export const updateDocumentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid document ID",
      });
    }

    if (!["Verified", "Rejected"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    const updated = await Document.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    res.json({
      message: "Status updated",
      document: updated,
    });
  } catch (error) {
    console.error("UPDATE DOC ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ==============================
   ➤ DELETE DOCUMENT
============================== */
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid document ID",
      });
    }

    const doc = await Document.findById(id);

    if (!doc) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    // ✅ Only owner or admin
    if (
      user.role !== "Admin" &&
      doc.employee.toString() !== user._id.toString()
    ) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    await doc.deleteOne();

    res.json({
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("DELETE DOC ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};