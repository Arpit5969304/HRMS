import Holiday from "../models/Holiday.js";
import mongoose from "mongoose";

/* ==============================
   ➤ CREATE HOLIDAY
============================== */
export const createHoliday = async (req, res) => {
  try {
    const { name, date, description, isNational } = req.body;

    if (!name?.trim() || !date) {
      return res.status(400).json({
        message: "Name and date are required",
      });
    }

    const holidayDate = new Date(date);
    holidayDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (holidayDate < today) {
      return res.status(400).json({
        message: "Holiday date cannot be in the past",
      });
    }

    // ✅ Better duplicate check
    const exists = await Holiday.findOne({
      date: holidayDate,
      name: name.trim(),
    });

    if (exists) {
      return res.status(400).json({
        message: "Holiday already exists",
      });
    }

    const holiday = await Holiday.create({
      name: name.trim(),
      date: holidayDate,
      description: description?.trim(),
      isNational: !!isNational,
      approved: false,
    });

    res.status(201).json({
      message: "Holiday created successfully",
      holiday,
    });
  } catch (error) {
    console.error("CREATE HOLIDAY ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ==============================
   ➤ GET ALL HOLIDAYS
============================== */
export const getHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find().sort({ date: 1 });

    res.json(holidays);
  } catch (error) {
    console.error("GET HOLIDAY ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ==============================
   ➤ UPDATE HOLIDAY
============================== */
export const updateHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, date, description, isNational } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid holiday ID" });
    }

    const updateData = {};

    if (name) updateData.name = name.trim();
    if (description) updateData.description = description.trim();
    if (typeof isNational === "boolean")
      updateData.isNational = isNational;

    if (date) {
      const holidayDate = new Date(date);
      holidayDate.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (holidayDate < today) {
        return res.status(400).json({
          message: "Holiday date cannot be in the past",
        });
      }

      updateData.date = holidayDate;
    }

    const updated = await Holiday.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Holiday not found" });
    }

    res.json({
      message: "Holiday updated successfully",
      holiday: updated,
    });
  } catch (error) {
    console.error("UPDATE HOLIDAY ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ==============================
   ➤ DELETE HOLIDAY
============================== */
export const deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid holiday ID" });
    }

    const deleted = await Holiday.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Holiday not found" });
    }

    res.json({
      message: "Holiday deleted successfully",
    });
  } catch (error) {
    console.error("DELETE HOLIDAY ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ==============================
   ➤ TOGGLE APPROVE
============================== */
export const toggleApproveHoliday = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid holiday ID" });
    }

    const holiday = await Holiday.findById(id);

    if (!holiday) {
      return res.status(404).json({ message: "Holiday not found" });
    }

    holiday.approved = !holiday.approved;
    await holiday.save();

    res.json({
      message: "Approval status updated",
      holiday,
    });
  } catch (error) {
    console.error("APPROVE HOLIDAY ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};