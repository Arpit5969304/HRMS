import Attendance from "../models/attendanceModel.js";
import Employee from "../models/Employee.js";
import mongoose from "mongoose";

/* ==============================
   🔥 SAFE FIND EMPLOYEE
============================== */
const findEmployee = async (input) => {
  if (!input) return null;

  if (mongoose.Types.ObjectId.isValid(input) && input.length === 24) {
    return await Employee.findById(input);
  } else {
    return await Employee.findOne({ employeeId: input });
  }
};

/* ==============================
   ➤ GET ALL REMARKS (ADMIN)
============================== */
export const getRemarks = async (req, res) => {
  try {
    const data = await Attendance.find()
      .populate("employee", "firstName lastName department employeeId")
      .sort({ date: -1 });

    res.json(data);
  } catch (error) {
    console.error("GET REMARK ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ==============================
   ➤ UPDATE REMARK (ADMIN ONLY)
============================== */
export const updateRemark = async (req, res) => {
  try {
    const { id } = req.params;
    const { remark } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid attendance ID",
      });
    }

    if (!remark || remark.trim().length < 2) {
      return res.status(400).json({
        message: "Valid remark is required",
      });
    }

    const attendance = await Attendance.findById(id);

    if (!attendance) {
      return res.status(404).json({
        message: "Attendance not found",
      });
    }

    attendance.remark = remark.trim();
    await attendance.save();

    res.json({
      message: "Remark updated successfully",
      attendance,
    });
  } catch (error) {
    console.error("UPDATE REMARK ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ==============================
   ➤ APPROVE MULTIPLE REMARKS (ADMIN)
============================== */
export const approveRemarks = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        message: "Please provide valid IDs",
      });
    }

    // ✅ filter valid ObjectIds
    const validIds = ids.filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );

    if (validIds.length === 0) {
      return res.status(400).json({
        message: "No valid IDs provided",
      });
    }

    const result = await Attendance.updateMany(
      { _id: { $in: validIds } },
      { $set: { approved: true } }
    );

    res.json({
      message: "Remarks approved successfully",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("APPROVE ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};