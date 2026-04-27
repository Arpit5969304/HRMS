import Document from "../models/Document.js";
import mongoose from "mongoose";

/* ==============================
   ➤ UPLOAD DOCUMENT (EMPLOYEE)
============================== */
export const uploadDocument = async (req, res) => {
  try {
    const employeeId = req.user._id;
    const { documentName } = req.body;

    if (!documentName || !req.file) {
      return res.status(400).json({
        message: "Document name and file are required",
      });
    }

    // 🔒 FILE VALIDATION
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        message: "Only PDF, JPG, PNG files are allowed",
      });
    }

    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        message: "File size must be less than 5MB",
      });
    }

    const fileType = req.file.mimetype.split("/")[1];

    // 🔥 UPSERT (replace existing document)
    const doc = await Document.findOneAndUpdate(
      {
        employee: employeeId,
        documentName: documentName.trim(),
      },
      {
        filePath: req.file.path,
        fileName: req.file.originalname,
        fileType,
        fileSize: req.file.size,
        status: "Pending",
        rejectionReason: "",
        isDeleted: false,
      },
      {
        new: true,
        upsert: true, // 🔥 important
        setDefaultsOnInsert: true,
      }
    );

    res.status(201).json({
      message: "Document uploaded successfully",
      document: doc,
    });

  } catch (error) {
    console.error("UPLOAD ERROR:", error);

    // 🔥 HANDLE DUPLICATE ERROR
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Document already exists",
      });
    }

    res.status(500).json({ message: "Server Error" });
  }
};

/* ==============================
   ➤ GET ALL (ADMIN)
============================== */
export const getAllDocuments = async (req, res) => {
  try {
    const docs = await Document.find({ isDeleted: false })
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
    const employeeId = req.user._id;

    const docs = await Document.find({
      employee: employeeId,
      isDeleted: false,
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
    const { status, rejectionReason } = req.body;

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

    if (status === "Rejected" && !rejectionReason) {
      return res.status(400).json({
        message: "Rejection reason required",
      });
    }

    const updated = await Document.findByIdAndUpdate(
      id,
      {
        status,
        rejectionReason: status === "Rejected" ? rejectionReason : "",
      },
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
   ➤ DELETE DOCUMENT (SOFT DELETE)
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

    if (!doc || doc.isDeleted) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    // 🔐 AUTH CHECK
    if (
      user.role !== "Admin" &&
      doc.employee.toString() !== user._id.toString()
    ) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    // 🔥 SOFT DELETE
    doc.isDeleted = true;
    await doc.save();

    res.json({
      message: "Document deleted successfully",
    });

  } catch (error) {
    console.error("DELETE DOC ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};