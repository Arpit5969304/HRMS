import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// 🔥 Dynamic folder logic
const storage = new CloudinaryStorage({
  cloudinary,

  params: async (req, file) => {
    let folder = "hrms_misc";

    // ✅ Decide folder based on route
    if (req.baseUrl.includes("profile")) {
      folder = "hrms_profiles";
    } else if (req.baseUrl.includes("documents")) {
      folder = "hrms_documents";
    }

    return {
      folder,
      allowed_formats: ["jpg", "png", "jpeg", "pdf"],
      public_id: `${Date.now()}-${file.originalname}`,
    };
  },
});

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
      cb(new Error("Only JPG, PNG, PDF allowed"), false);
    }
  },
});

export default upload;