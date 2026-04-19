import Attendance from "../models/attendanceModel.js";
import mongoose from "mongoose";

/* ==============================
   ➤ CHECK-IN
============================== */
export const checkIn = async (req, res) => {
  try {
    const employeeId = req.user._id; // ✅ SECURE

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await Attendance.findOne({
      employee: employeeId,
      date: today,
    });

    if (existing) {
      return res.status(400).json({
        message: "Already checked in today",
      });
    }

    const attendance = await Attendance.create({
      employee: employeeId,
      date: today,
      checkIn: new Date(),
    });

    res.status(201).json({
      message: "Check-in successful",
      attendance,
    });
  } catch (error) {
    console.error("CHECK-IN ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ==============================
   ➤ CHECK-OUT
============================== */
export const checkOut = async (req, res) => {
  try {
    const employeeId = req.user._id; // ✅ SECURE

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employee: employeeId,
      date: today,
    });

    if (!attendance) {
      return res.status(404).json({
        message: "Check-in not found",
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        message: "Already checked out",
      });
    }

    attendance.checkOut = new Date();
    await attendance.save();

    res.json({
      message: "Check-out successful",
      attendance,
    });
  } catch (error) {
    console.error("CHECK-OUT ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ==============================
   ➤ GET ALL (ADMIN)
============================== */
export const getAllAttendance = async (req, res) => {
  try {
    const data = await Attendance.find()
      .populate("employee", "firstName lastName email employeeId")
      .sort({ date: -1 });

    res.json(data);
  } catch (error) {
    console.error("GET ALL ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ==============================
   ➤ GET OWN ATTENDANCE
============================== */
export const getEmployeeAttendance = async (req, res) => {
  try {
    const employeeId = req.user._id; // ✅ FIXED

    const data = await Attendance.find({
      employee: employeeId,
    }).sort({ date: -1 });

    res.json(data);
  } catch (error) {
    console.error("GET EMPLOYEE ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ==============================
   ➤ GET TODAY STATUS
============================== */
export const getTodayStatus = async (req, res) => {
  try {
    const employeeId = req.user._id; // ✅ FIXED

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employee: employeeId,
      date: today,
    });

    res.json({
      checkedIn: !!attendance?.checkIn,
      checkedOut: !!attendance?.checkOut,
      attendance,
    });
  } catch (error) {
    console.error("TODAY STATUS ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ==============================
   ➤ DELETE (ADMIN)
============================== */
export const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid attendance ID",
      });
    }

    const deleted = await Attendance.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        message: "Attendance not found",
      });
    }

    res.json({
      message: "Attendance deleted successfully",
    });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};