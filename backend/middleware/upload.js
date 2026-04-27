import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

/* ==============================
   🔥 CLEAN FILE NAME
============================== */
const cleanFileName = (name) => {
  return name
    .replace(/\s+/g, "_")
    .replace(/[^\w.-]/g, "")
    .toLowerCase();
};

/* ==============================
   🔥 STORAGE CONFIG
============================== */
const storage = new CloudinaryStorage({
  cloudinary,

  params: async (req, file) => {
    let folder = "hrms_misc";

    // ✅ SAFE ROUTE CHECK
    if (req.originalUrl.includes("/profile")) {
      folder = "hrms_profiles";
    } else if (req.originalUrl.includes("/documents")) {
      folder = "hrms_documents";
    }

    const fileExt = file.mimetype.split("/")[1];

    return {
      folder,
      resource_type: fileExt === "pdf" ? "raw" : "image", // 🔥 IMPORTANT
      format: fileExt,
      public_id: `${Date.now()}-${cleanFileName(file.originalname)}`,
    };
  },
});

/* ==============================
   🔥 MULTER CONFIG
============================== */
const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, PDF files are allowed"), false);
    }
  },
});

/* ==============================
   🔥 ERROR HANDLER (IMPORTANT)
============================== */
export const uploadMiddleware = (req, res, next) => {
  upload.single("document")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        message: "File too large (max 5MB)",
      });
    } else if (err) {
      return res.status(400).json({
        message: err.message,
      });
    }

    next();
  });
};

export default upload;