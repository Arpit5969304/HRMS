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
    const { leaveType, fromDate, toDate, reason } = req.body;

    if (!leaveType || !fromDate || !toDate) {
      return res.status(400).json({
        message: "All required fields must be filled",
      });
    }

    const employee = await Employee.findById(req.user._id);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    const start = new Date(fromDate);
    const end = new Date(toDate);

    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return res.status(400).json({
        message: "Leave cannot start in the past",
      });
    }

    if (end < start) {
      return res.status(400).json({
        message: "Invalid date range",
      });
    }

    const isOverlap = await Leave.checkOverlap(employee._id, start, end);

    if (isOverlap) {
      return res.status(400).json({
        message: "Leave already exists for selected dates",
      });
    }

    const leave = await Leave.create({
      employee: employee._id,
      leaveType,
      fromDate: start,
      toDate: end,
      reason: reason?.trim(),
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
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const leaves = await Leave.find({ isActive: true })
      .populate("employee", "firstName lastName employeeId")
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    console.error("GET ALL LEAVE ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ==============================
   ➤ GET MY LEAVES (EMPLOYEE)
============================== */
export const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({
      employee: req.user._id,
      isActive: true,
    }).sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    console.error("GET MY LEAVE ERROR:", error);
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
      isActive: true,
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

  console.log("Updated:", res.data);
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied" });
    }

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

    const leave = await Leave.findById(id);

    if (!leave) {
      return res.status(404).json({
        message: "Leave not found",
      });
    }

    leave.status = status;
    leave.approvedBy = req.user._id;

    if (status === "Rejected") {
      leave.rejectionReason = rejectionReason?.trim();
    }

    await leave.save();

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
   ➤ DELETE LEAVE (SOFT DELETE)
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

    if (
      req.user.role !== "Admin" &&
      req.user._id.toString() !== leave.employee.toString()
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    // 🔥 SOFT DELETE
    leave.isActive = false;
    await leave.save();

    res.json({
      message: "Leave deleted successfully",
    });
  } catch (error) {
    console.error("DELETE LEAVE ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
