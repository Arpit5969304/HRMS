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

    if (typeof salary !== "object") {
      return res.status(400).json({
        message: "Salary data invalid",
      });
    }

    const employee = await findEmployee(employeeId);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    const fields = ["basic", "hra", "conveyance", "medical", "lta", "special"];

    for (let field of fields) {
      salary[field] = Number(salary[field]);

      if (isNaN(salary[field])) {
        return res.status(400).json({
          message: `${field} must be a valid number`,
        });
      }
    }

    const totalSalary = fields.reduce((total, field) => total + salary[field], 0);

    let existing = await Salary.findOne({ employee: employee._id });
    const isUpdate = Boolean(existing);

    if (existing) {
      Object.assign(existing, salary);
      await existing.save();
    } else {
      existing = await Salary.create({
        employee: employee._id,
        ...salary,
      });
    }

    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();

    await SalaryHistory.findOneAndUpdate(
      { employee: employee._id, month, year },
      {
        employee: employee._id,
        salary,
        totalSalary,
        month,
        year,
        createdBy: req.user._id,
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.json({
      message: isUpdate
        ? "Salary updated successfully"
        : "Salary saved successfully",
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
export const getCurrentSalary = async (req, res) => {
  try {
    const employee = await findEmployee(req.params.employeeId);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    const salary = await Salary.findOne({ employee: employee._id });

    res.json(salary);
  } catch (error) {
    console.error("GET CURRENT SALARY ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ==============================
   APPLY INCREMENT (ADMIN)
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

    const incAmount = Number(amount); // 🔥 FIX

    if (isNaN(incAmount) || incAmount <= 0) {
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

    const previousBasic = salary.basic;
    salary.basic += incAmount;
    await salary.save();
    const newBasic = salary.basic;

    await Increment.create({
      employee: employee._id,
      amount: incAmount,
      previousBasic,
      newBasic,
      remarks: remarks?.trim(),
      createdBy: req.user._id,
    });

    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    const salaryData = {
      basic: salary.basic,
      hra: salary.hra,
      conveyance: salary.conveyance,
      medical: salary.medical,
      lta: salary.lta,
      special: salary.special,
    };
    const totalSalary =
      salaryData.basic +
      salaryData.hra +
      salaryData.conveyance +
      salaryData.medical +
      salaryData.lta +
      salaryData.special;

    await SalaryHistory.findOneAndUpdate(
      { employee: employee._id, month, year },
      {
        employee: employee._id,
        salary: salaryData,
        totalSalary,
        month,
        year,
        createdBy: req.user._id,
      },
      { upsert: true, new: true, runValidators: true }
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



export const getMySalary = async (req, res) => {
  try {
    const employeeId = req.user._id;

    const salary = await Salary.findOne({ employee: employeeId });

    if (!salary) {
      return res.status(404).json({
        message: "Salary not found",
      });
    }

    // 🔥 total calculate (if not stored)
    const totalSalary =
      salary.basic +
      salary.hra +
      salary.conveyance +
      salary.medical +
      salary.lta +
      salary.special;

    res.json({
      basic: salary.basic,
      hra: salary.hra,
      conveyance: salary.conveyance,
      medical: salary.medical,
      lta: salary.lta,
      special: salary.special,
      totalSalary,
    });

  } catch (error) {
    console.error("GET MY SALARY ERROR:", error);
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
    let employee;

    if (req.params.employeeId) {
      employee = await findEmployee(req.params.employeeId);
    } else {
      employee = req.user;
    }

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const history = await Increment.find({
      employee: employee._id,
    })
      .populate("createdBy", "firstName lastName employeeId")
      .sort({ createdAt: -1 });

    res.json(history);
  } catch (error) {
    console.error("GET INCREMENT ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
