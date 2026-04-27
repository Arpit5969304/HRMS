import Attendance from "../models/attendanceModel.js";
import mongoose from "mongoose";

/* ==============================
   🔥 COMMON RESPONSE
============================== */
const sendResponse = (res, status, message, data = null) => {
  return res.status(status).json({
    success: status < 400,
    message,
    data,
  });
};

/* ==============================
   ➤ CHECK-IN
============================== */
export const checkIn = async (req, res) => {
  try {
    const employeeId = req.user._id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 🔥 USE SAFE CHECK-IN
    const attendance = await Attendance.safeCheckIn({
      employee: employeeId,
      date: today,
      checkIn: new Date(),
    });

    sendResponse(res, 201, "Check-in successful", attendance);
  } catch (error) {
    if (error.message.includes("Already checked in")) {
      return sendResponse(res, 400, error.message);
    }

    console.error("CHECK-IN ERROR:", error);
    sendResponse(res, 500, "Server Error");
  }
};

/* ==============================
   ➤ CHECK-OUT
============================== */
export const checkOut = async (req, res) => {
  try {
    const employeeId = req.user._id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employee: employeeId,
      date: today,
      isDeleted: false,
    });

    if (!attendance) {
      return sendResponse(res, 404, "Check-in not found");
    }

    if (attendance.checkOut) {
      return sendResponse(res, 400, "Already checked out");
    }

    attendance.checkOut = new Date();
    await attendance.save();

    sendResponse(res, 200, "Check-out successful", attendance);
  } catch (error) {
    console.error("CHECK-OUT ERROR:", error);
    sendResponse(res, 500, "Server Error");
  }
};

/* ==============================
   ➤ GET ALL (ADMIN)
============================== */
export const getAllAttendance = async (req, res) => {
  try {
    const data = await Attendance.find({ isDeleted: false })
      .populate("employee", "firstName lastName email employeeId")
      .sort({ date: -1 });

    sendResponse(res, 200, "Attendance fetched", data);
  } catch (error) {
    console.error("GET ALL ERROR:", error);
    sendResponse(res, 500, "Server Error");
  }
};

/* ==============================
   ➤ GET OWN ATTENDANCE
============================== */
export const getEmployeeAttendance = async (req, res) => {
  try {
    const employeeId = req.user._id;

    const data = await Attendance.find({
      employee: employeeId,
      isDeleted: false,
    }).sort({ date: -1 });

    sendResponse(res, 200, "Attendance fetched", data);
  } catch (error) {
    console.error("GET EMPLOYEE ERROR:", error);
    sendResponse(res, 500, "Server Error");
  }
};

/* ==============================
   ➤ GET TODAY STATUS
============================== */
export const getTodayStatus = async (req, res) => {
  try {
    const employeeId = req.user._id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employee: employeeId,
      date: today,
      isDeleted: false,
    });

    sendResponse(res, 200, "Status fetched", {
      checkedIn: !!attendance?.checkIn,
      checkedOut: !!attendance?.checkOut,
      attendance,
    });
  } catch (error) {
    console.error("TODAY STATUS ERROR:", error);
    sendResponse(res, 500, "Server Error");
  }
};

/* ==============================
   ➤ DELETE (ADMIN → SOFT DELETE)
============================== */
export const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendResponse(res, 400, "Invalid attendance ID");
    }

    const attendance = await Attendance.findById(id);

    if (!attendance) {
      return sendResponse(res, 404, "Attendance not found");
    }

    // 🔥 SOFT DELETE
    attendance.isDeleted = true;
    await attendance.save();

    sendResponse(res, 200, "Attendance deleted successfully");
  } catch (error) {
    console.error("DELETE ERROR:", error);
    sendResponse(res, 500, "Server Error");
  }
};