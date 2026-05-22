import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import Employee from "../models/Employee.js";
import { sendOtpEmail } from "../utils/email.js";
import { generateEmployeeId } from "../utils/employee.js";

let googleClient;
let googleClientId;

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const generateToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    },
  );

const getOtpExpiryMinutes = () => {
  const rawValue = Number(process.env.OTP_EXPIRY_MINUTES || 10);
  return Number.isFinite(rawValue) && rawValue > 0 ? rawValue : 10;
};

const normalizeEmail = (email = "") => email.toLowerCase().trim();
const normalizeOtp = (otp = "") => otp.trim();

const createOtpCode = () =>
  String(Math.floor(100000 + Math.random() * 900000));

const clearLoginOtp = (user) => {
  user.loginOtpHash = "";
  user.loginOtpExpiresAt = null;
};

const clearPasswordResetOtp = (user) => {
  user.passwordResetOtpHash = "";
  user.passwordResetOtpExpiresAt = null;
};

const createSafeUser = (user) => {
  const userData = user.toObject ? user.toObject() : { ...user };

  delete userData.password;
  delete userData.loginOtpHash;
  delete userData.loginOtpExpiresAt;
  delete userData.passwordResetOtpHash;
  delete userData.passwordResetOtpExpiresAt;
  delete userData.recoveryCodeHash;

  return userData;
};

const sendAuthResponse = (res, user, message, extras = {}) => {
  res.json({
    message,
    token: generateToken(user),
    user: createSafeUser(user),
    ...extras,
  });
};

const sendOtpAndPersist = async (user, fieldPrefix, purpose) => {
  const otp = createOtpCode();
  const hash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + getOtpExpiryMinutes() * 60 * 1000);

  if (fieldPrefix === "login") {
    user.loginOtpHash = hash;
    user.loginOtpExpiresAt = expiresAt;
  } else {
    user.passwordResetOtpHash = hash;
    user.passwordResetOtpExpiresAt = expiresAt;
  }

  await user.save();

  try {
    await sendOtpEmail({
      to: user.email,
      firstName: user.firstName,
      otp,
      purpose,
      expiryMinutes: getOtpExpiryMinutes(),
    });
  } catch (error) {
    if (fieldPrefix === "login") {
      clearLoginOtp(user);
    } else {
      clearPasswordResetOtp(user);
    }

    await user.save();
    throw error;
  }
};

const getGoogleClient = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();

  if (!clientId) {
    throw createHttpError(
      500,
      "Google auth is not configured. Set GOOGLE_CLIENT_ID in the backend environment.",
    );
  }

  if (!googleClient || googleClientId !== clientId) {
    googleClient = new OAuth2Client(clientId);
    googleClientId = clientId;
  }

  return {
    client: googleClient,
    clientId,
  };
};

const getGoogleNameParts = (profile = {}) => {
  const fullName = profile.name?.trim() || "";
  const fullNameParts = fullName ? fullName.split(/\s+/) : [];
  const fallbackFirstName = fullNameParts[0] || "Google";
  const fallbackLastName = fullNameParts.slice(1).join(" ") || "User";

  return {
    firstName: profile.given_name?.trim() || fallbackFirstName,
    lastName: profile.family_name?.trim() || fallbackLastName,
  };
};

const handleServerError = (res, label, error) => {
  console.error(`${label}:`, error);

  if (error.statusCode) {
    return res.status(error.statusCode).json({
      message: error.message,
    });
  }

  if (
    error.message?.startsWith("Email service is not configured") ||
    error.message?.startsWith("Unable to send OTP email") ||
    error.message?.startsWith("Google auth is not configured")
  ) {
    return res.status(500).json({
      message: error.message,
    });
  }

  return res.status(500).json({
    message: "Server Error",
  });
};

export const login = async (req, res) => {
  try {
    let { email, password, otp } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    email = normalizeEmail(email);
    password = password.trim();
    otp = normalizeOtp(otp);

    const user = await Employee.findOne({ email }).select(
      "+password +loginOtpHash +loginOtpExpiresAt",
    );

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        message: "Account is inactive. Contact admin",
      });
    }

    if (!user.password) {
      return res.status(500).json({
        message: "Password not found. Contact developer",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    if (!otp) {
      await sendOtpAndPersist(user, "login", "login");

      return res.status(202).json({
        requiresOtp: true,
        message:
          "A login OTP has been sent to your email. Enter it to finish signing in.",
      });
    }

    if (!user.loginOtpHash || !user.loginOtpExpiresAt) {
      return res.status(400).json({
        message: "Request a fresh login OTP first.",
      });
    }

    if (user.loginOtpExpiresAt.getTime() < Date.now()) {
      clearLoginOtp(user);
      await user.save();

      return res.status(401).json({
        message: "Login OTP expired. Request a new OTP and try again.",
      });
    }

    const isOtpValid = await bcrypt.compare(otp, user.loginOtpHash);

    if (!isOtpValid) {
      return res.status(401).json({
        message: "Invalid login OTP",
      });
    }

    clearLoginOtp(user);
    await user.save();

    return sendAuthResponse(res, user, "Login successful");
  } catch (error) {
    return handleServerError(res, "LOGIN ERROR", error);
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Google credential is required",
      });
    }

    const { client, clientId } = getGoogleClient();
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    const payload = ticket.getPayload();

    if (!payload?.email || !payload.email_verified || !payload.sub) {
      throw createHttpError(
        401,
        "Google account could not be verified. Please try again.",
      );
    }

    const email = normalizeEmail(payload.email);
    let user = await Employee.findOne({ googleId: payload.sub });

    if (!user) {
      user = await Employee.findOne({ email });
    }

    if (user && user.googleId && user.googleId !== payload.sub) {
      return res.status(409).json({
        message:
          "This work email is already linked to another Google account. Please contact admin.",
      });
    }

    let isNewUser = false;

    if (!user) {
      const employeeId = await generateEmployeeId();
      const { firstName, lastName } = getGoogleNameParts(payload);
      const randomPassword = await bcrypt.hash(
        crypto.randomBytes(24).toString("hex"),
        10,
      );

      user = await Employee.create({
        employeeId,
        firstName,
        lastName,
        email,
        password: randomPassword,
        gender: "Other",
        department: "HR",
        role: "Employee",
        status: "active",
        googleId: payload.sub,
        googleAvatar: payload.picture || "",
        profileImage: payload.picture || "",
      });
      isNewUser = true;
    } else {
      if (user.status !== "active") {
        return res.status(403).json({
          message: "Account is inactive. Contact admin",
        });
      }

      let shouldSave = false;

      if (!user.googleId) {
        user.googleId = payload.sub;
        shouldSave = true;
      }

      if (payload.picture && !user.googleAvatar) {
        user.googleAvatar = payload.picture;
        shouldSave = true;
      }

      if (payload.picture && !user.profileImage) {
        user.profileImage = payload.picture;
        shouldSave = true;
      }

      if (shouldSave) {
        await user.save();
      }
    }

    return sendAuthResponse(
      res,
      user,
      isNewUser ? "Google signup successful" : "Google login successful",
      { isNewUser },
    );
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    if (error.message?.startsWith("Google auth is not configured")) {
      return res.status(500).json({
        message: error.message,
      });
    }

    console.error("GOOGLE AUTH ERROR:", error);
    return res.status(401).json({
      message: "Google sign in failed. Please try again.",
    });
  }
};

export const requestPasswordResetOtp = async (req, res) => {
  try {
    let { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    email = normalizeEmail(email);

    const user = await Employee.findOne({ email }).select(
      "+passwordResetOtpHash +passwordResetOtpExpiresAt",
    );

    if (!user || user.status !== "active") {
      return res.json({
        message:
          "If an active account exists for this email, a password reset OTP has been sent.",
      });
    }

    await sendOtpAndPersist(user, "passwordReset", "passwordReset");

    return res.json({
      message:
        "Password reset OTP sent. Use it to create a new password.",
    });
  } catch (error) {
    return handleServerError(res, "REQUEST PASSWORD RESET OTP ERROR", error);
  }
};

export const resetPasswordWithOtp = async (req, res) => {
  try {
    let { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        message: "Email, OTP and new password are required",
      });
    }

    email = normalizeEmail(email);
    otp = normalizeOtp(otp);
    newPassword = newPassword.trim();

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters",
      });
    }

    const user = await Employee.findOne({ email }).select(
      "+password +passwordResetOtpHash +passwordResetOtpExpiresAt +loginOtpHash +loginOtpExpiresAt",
    );

    if (!user) {
      return res.status(404).json({
        message: "No account found with this email",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        message: "Account is inactive. Contact admin",
      });
    }

    if (!user.passwordResetOtpHash || !user.passwordResetOtpExpiresAt) {
      return res.status(400).json({
        message: "Request a password reset OTP first.",
      });
    }

    if (user.passwordResetOtpExpiresAt.getTime() < Date.now()) {
      clearPasswordResetOtp(user);
      await user.save();

      return res.status(401).json({
        message: "Password reset OTP expired. Request a new OTP and try again.",
      });
    }

    const isOtpValid = await bcrypt.compare(otp, user.passwordResetOtpHash);

    if (!isOtpValid) {
      return res.status(401).json({
        message: "Invalid password reset OTP",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    clearPasswordResetOtp(user);
    clearLoginOtp(user);
    await user.save();

    return res.json({
      message: "Password reset successful. You can now log in.",
    });
  } catch (error) {
    return handleServerError(res, "RESET PASSWORD WITH OTP ERROR", error);
  }
};

export const resetPasswordWithCode = async (req, res) => {
  try {
    let { email, recoveryCode, newPassword } = req.body;

    if (!email || !recoveryCode || !newPassword) {
      return res.status(400).json({
        message: "Email, recovery code and new password are required",
      });
    }

    email = normalizeEmail(email);
    recoveryCode = recoveryCode.trim();
    newPassword = newPassword.trim();

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters",
      });
    }

    const user = await Employee.findOne({ email }).select(
      "+password +recoveryCodeHash +loginOtpHash +loginOtpExpiresAt +passwordResetOtpHash +passwordResetOtpExpiresAt",
    );

    if (!user) {
      return res.status(404).json({
        message: "No account found with this email",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        message: "Account is inactive. Contact admin",
      });
    }

    if (!user.recoveryCodeHash) {
      return res.status(400).json({
        message:
          "Recovery code is not set for this account. Sign in first and save one from your profile, or contact admin.",
      });
    }

    const isRecoveryCodeValid = await bcrypt.compare(
      recoveryCode,
      user.recoveryCodeHash,
    );

    if (!isRecoveryCodeValid) {
      return res.status(401).json({
        message: "Invalid recovery code",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    clearLoginOtp(user);
    clearPasswordResetOtp(user);
    await user.save();

    return res.json({
      message: "Password reset successful. You can now log in.",
    });
  } catch (error) {
    return handleServerError(res, "RESET PASSWORD WITH CODE ERROR", error);
  }
};

export const logout = async (req, res) => {
  try {
    res.json({
      message: "Logout successful",
    });
  } catch (error) {
    console.error("LOGOUT ERROR:", error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};
