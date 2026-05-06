import Employee from "../models/Employee.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import crypto from "crypto";

/* ==============================
   🔥 GENERATE UNIQUE EMPLOYEE ID
============================== */
const generateEmployeeId = async () => {
  let attempts = 0;

  while (attempts < 5) {
    const id = "EMP" + crypto.randomBytes(3).toString("hex").toUpperCase();

    const exists = await Employee.findOne({ employeeId: id });
    if (!exists) return id;

    attempts++;
  }

  throw new Error("Failed to generate unique employeeId");
};

/* ==============================
   ➤ CREATE EMPLOYEE
============================== */
export const createEmployee = async (req, res) => {
  try {
    const data = req.body;

    if (!data.email || !data.password || !data.firstName) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const email = data.email.toLowerCase().trim();

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (data.password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const exists = await Employee.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    /* ========= MANAGER VALIDATION ========= */
    let managerId = null;

    if (data.role !== "Admin" && data.manager) {
      if (!mongoose.Types.ObjectId.isValid(data.manager)) {
        return res.status(400).json({ message: "Invalid manager ID" });
      }

      const managerExists = await Employee.findById(data.manager);

      if (!managerExists) {
        return res.status(400).json({ message: "Manager not found" });
      }

      if (managerExists.role === "Admin") {
        return res.status(400).json({
          message: "Admin cannot be assigned as manager",
        });
      }

      managerId = data.manager;
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const employeeId = await generateEmployeeId();

    const employee = await Employee.create({
      firstName: data.firstName.trim(),
      lastName: data.lastName?.trim(),
      email,
      employeeId,
      password: hashedPassword,

      phone: data.phone?.trim(),
      address: data.address?.trim(),

      gender: data.gender,

      department: data.department?.trim(),
      designation: data.designation?.trim(),

      role: data.role || "Employee",
      status: data.status || "active",

      manager: managerId,

      employmentType: data.employmentType,

      // 🔥 IMAGE FIX
      profileImage: req.file ? req.file.path : "",

      joinDate: data.joinDate ? new Date(data.joinDate) : undefined,
      dob: data.dob ? new Date(data.dob) : undefined,
    });

    const emp = employee.toObject();
    delete emp.password;

    res.status(201).json(emp);
  } catch (error) {
    console.error("CREATE ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ==============================
   ➤ GET ALL EMPLOYEES
============================== */
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .select("-password")
      .populate("manager", "firstName lastName employeeId")
      .sort({ createdAt: -1 });

    res.json(employees);
  } catch (error) {
    console.error("GET ALL ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ==============================
   ➤ GET SINGLE EMPLOYEE
============================== */
export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    if (req.user.role !== "Admin" && req.user._id.toString() !== id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const employee = await Employee.findById(id)
      .select("-password")
      .populate("manager", "firstName lastName employeeId");

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json(employee);
  } catch (error) {
    console.error("GET ONE ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ==============================
   ➤ UPDATE OWN PROFILE
============================== */
export const updateMyProfile = async (req, res) => {
  try {
    const employeeId = req.user._id;
    const data = req.body;
    const updateData = {};

    if (data.firstName !== undefined) {
      const firstName = data.firstName.trim();

      if (!firstName) {
        return res.status(400).json({ message: "First name is required" });
      }

      updateData.firstName = firstName;
    }

    if (data.lastName !== undefined) {
      const lastName = data.lastName.trim();

      if (!lastName) {
        return res.status(400).json({ message: "Last name is required" });
      }

      updateData.lastName = lastName;
    }

    if (data.phone !== undefined) {
      const phone = data.phone.trim();

      if (phone && !/^[0-9]{10}$/.test(phone)) {
        return res.status(400).json({ message: "Phone must be 10 digits" });
      }

      updateData.phone = phone;
    }

    if (data.email !== undefined) {
      const email = data.email.toLowerCase().trim();

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      if (!/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      const exists = await Employee.findOne({
        email,
        _id: { $ne: employeeId },
      });

      if (exists) {
        return res.status(400).json({ message: "Email already exists" });
      }

      updateData.email = email;
    }

    if (data.password) {
      if (data.password.length < 6) {
        return res.status(400).json({
          message: "Password must be at least 6 characters",
        });
      }

      updateData.password = await bcrypt.hash(data.password, 10);
    }

    if (req.file) {
      updateData.profileImage = req.file.path;
    }

    const updated = await Employee.findByIdAndUpdate(employeeId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updated) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user: updated,
    });
  } catch (error) {
    console.error("UPDATE MY PROFILE ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ==============================
   ➤ UPDATE EMPLOYEE
============================== */
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    if (req.user.role !== "Admin" && req.user._id.toString() !== id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updateData = {};

    if (data.firstName !== undefined)
      updateData.firstName = data.firstName.trim();

    if (data.lastName !== undefined)
      updateData.lastName = data.lastName.trim();

    if (data.phone !== undefined)
      updateData.phone = data.phone.trim();

    if (data.address !== undefined)
      updateData.address = data.address.trim();

    if (data.department !== undefined)
      updateData.department = data.department.trim();

    if (data.designation !== undefined)
      updateData.designation = data.designation.trim();

    if (data.role !== undefined) updateData.role = data.role;
    if (data.status !== undefined) updateData.status = data.status;

    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.employmentType !== undefined)
      updateData.employmentType = data.employmentType;

    /* ========= IMAGE UPDATE ========= */
    if (req.file) {
      updateData.profileImage = req.file.path;
    }

    /* ========= EMAIL ========= */
    if (data.email) {
      const email = data.email.toLowerCase().trim();

      const exists = await Employee.findOne({
        email,
        _id: { $ne: id },
      });

      if (exists) {
        return res.status(400).json({ message: "Email already exists" });
      }

      updateData.email = email;
    }

    /* ========= PASSWORD ========= */
    if (data.password) {
      if (data.password.length < 6) {
        return res.status(400).json({ message: "Password too short" });
      }

      updateData.password = await bcrypt.hash(data.password, 10);
    }

    /* ========= MANAGER ========= */
    if (data.role === "Admin") {
      updateData.manager = null;
    } else if (data.manager) {
      if (!mongoose.Types.ObjectId.isValid(data.manager)) {
        return res.status(400).json({ message: "Invalid manager ID" });
      }

      if (data.manager === id) {
        return res.status(400).json({
          message: "Employee cannot be their own manager",
        });
      }

      const managerExists = await Employee.findById(data.manager);

      if (!managerExists) {
        return res.status(400).json({ message: "Manager not found" });
      }

      if (managerExists.role === "Admin") {
        return res.status(400).json({
          message: "Admin cannot be manager",
        });
      }

      updateData.manager = data.manager;
    }

    const updated = await Employee.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .select("-password")
      .populate("manager", "firstName lastName employeeId");

    if (!updated) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ==============================
   ➤ DELETE EMPLOYEE
============================== */
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    if (req.user.role !== "Admin") {
      return res.status(403).json({
        message: "Only admin can delete",
      });
    }

    await Employee.updateMany({ manager: id }, { $set: { manager: null } });

    const deleted = await Employee.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
