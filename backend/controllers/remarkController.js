import Attendance from "../models/attendanceModel.js";
import Employee from "../models/Employee.js";
import mongoose from "mongoose";

/* ==============================
   🔥 COMMON RESPONSE FORMAT
============================== */
const sendResponse = (res, status, success, message, data = null) => {
  return res.status(status).json({
    success,
    message,
    data,
  });
};

/* ==============================
   🔥 SAFE FIND EMPLOYEE
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
   ➤ GET ALL REMARKS (ADMIN)
============================== */
export const getRemarks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      department = "",
      status = "",
      approved,
      date,
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (approved !== undefined) query.approved = approved === "true";
    if (date) query.date = new Date(date);

    const skip = (page - 1) * limit;

    let data = await Attendance.find(query)
      .populate("employee", "firstName lastName department employeeId")
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // 🔍 FILTER AFTER POPULATE
    if (search || department) {
      data = data.filter((item) => {
        const fullName =
          `${item.employee?.firstName} ${item.employee?.lastName}`.toLowerCase();

        const matchSearch = search
          ? fullName.includes(search.toLowerCase())
          : true;

        const matchDept = department
          ? item.employee?.department === department
          : true;

        return matchSearch && matchDept;
      });
    }

    const total = data.length;

    sendResponse(res, 200, true, "Remarks fetched", {
      records: data,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET REMARK ERROR:", error);
    sendResponse(res, 500, false, "Server Error");
  }
};

/* ==============================
   ➤ UPDATE REMARK (ADMIN ONLY)
============================== */
export const updateRemark = async (req, res) => {
  try {
    const { id } = req.params;
    const { remark } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendResponse(res, 400, false, "Invalid attendance ID");
    }

    if (!remark || remark.trim().length < 2) {
      return sendResponse(res, 400, false, "Remark too short");
    }

    const updated = await Attendance.findByIdAndUpdate(
      id,
      {
        remark: remark.trim(),
        remarkUpdatedAt: new Date(),
        manuallyUpdated: true,
      },
      { new: true }
    );

    if (!updated) {
      return sendResponse(res, 404, false, "Attendance not found");
    }

    sendResponse(res, 200, true, "Remark updated", updated);
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    sendResponse(res, 500, false, "Server Error");
  }
};

/* ==============================
   ➤ APPROVE MULTIPLE REMARKS (ADMIN)
============================== */
export const approveRemarks = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return sendResponse(res, 400, false, "IDs required");
    }

    const validIds = ids.filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );

    if (!validIds.length) {
      return sendResponse(res, 400, false, "Invalid IDs");
    }

    const result = await Attendance.updateMany(
      { _id: { $in: validIds } },
      { $set: { approved: true } }
    );

    sendResponse(res, 200, true, "Approved successfully", {
      modified: result.modifiedCount,
    });
  } catch (error) {
    console.error("APPROVE ERROR:", error);
    sendResponse(res, 500, false, "Server Error");
  }
};

/* ==============================
   ➤ EMPLOYEE: ADD REASON
============================== */
export const addReason = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length < 2) {
      return sendResponse(res, 400, false, "Reason too short");
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendResponse(res, 400, false, "Invalid attendance ID");
    }

    const attendance = await Attendance.findById(id);

    if (!attendance) {
      return sendResponse(res, 404, false, "Attendance not found");
    }

    // 🔥 SECURITY CHECK
    if (attendance.employee.toString() !== req.user.id) {
      return sendResponse(res, 403, false, "Not authorized");
    }

    // 🔥 prevent overwrite
    if (attendance.reason) {
      return sendResponse(res, 400, false, "Reason already submitted");
    }

    attendance.reason = reason.trim();
    attendance.reasonUpdatedAt = new Date();
    attendance.approved = false;

    await attendance.save();

    sendResponse(res, 200, true, "Reason submitted", attendance);
  } catch (error) {
    console.error("ADD REASON ERROR:", error);
    sendResponse(res, 500, false, "Server Error");
  }
};

/* ==============================
   ➤ GET EMPLOYEE REMARKS
============================== */
export const getEmployeeRemarks = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const employee = await findEmployee(employeeId);

    if (!employee) {
      return sendResponse(res, 404, false, "Employee not found");
    }

    const data = await Attendance.find({ employee: employee._id })
      .sort({ date: -1 })
      .lean();

    sendResponse(res, 200, true, "Employee remarks fetched", data);
  } catch (error) {
    console.error("EMPLOYEE REMARK ERROR:", error);
    sendResponse(res, 500, false, "Server Error");
  }
};