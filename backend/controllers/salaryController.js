import Salary from "../models/salaryModel.js";
import SalaryHistory from "../models/salaryHistoryModel.js";
import Increment from "../models/salaryIncrementModel.js";
import Employee from "../models/Employee.js";
import mongoose from "mongoose";

/* ==============================
   🔥 FIND EMPLOYEE
============================== */
const findEmployee = async (input) => {
  if (!input) return null;

  if (mongoose.Types.ObjectId.isValid(input) && input.length === 24) {
    return await Employee.findById(input);
  }

  return await Employee.findOne({ employeeId: input });
};

/* ==============================
   ➤ SAVE SALARY (ADMIN)
============================== */
export const saveSalary = async (req, res) => {
  try {
    const { employeeId, salary } = req.body;

    if (!employeeId || !salary) {
      return res.status(400).json({
        message: "Employee and salary data required",
      });
    }

    const employee = await findEmployee(employeeId);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    // ✅ Validate fields
    const fields = ["basic", "hra", "conveyance", "medical", "lta", "special"];

    for (let field of fields) {
      if (salary[field] == null || isNaN(salary[field])) {
        return res.status(400).json({
          message: `${field} must be a valid number`,
        });
      }
    }

    // ✅ Save / Update main salary
    let existing = await Salary.findOne({ employee: employee._id });

    if (existing) {
      Object.assign(existing, salary);
      await existing.save();
    } else {
      existing = await Salary.create({
        employee: employee._id,
        ...salary,
      });
    }

    // ✅ Current month/year
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();

    // ✅ Prevent duplicate history
    await SalaryHistory.findOneAndUpdate(
      { employee: employee._id, month, year },
      {
        employee: employee._id,
        salary,
        month,
        year,
        createdBy: req.user._id,
      },
      { upsert: true, new: true }
    );

    res.json({
      message: "Salary saved successfully",
      salary: existing,
    });
  } catch (error) {
    console.error("SAVE SALARY ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ==============================
   ➤ APPLY INCREMENT (ADMIN)
============================== */
export const applyIncrement = async (req, res) => {
  try {
    const { employeeId, amount, remarks } = req.body;

    if (!employeeId || !amount) {
      return res.status(400).json({
        message: "Employee and amount required",
      });
    }

    const employee = await findEmployee(employeeId);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    if (isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({
        message: "Invalid increment amount",
      });
    }

    const salary = await Salary.findOne({ employee: employee._id });

    if (!salary) {
      return res.status(400).json({
        message: "Salary not found",
      });
    }

    // ✅ Apply increment
    salary.basic += Number(amount);
    await salary.save();

    // ✅ Save increment history
    await Increment.create({
      employee: employee._id,
      amount: Number(amount),
      remarks: remarks?.trim(),
      createdBy: req.user._id,
    });

    // ✅ ALSO update salary history
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();

    await SalaryHistory.findOneAndUpdate(
      { employee: employee._id, month, year },
      {
        employee: employee._id,
        salary: {
          basic: salary.basic,
          hra: salary.hra,
          conveyance: salary.conveyance,
          medical: salary.medical,
          lta: salary.lta,
          special: salary.special,
        },
        month,
        year,
        createdBy: req.user._id,
      },
      { upsert: true }
    );

    res.json({
      message: "Increment applied successfully",
      salary,
    });
  } catch (error) {
    console.error("INCREMENT ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ==============================
   ➤ GET SALARY HISTORY
============================== */
export const getSalaryHistory = async (req, res) => {
  try {
    let employee;

    if (req.params.employeeId) {
      employee = await findEmployee(req.params.employeeId);

      if (!employee) {
        return res.status(404).json({
          message: "Employee not found",
        });
      }
    } else {
      employee = req.user;
    }

    const history = await SalaryHistory.find({
      employee: employee._id,
    }).sort({ year: -1, month: -1 });

    res.json(history);
  } catch (error) {
    console.error("GET SALARY HISTORY ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ==============================
   ➤ GET INCREMENT HISTORY
============================== */
export const getIncrementHistory = async (req, res) => {
  try {
    const history = await Increment.find({
      employee: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(history);
  } catch (error) {
    console.error("GET INCREMENT ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};