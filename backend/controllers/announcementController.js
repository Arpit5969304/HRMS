import Announcement from "../models/Announcement.js";
import mongoose from "mongoose";

/* ==============================
   ➤ CREATE (Admin only)
============================== */
export const createAnnouncement = async (req, res) => {
  try {
    const { title, message, department, priority, expiryDate } = req.body;

    // ✅ Validation
    if (!title?.trim() || !message?.trim() || !expiryDate) {
      return res.status(400).json({
        message: "Title, message and expiry date are required",
      });
    }

    const today = new Date();
    const expDate = new Date(expiryDate);

    if (expDate < today.setHours(0, 0, 0, 0)) {
      return res.status(400).json({
        message: "Expiry date cannot be in the past",
      });
    }

    const announcement = await Announcement.create({
      title: title.trim(),
      message: message.trim(),
      department: department || "All",
      priority: ["Normal", "Medium", "High"].includes(priority)
        ? priority
        : "Normal",
      expiryDate: expDate,
      createdBy: req.user?._id, // ✅ track admin
    });

    res.status(201).json({
      message: "Announcement created",
      announcement,
    });
  } catch (error) {
    console.error("CREATE ANNOUNCEMENT ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ==============================
   ➤ GET ALL (Public / Protected)
============================== */
export const getAnnouncements = async (req, res) => {
  try {
    const today = new Date();

    const data = await Announcement.find({
      expiryDate: { $gte: today }, // ✅ only active
    })
      .sort({ createdAt: -1 });

    res.json(data);
  } catch (error) {
    console.error("GET ANNOUNCEMENT ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ==============================
   ➤ UPDATE (Admin only)
============================== */
export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, department, priority, expiryDate } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const updateData = {};

    if (title) updateData.title = title.trim();
    if (message) updateData.message = message.trim();
    if (department) updateData.department = department;

    if (priority) {
      if (!["Normal", "Medium", "High"].includes(priority)) {
        return res.status(400).json({ message: "Invalid priority" });
      }
      updateData.priority = priority;
    }

    if (expiryDate) {
      const expDate = new Date(expiryDate);
      const today = new Date();

      if (expDate < today.setHours(0, 0, 0, 0)) {
        return res.status(400).json({
          message: "Expiry date cannot be in the past",
        });
      }

      updateData.expiryDate = expDate;
    }

    const updated = await Announcement.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    res.json({
      message: "Updated successfully",
      announcement: updated,
    });
  } catch (error) {
    console.error("UPDATE ANNOUNCEMENT ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ==============================
   ➤ DELETE (Admin only)
============================== */
export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const deleted = await Announcement.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    res.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("DELETE ANNOUNCEMENT ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};