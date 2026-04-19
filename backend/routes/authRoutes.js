import express from "express";
import { login, logout } from "../controllers/authController.js";

// 🔥 ADD THIS
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ➤ LOGIN (Public)
router.post("/login", login);

// ➤ LOGOUT (Protected)
router.post("/logout", protect, logout);

export default router;