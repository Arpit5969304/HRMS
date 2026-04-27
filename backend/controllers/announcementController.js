import Announcement from "../models/Announcement.js";
import mongoose from "mongoose";

/* ==============================
   ➤ CREATE (Admin only)
============================== */
export const createAnnouncement = async (req, res) => {
  try {
    const { title, message, department, priority, expiryDate } = req.body;

    if (!title?.trim() || !message?.trim() || !expiryDate) {
      return res.status(400).json({
        message: "Title, message and expiry date are required",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expDate = new Date(expiryDate);
    expDate.setHours(0, 0, 0, 0);

    if (expDate < today) {
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
      createdBy: req.user._id,
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
   ➤ GET ALL (Employee/Admin)
============================== */
export const getAnnouncements = async (req, res) => {
  try {
    const today = new Date();

    const query = {
      isActive: true,
      expiryDate: { $gte: today },
    };

    // 🔥 department filtering
    if (req.user?.department && req.user.role !== "Admin") {
      query.$or = [
        { department: "All" },
        { department: req.user.department },
      ];
    }

    const data = await Announcement.find(query)
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

    const announcement = await Announcement.findById(id);

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    if (title) announcement.title = title.trim();
    if (message) announcement.message = message.trim();
    if (department) announcement.department = department;

    if (priority) {
      if (!["Normal", "Medium", "High"].includes(priority)) {
        return res.status(400).json({ message: "Invalid priority" });
      }
      announcement.priority = priority;
    }

    if (expiryDate) {
      const expDate = new Date(expiryDate);
      expDate.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (expDate < today) {
        return res.status(400).json({
          message: "Expiry date cannot be in the past",
        });
      }

      announcement.expiryDate = expDate;
    }

    await announcement.save();

    res.json({
      message: "Updated successfully",
      announcement,
    });
  } catch (error) {
    console.error("UPDATE ANNOUNCEMENT ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ==============================
   ➤ DELETE (SOFT DELETE)
============================== */
export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const announcement = await Announcement.findById(id);

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    // 🔥 SOFT DELETE
    announcement.isActive = false;
    await announcement.save();

    res.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("DELETE ANNOUNCEMENT ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};