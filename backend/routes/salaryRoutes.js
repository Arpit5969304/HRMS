import express from "express";
import {
  saveSalary,
  applyIncrement,
  getCurrentSalary,
  getSalaryHistory,
  getIncrementHistory,
  getMySalary,
  previewPayroll,
  payMonthlySalary,
  getPayrollHistory,
  previewMyPayroll,
} from "../controllers/salaryController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/save", protect, adminOnly, saveSalary);
router.post("/increment", protect, adminOnly, applyIncrement);

router.get("/admin/current/:employeeId", protect, adminOnly, getCurrentSalary);
router.get("/admin/payroll/:employeeId/preview", protect, adminOnly, previewPayroll);
router.get("/admin/payroll/:employeeId", protect, adminOnly, getPayrollHistory);
router.post("/admin/payroll/pay", protect, adminOnly, payMonthlySalary);
router.get("/admin/:employeeId", protect, adminOnly, getSalaryHistory);
router.get("/admin/increment/:employeeId", protect, adminOnly, getIncrementHistory);

router.get("/my", protect, getMySalary);
router.get("/me/history", protect, getSalaryHistory);
router.get("/me/increment", protect, getIncrementHistory);
router.get("/me/payroll/preview", protect, previewMyPayroll);
router.get("/me/payroll", protect, getPayrollHistory);

export default router;
