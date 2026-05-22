import crypto from "crypto";
import Employee from "../models/Employee.js";

export const generateEmployeeId = async () => {
  let attempts = 0;

  while (attempts < 5) {
    const employeeId =
      "EMP" + crypto.randomBytes(3).toString("hex").toUpperCase();

    const exists = await Employee.findOne({ employeeId });

    if (!exists) {
      return employeeId;
    }

    attempts += 1;
  }

  throw new Error("Failed to generate unique employeeId");
};
