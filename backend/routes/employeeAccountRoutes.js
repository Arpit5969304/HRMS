import express from "express";
import {
  addEmployeeAccount,
  getMyAccount,
  getAccountByEmployee,
  updateEmployeeAccount,
} from "../controllers/employeeAccountController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ==============================
   ➤ ADD ACCOUNT (ADMIN)
============================== */
router.post("/add", protect, adminOnly, addEmployeeAccount);

/* ==============================
   ➤ GET MY ACCOUNT (EMPLOYEE)
============================== */
router.get("/my-account", protect, getMyAccount);

/* ==============================
   ➤ GET ACCOUNT BY EMPLOYEE (ADMIN)
============================== */
router.get("/:employeeId", protect, adminOnly, getAccountByEmployee);

/* ==============================
   ➤ UPDATE ACCOUNT (ADMIN)
============================== */
router.put("/:employeeId", protect, adminOnly, updateEmployeeAccount);

export default router;