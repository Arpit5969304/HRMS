import Task from "../models/Task.js";
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
   ➤ CREATE TASK (ADMIN)
============================== */
export const createTask = async (req, res) => {
  try {
    const { title, employeeId, department, priority, deadline } = req.body;

    if (!title || !employeeId || !department || !deadline) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const employee = await findEmployee(employeeId);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    // ✅ Proper date validation
    const taskDeadline = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (taskDeadline < today) {
      return res.status(400).json({
        message: "Deadline cannot be in the past",
      });
    }

    const task = await Task.create({
      title: title.trim(),
      employee: employee._id,
      department,
      priority: priority || "Medium",
      deadline: taskDeadline,
      status: "Pending",
    });

    res.status(201).json(task);
  } catch (error) {
    console.error("CREATE TASK ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ==============================
   ➤ GET ALL TASKS (ADMIN)
============================== */
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("employee", "firstName lastName employeeId")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error("GET TASKS ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ==============================
   ➤ GET EMPLOYEE TASKS
============================== */
export const getEmployeeTasks = async (req, res) => {
  try {
    let employee;

    // ✅ ADMIN → specific employee
    if (req.params.employeeId) {
      employee = await findEmployee(req.params.employeeId);

      if (!employee) {
        return res.status(404).json({
          message: "Employee not found",
        });
      }
    } else {
      // ✅ EMPLOYEE → own tasks
      employee = req.user;
    }

    // 🔐 Access control
    if (
      req.user.role !== "Admin" &&
      req.user._id.toString() !== employee._id.toString()
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const tasks = await Task.find({
      employee: employee._id,
    }).sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error("GET EMPLOYEE TASK ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ==============================
   ➤ UPDATE TASK STATUS
============================== */
export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid task ID",
      });
    }

    const validStatus = ["Pending", "In Progress", "Completed"];

    if (!validStatus.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // 🔐 Only admin OR assigned employee
    if (
      req.user.role !== "Admin" &&
      req.user._id.toString() !== task.employee.toString()
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    task.status = status;
    await task.save();

    res.json(task);
  } catch (error) {
    console.error("UPDATE TASK ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ==============================
   ➤ DELETE TASK (ADMIN ONLY)
============================== */
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid task ID",
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    await task.deleteOne();

    res.json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("DELETE TASK ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};