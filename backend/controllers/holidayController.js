import Holiday from "../models/Holiday.js";
import mongoose from "mongoose";

/* ==============================
   ➤ CREATE HOLIDAY
============================== */
export const createHoliday = async (req, res) => {
  try {
    const { name, date, description, isNational } = req.body;

    // ✅ Basic validation
    if (!name?.trim() || !date) {
      return res.status(400).json({
        success: false,
        message: "Name and date are required",
      });
    }

    const holidayDate = new Date(date);
    holidayDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (holidayDate < today) {
      return res.status(400).json({
        success: false,
        message: "Holiday date cannot be in the past",
      });
    }

    // ❌ Optional duplicate check (DB will handle final safety)
    const exists = await Holiday.findOne({
      date: holidayDate,
      name: name.trim(),
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Holiday already exists",
      });
    }

    const holiday = await Holiday.create({
      name: name.trim(),
      date: holidayDate,
      description: description?.trim(),
      isNational: Boolean(isNational),
      approved: false,
      createdBy: req.user?._id, // optional auth
    });

    res.status(201).json({
      success: true,
      message: "Holiday created successfully",
      data: holiday,
    });
  } catch (error) {
    console.error("CREATE HOLIDAY ERROR:", error);

    // 🔥 Handle duplicate index error (important)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Holiday already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* ==============================
   ➤ GET ALL HOLIDAYS (WITH FILTER)
============================== */
export const getHolidays = async (req, res) => {
  try {
    const { year, approved } = req.query;

    let filter = {};

    if (year) filter.year = Number(year);
    if (approved !== undefined) filter.approved = approved === "true";

    const holidays = await Holiday.find(filter)
      .sort({ date: 1 })
      .limit(100); // prevent heavy load

    res.json({
      success: true,
      data: holidays,
    });
  } catch (error) {
    console.error("GET HOLIDAY ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
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
      return res.status(400).json({
        success: false,
        message: "Invalid holiday ID",
      });
    }

    const updateData = {};

    // ✅ Name validation
    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty",
        });
      }
      updateData.name = name.trim();
    }

    if (description !== undefined) {
      updateData.description = description.trim();
    }

    if (typeof isNational === "boolean") {
      updateData.isNational = isNational;
    }

    let holidayDate;

    if (date) {
      holidayDate = new Date(date);
      holidayDate.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (holidayDate < today) {
        return res.status(400).json({
          success: false,
          message: "Holiday date cannot be in the past",
        });
      }

      updateData.date = holidayDate;
    }

    // 🔥 Duplicate check
    if (name || date) {
      const exists = await Holiday.findOne({
        _id: { $ne: id },
        ...(holidayDate && { date: holidayDate }),
        ...(name && { name: name.trim() }),
      });

      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Holiday already exists",
        });
      }
    }

    const updated = await Holiday.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true, // 🔥 important
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Holiday not found",
      });
    }

    res.json({
      success: true,
      message: "Holiday updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("UPDATE HOLIDAY ERROR:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate holiday",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* ==============================
   ➤ DELETE HOLIDAY
============================== */
export const deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid holiday ID",
      });
    }

    const deleted = await Holiday.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Holiday not found",
      });
    }

    res.json({
      success: true,
      message: "Holiday deleted successfully",
    });
  } catch (error) {
    console.error("DELETE HOLIDAY ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* ==============================
   ➤ TOGGLE APPROVE
============================== */
export const toggleApproveHoliday = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid holiday ID",
      });
    }

    const holiday = await Holiday.findById(id);

    if (!holiday) {
      return res.status(404).json({
        success: false,
        message: "Holiday not found",
      });
    }

    holiday.approved = !holiday.approved;
    await holiday.save();

    res.json({
      success: true,
      message: "Approval status updated",
      data: holiday,
    });
  } catch (error) {
    console.error("APPROVE HOLIDAY ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};