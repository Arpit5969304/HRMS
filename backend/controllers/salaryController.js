import mongoose from "mongoose";
import Salary from "../models/salaryModel.js";
import SalaryHistory from "../models/salaryHistoryModel.js";
import Increment from "../models/salaryIncrementModel.js";
import Payroll from "../models/payrollModel.js";
import Attendance from "../models/attendanceModel.js";
import Leave from "../models/LeaveModel.js";
import Holiday from "../models/Holiday.js";
import Employee from "../models/Employee.js";

const salaryFields = ["basic", "hra", "conveyance", "medical", "lta", "special"];
const paidLeaveTypes = new Set(["Casual Leave", "Sick Leave", "Paid Leave"]);
const unpaidLeaveTypes = new Set(["Unpaid Leave"]);

const roundMoney = (value) => Number((Number(value) || 0).toFixed(2));

const findEmployee = async (input) => {
  if (!input) return null;

  if (mongoose.Types.ObjectId.isValid(input) && input.length === 24) {
    return Employee.findById(input);
  }

  return Employee.findOne({ employeeId: input });
};

const startOfDay = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getDateKey = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const isSunday = (value) => new Date(value).getDay() === 0;

const getSalarySnapshot = (salary) =>
  salaryFields.reduce((acc, field) => {
    acc[field] = Number(salary?.[field] || 0);
    return acc;
  }, {});

const getSalaryTotal = (salary) =>
  salaryFields.reduce((total, field) => total + Number(salary?.[field] || 0), 0);

const getMonthOptions = (input = {}) => {
  const now = new Date();
  const month = Number(input.month || now.getMonth() + 1);
  const year = Number(input.year || now.getFullYear());

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error("Invalid month");
  }

  if (!Number.isInteger(year) || year < 2000 || year > 3000) {
    throw new Error("Invalid year");
  }

  return { month, year };
};

const getMonthRange = (month, year) => {
  const start = new Date(year, month - 1, 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(year, month, 0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const getDateKeysInRange = (start, end) => {
  const keys = [];
  const cursor = startOfDay(start);
  const limit = startOfDay(end);

  while (cursor <= limit) {
    keys.push(getDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return keys;
};

const buildLeaveDayMap = (leaves, monthStart, monthEnd) => {
  const map = new Map();
  const rangeStart = startOfDay(monthStart);
  const rangeEnd = startOfDay(monthEnd);

  leaves.forEach((leave) => {
    const start = startOfDay(leave.fromDate);
    const end = startOfDay(leave.toDate);

    if (leave.leaveType === "Half Unpaid Leave") {
      if (start >= rangeStart && start <= rangeEnd) {
        map.set(getDateKey(start), {
          leaveType: leave.leaveType,
          units: 0.5,
        });
      }
      return;
    }

    const cursor = start > rangeStart ? start : startOfDay(rangeStart);
    const limit = end < rangeEnd ? end : startOfDay(rangeEnd);

    while (cursor <= limit) {
      map.set(getDateKey(cursor), {
        leaveType: leave.leaveType,
        units: 1,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
  });

  return map;
};

const serializePayrollRecord = (record) => {
  const paidByName =
    [record?.paidBy?.firstName, record?.paidBy?.lastName].filter(Boolean).join(" ") ||
    record?.paidBy?.employeeId ||
    "";

  return {
    _id: record._id,
    employee: record.employee,
    month: record.month,
    year: record.year,
    salary: getSalarySnapshot(record.salary),
    grossSalary: roundMoney(record.grossSalary),
    workingDays: Number(record.workingDays || 0),
    weeklyOffDays: Number(record.weeklyOffDays || 0),
    holidayDays: Number(record.holidayDays || 0),
    presentDays: Number(record.presentDays || 0),
    lateDays: Number(record.lateDays || 0),
    halfDays: Number(record.halfDays || 0),
    paidLeaveDays: Number(record.paidLeaveDays || 0),
    unpaidLeaveDays: Number(record.unpaidLeaveDays || 0),
    unpaidAttendanceDays: Number(record.unpaidAttendanceDays || 0),
    absentDays: Number(record.absentDays || 0),
    payableDays: Number(record.payableDays || 0),
    deductionDays: Number(record.deductionDays || 0),
    perDaySalary: roundMoney(record.perDaySalary),
    deductionAmount: roundMoney(record.deductionAmount),
    payableSalary: roundMoney(record.payableSalary),
    paymentStatus: record.paymentStatus || "Paid",
    paidAt: record.paidAt || null,
    notes: record.notes || "",
    paidBy:
      record.paidBy && typeof record.paidBy === "object"
        ? {
            _id: record.paidBy._id,
            employeeId: record.paidBy.employeeId,
            firstName: record.paidBy.firstName,
            lastName: record.paidBy.lastName,
            name: paidByName || "-",
          }
        : null,
  };
};

const calculatePayrollForEmployee = async ({ employee, salary, month, year }) => {
  const { start, end } = getMonthRange(month, year);
  const joinDate = employee?.joinDate ? startOfDay(employee.joinDate) : null;
  const effectiveStart =
    joinDate && joinDate > startOfDay(start) ? joinDate : startOfDay(start);
  const salarySnapshot = getSalarySnapshot(salary);
  const grossSalary = roundMoney(salary.netSalary ?? getSalaryTotal(salarySnapshot));

  if (effectiveStart > startOfDay(end)) {
    return {
      month,
      year,
      salary: salarySnapshot,
      grossSalary,
      workingDays: 0,
      weeklyOffDays: 0,
      holidayDays: 0,
      presentDays: 0,
      lateDays: 0,
      halfDays: 0,
      paidLeaveDays: 0,
      unpaidLeaveDays: 0,
      unpaidAttendanceDays: 0,
      absentDays: 0,
      payableDays: 0,
      deductionDays: 0,
      perDaySalary: 0,
      deductionAmount: 0,
      payableSalary: 0,
      paymentStatus: "Pending",
      paidAt: null,
      notes: "",
      paidBy: null,
    };
  }

  const [attendanceRecords, leaveRecords, holidayRecords] = await Promise.all([
    Attendance.find({
      employee: employee._id,
      isDeleted: false,
      date: { $gte: effectiveStart, $lte: end },
    }).lean(),
    Leave.find({
      employee: employee._id,
      isActive: true,
      status: "Approved",
      fromDate: { $lte: end },
      toDate: { $gte: effectiveStart },
    }).lean(),
    Holiday.find({
      approved: true,
      date: { $gte: effectiveStart, $lte: end },
    }).lean(),
  ]);

  const attendanceByDate = new Map();
  attendanceRecords.forEach((record) => {
    const key = getDateKey(record.date);
    if (key) attendanceByDate.set(key, record);
  });

  const leaveByDate = buildLeaveDayMap(leaveRecords, effectiveStart, end);
  const holidaySet = new Set(
    holidayRecords.map((holiday) => getDateKey(holiday.date)).filter(Boolean),
  );
  const monthDateKeys = getDateKeysInRange(effectiveStart, end);
  const totals = {
    workingDays: 0,
    weeklyOffDays: 0,
    holidayDays: 0,
    presentDays: 0,
    lateDays: 0,
    halfDays: 0,
    paidLeaveDays: 0,
    unpaidLeaveDays: 0,
    unpaidAttendanceDays: 0,
    absentDays: 0,
    payableDays: 0,
    deductionDays: 0,
  };

  monthDateKeys.forEach((dateKey) => {
    const date = new Date(`${dateKey}T00:00:00`);

    if (isSunday(date)) {
      totals.weeklyOffDays += 1;
      return;
    }

    if (holidaySet.has(dateKey)) {
      totals.holidayDays += 1;
      return;
    }

    totals.workingDays += 1;

    const attendance = attendanceByDate.get(dateKey);
    if (attendance) {
      const status = attendance.status?.toLowerCase();

      if (status === "half-day") {
        totals.halfDays += 1;
        totals.payableDays += 0.5;
        totals.deductionDays += 0.5;
        return;
      }

      if (status === "late") {
        totals.lateDays += 1;
        totals.payableDays += 1;
        return;
      }

      if (status === "absent") {
        totals.absentDays += 1;
        totals.unpaidAttendanceDays += 1;
        totals.deductionDays += 1;
        return;
      }

      totals.presentDays += 1;
      totals.payableDays += 1;
      return;
    }

    const leave = leaveByDate.get(dateKey);
    if (leave) {
      if (leave.leaveType === "Half Unpaid Leave") {
        totals.halfDays += 1;
        totals.unpaidLeaveDays += 0.5;
        totals.payableDays += 0.5;
        totals.deductionDays += 0.5;
        return;
      }

      if (paidLeaveTypes.has(leave.leaveType)) {
        totals.paidLeaveDays += leave.units;
        totals.payableDays += leave.units;
        return;
      }

      if (unpaidLeaveTypes.has(leave.leaveType)) {
        totals.unpaidLeaveDays += leave.units;
        totals.deductionDays += leave.units;
        return;
      }
    }

    totals.absentDays += 1;
    totals.unpaidAttendanceDays += 1;
    totals.deductionDays += 1;
  });

  const perDaySalary =
    totals.workingDays > 0 ? roundMoney(grossSalary / totals.workingDays) : 0;
  const deductionAmount = roundMoney(perDaySalary * totals.deductionDays);
  const payableSalary = roundMoney(Math.max(grossSalary - deductionAmount, 0));

  return {
    month,
    year,
    salary: salarySnapshot,
    grossSalary,
    workingDays: totals.workingDays,
    weeklyOffDays: totals.weeklyOffDays,
    holidayDays: totals.holidayDays,
    presentDays: totals.presentDays,
    lateDays: totals.lateDays,
    halfDays: totals.halfDays,
    paidLeaveDays: totals.paidLeaveDays,
    unpaidLeaveDays: Number(totals.unpaidLeaveDays.toFixed(2)),
    unpaidAttendanceDays: totals.unpaidAttendanceDays,
    absentDays: totals.absentDays,
    payableDays: Number(totals.payableDays.toFixed(2)),
    deductionDays: Number(totals.deductionDays.toFixed(2)),
    perDaySalary,
    deductionAmount,
    payableSalary,
    paymentStatus: "Pending",
    paidAt: null,
    notes: "",
    paidBy: null,
  };
};

const getPayrollRecord = async (employeeId, month, year) =>
  Payroll.findOne({ employee: employeeId, month, year })
    .populate("paidBy", "firstName lastName employeeId")
    .lean();

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

    for (const field of salaryFields) {
      salary[field] = Number(salary[field]);

      if (Number.isNaN(salary[field])) {
        return res.status(400).json({
          message: `${field} must be a valid number`,
        });
      }
    }

    const totalSalary = getSalaryTotal(salary);
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
        salary: getSalarySnapshot(salary),
        totalSalary,
        month,
        year,
        createdBy: req.user._id,
      },
      { upsert: true, new: true, runValidators: true },
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

    const incAmount = Number(amount);

    if (Number.isNaN(incAmount) || incAmount <= 0) {
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

    await Increment.create({
      employee: employee._id,
      amount: incAmount,
      previousBasic,
      newBasic: salary.basic,
      remarks: remarks?.trim(),
      createdBy: req.user._id,
    });

    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    const salaryData = getSalarySnapshot(salary);

    await SalaryHistory.findOneAndUpdate(
      { employee: employee._id, month, year },
      {
        employee: employee._id,
        salary: salaryData,
        totalSalary: getSalaryTotal(salaryData),
        month,
        year,
        createdBy: req.user._id,
      },
      { upsert: true, new: true, runValidators: true },
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
    const salary = await Salary.findOne({ employee: req.user._id });

    if (!salary) {
      return res.status(404).json({
        message: "Salary not found",
      });
    }

    res.json({
      basic: salary.basic,
      hra: salary.hra,
      conveyance: salary.conveyance,
      medical: salary.medical,
      lta: salary.lta,
      special: salary.special,
      totalSalary: getSalaryTotal(salary),
      netSalary: salary.netSalary,
      effectiveDate: salary.effectiveDate,
    });
  } catch (error) {
    console.error("GET MY SALARY ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

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

export const getIncrementHistory = async (req, res) => {
  try {
    const employee = req.params.employeeId
      ? await findEmployee(req.params.employeeId)
      : req.user;

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

export const previewPayroll = async (req, res) => {
  try {
    const employee = await findEmployee(req.params.employeeId);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const { month, year } = getMonthOptions(req.query);
    const existingPayroll = await getPayrollRecord(employee._id, month, year);

    if (existingPayroll) {
      return res.json(serializePayrollRecord(existingPayroll));
    }

    const salary = await Salary.findOne({ employee: employee._id }).lean();

    if (!salary) {
      return res.status(404).json({ message: "Salary structure not found" });
    }

    const preview = await calculatePayrollForEmployee({
      employee,
      salary,
      month,
      year,
    });

    res.json(preview);
  } catch (error) {
    if (error.message === "Invalid month" || error.message === "Invalid year") {
      return res.status(400).json({ message: error.message });
    }

    console.error("PREVIEW PAYROLL ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const payMonthlySalary = async (req, res) => {
  try {
    const { employeeId, month, year, notes } = req.body;

    if (!employeeId || !month || !year) {
      return res.status(400).json({
        message: "Employee, month and year are required",
      });
    }

    const employee = await findEmployee(employeeId);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const salary = await Salary.findOne({ employee: employee._id }).lean();

    if (!salary) {
      return res.status(404).json({ message: "Salary structure not found" });
    }

    const { month: parsedMonth, year: parsedYear } = getMonthOptions({
      month,
      year,
    });
    const preview = await calculatePayrollForEmployee({
      employee,
      salary,
      month: parsedMonth,
      year: parsedYear,
    });

    const payroll = await Payroll.findOneAndUpdate(
      { employee: employee._id, month: parsedMonth, year: parsedYear },
      {
        employee: employee._id,
        month: parsedMonth,
        year: parsedYear,
        salary: preview.salary,
        grossSalary: preview.grossSalary,
        workingDays: preview.workingDays,
        weeklyOffDays: preview.weeklyOffDays,
        holidayDays: preview.holidayDays,
        presentDays: preview.presentDays,
        lateDays: preview.lateDays,
        halfDays: preview.halfDays,
        paidLeaveDays: preview.paidLeaveDays,
        unpaidLeaveDays: preview.unpaidLeaveDays,
        unpaidAttendanceDays: preview.unpaidAttendanceDays,
        absentDays: preview.absentDays,
        payableDays: preview.payableDays,
        deductionDays: preview.deductionDays,
        perDaySalary: preview.perDaySalary,
        deductionAmount: preview.deductionAmount,
        payableSalary: preview.payableSalary,
        paymentStatus: "Paid",
        paidAt: new Date(),
        paidBy: req.user._id,
        notes: notes?.trim() || "",
      },
      { upsert: true, new: true, runValidators: true },
    ).populate("paidBy", "firstName lastName employeeId");

    res.json({
      message: "Salary paid successfully",
      payroll: serializePayrollRecord(payroll.toObject()),
    });
  } catch (error) {
    if (error.message === "Invalid month" || error.message === "Invalid year") {
      return res.status(400).json({ message: error.message });
    }

    console.error("PAY MONTHLY SALARY ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getPayrollHistory = async (req, res) => {
  try {
    let employee;

    if (req.params.employeeId) {
      employee = await findEmployee(req.params.employeeId);

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
    } else {
      employee = req.user;
    }

    const payrollHistory = await Payroll.find({
      employee: employee._id,
    })
      .populate("paidBy", "firstName lastName employeeId")
      .sort({ year: -1, month: -1 })
      .lean();

    res.json(payrollHistory.map(serializePayrollRecord));
  } catch (error) {
    console.error("GET PAYROLL HISTORY ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const previewMyPayroll = async (req, res) => {
  try {
    const { month, year } = getMonthOptions(req.query);
    const existingPayroll = await getPayrollRecord(req.user._id, month, year);

    if (existingPayroll) {
      return res.json(serializePayrollRecord(existingPayroll));
    }

    const salary = await Salary.findOne({ employee: req.user._id }).lean();

    if (!salary) {
      return res.status(404).json({ message: "Salary structure not found" });
    }

    const preview = await calculatePayrollForEmployee({
      employee: req.user,
      salary,
      month,
      year,
    });

    res.json(preview);
  } catch (error) {
    if (error.message === "Invalid month" || error.message === "Invalid year") {
      return res.status(400).json({ message: error.message });
    }

    console.error("PREVIEW MY PAYROLL ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
