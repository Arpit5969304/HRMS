import Leave from "../models/LeaveModel.js";
import Employee from "../models/Employee.js";
import mongoose from "mongoose";

/* ==============================
   🔥 FIND EMPLOYEE (SAFE)
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
   ➤ APPLY LEAVE
============================== */
export const applyLeave = async (req, res) => {
  try {
    const { employeeId, leaveType, fromDate, toDate, reason } = req.body;

    if (!employeeId || !leaveType || !fromDate || !toDate) {
      return res.status(400).json({
        message: "All required fields must be filled",
      });
    }

    const employee = await findEmployee(employeeId);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    const isOverlap = await Leave.checkOverlap(
      employee._id,
      new Date(fromDate),
      new Date(toDate),
    );

    if (isOverlap) {
      return res.status(400).json({
        message: "Leave already exists for selected dates",
      });
    }

    const start = new Date(fromDate);
    const end = new Date(toDate);

    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ❌ Past date
    if (start < today) {
      return res.status(400).json({
        message: "Leave cannot start in the past",
      });
    }

    // ❌ Invalid range
    if (end < start) {
      return res.status(400).json({
        message: "Invalid date range",
      });
    }

    // ❌ Duplicate leave check
    const exists = await Leave.findOne({
      employee: employee._id,
      fromDate: start,
      toDate: end,
    });

    if (exists) {
      return res.status(400).json({
        message: "Leave already applied for these dates",
      });
    }

    const leave = await Leave.create({
      employee: employee._id,
      leaveType,
      fromDate: start,
      toDate: end,
      reason: reason?.trim(),
      status: "Pending",
    });

    res.status(201).json({
      message: "Leave applied successfully",
      leave,
    });
  } catch (error) {
    console.error("APPLY LEAVE ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ==============================
   ➤ GET ALL LEAVES (ADMIN)
============================== */
export const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate("employee", "firstName lastName employeeId")
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    console.error("GET ALL LEAVE ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ==============================
   ➤ GET EMPLOYEE LEAVES
============================== */
export const getEmployeeLeaves = async (req, res) => {
  try {
    const input = req.params.employeeId;

    const employee = await findEmployee(input);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    // 🔐 ACCESS CONTROL
    if (
      req.user.role !== "Admin" &&
      req.user._id.toString() !== employee._id.toString()
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const leaves = await Leave.find({
      employee: employee._id,
    }).sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    console.error("GET EMPLOYEE LEAVE ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ==============================
   ➤ UPDATE LEAVE STATUS (ADMIN)
============================== */
export const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid leave ID",
      });
    }

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    const leave = await Leave.findByIdAndUpdate(id, { status }, { new: true });

    if (!leave) {
      return res.status(404).json({
        message: "Leave not found",
      });
    }

    res.json({
      message: "Leave status updated",
      leave,
    });
  } catch (error) {
    console.error("UPDATE LEAVE ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ==============================
   ➤ DELETE LEAVE
============================== */
export const deleteLeave = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid leave ID",
      });
    }

    const leave = await Leave.findById(id);

    if (!leave) {
      return res.status(404).json({
        message: "Leave not found",
      });
    }

    // 🔐 ACCESS CONTROL
    if (
      req.user.role !== "Admin" &&
      req.user._id.toString() !== leave.employee.toString()
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    await leave.deleteOne();

    res.json({
      message: "Leave deleted successfully",
    });
  } catch (error) {
    console.error("DELETE LEAVE ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
