import express from "express";
import {
  login,
  logout,
  resetPasswordWithCode,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/reset-password-with-code", resetPasswordWithCode);
router.post("/logout", protect, logout);

export default router;
