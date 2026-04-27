import EmployeeAccount from "../models/EmployeeAccount.js";
import mongoose from "mongoose";

/* ==============================
   ➤ ADD ACCOUNT (ADMIN)
============================== */
export const addEmployeeAccount = async (req, res) => {
  try {
    const { employeeId, bankName, accountNumber, ifscCode, panNumber } =
      req.body;

    if (!employeeId || !bankName || !accountNumber || !ifscCode) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    const exists = await EmployeeAccount.findOne({ employeeId });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Account already exists",
      });
    }

    const account = await EmployeeAccount.create({
      employeeId,
      bankName,
      accountNumber,
      ifscCode,
      panNumber,
    });

    res.status(201).json({
      success: true,
      message: "Account created",
      data: account,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/* ==============================
   ➤ GET MY ACCOUNT (EMPLOYEE)
============================== */
export const getMyAccount = async (req, res) => {
  try {
    const account = await EmployeeAccount.findOne({
      employeeId: req.user._id,
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "No account found",
      });
    }

    const data = account.toObject();
    data.accountNumber = account.maskAccount();

    res.json({
      success: true,
      message: "Account fetched",
      data,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/* ==============================
   ➤ GET ACCOUNT BY EMPLOYEE (ADMIN)
============================== */
export const getAccountByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID",
      });
    }

    const account = await EmployeeAccount.findOne({ employeeId });

    res.json({
      success: true,
      message: "Account fetched",
      data: account || null,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/* ==============================
   ➤ UPDATE ACCOUNT (ADMIN)
============================== */
export const updateEmployeeAccount = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { bankName, accountNumber, ifscCode, panNumber } = req.body;

    const account = await EmployeeAccount.findOne({ employeeId });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    if (bankName) account.bankName = bankName;
    if (accountNumber) account.accountNumber = accountNumber;
    if (ifscCode) account.ifscCode = ifscCode;
    if (panNumber) account.panNumber = panNumber;

    await account.save();

    res.json({
      success: true,
      message: "Account updated",
      data: account,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};