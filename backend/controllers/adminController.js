import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";

/* ==============================
   ➤ GET ADMIN PROFILE
============================== */
export const getProfile = async (req, res) => {
  try {
    const adminId = req.user._id; // ✅ FIXED

    const admin = await Admin.findById(adminId).select("-password");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json(admin);
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ==============================
   ➤ UPDATE PROFILE
============================== */
export const updateProfile = async (req, res) => {
  try {
    const adminId = req.user._id; // ✅ FIXED
    const data = req.body;

    const updateData = {};

    // ✅ IMAGE
    if (req.file) {
      updateData.profileImage = req.file.path;
    }

    // ✅ NAME
    if (data.name) {
      updateData.name = data.name.trim();
    }

    // ✅ EMAIL
    if (data.email) {
      const email = data.email.toLowerCase().trim();

      if (!/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ message: "Invalid email" });
      }

      const exists = await Admin.findOne({
        email,
        _id: { $ne: adminId },
      });

      if (exists) {
        return res.status(400).json({ message: "Email already exists" });
      }

      updateData.email = email;
    }

    // ✅ PHONE
    if (data.phone) {
      updateData.phone = data.phone.trim();
    }

    // ✅ PASSWORD
    if (data.password) {
      if (data.password.length < 6) {
        return res.status(400).json({
          message: "Password must be at least 6 characters",
        });
      }

      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const updated = await Admin.findByIdAndUpdate(
      adminId,
      updateData,
      { new: true }
    ).select("-password");

    res.json({
      message: "Profile updated successfully",
      admin: updated,
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};