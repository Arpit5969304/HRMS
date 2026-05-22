import express from "express";
import {
  googleAuth,
  login,
  logout,
  requestPasswordResetOtp,
  resetPasswordWithOtp,
  resetPasswordWithCode,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/google", googleAuth);
router.post("/request-password-reset-otp", requestPasswordResetOtp);
router.post("/reset-password-with-otp", resetPasswordWithOtp);
router.post("/reset-password-with-code", resetPasswordWithCode);
router.post("/logout", protect, logout);

export default router;
