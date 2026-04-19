import React, { useState } from "react";
import "../../assets/styles/Leave.css";

const Leave = () => {
  const [activeTab, setActiveTab] = useState("apply");

  const [leaveForm, setLeaveForm] = useState({
    leaveType: "",
    fromDate: "",
    toDate: "",
    reason: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setLeaveForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!leaveForm.leaveType || !leaveForm.fromDate || !leaveForm.toDate) {
      alert("Please fill all required fields");
      return;
    }

    console.log("Leave Submitted:", leaveForm);

    setLeaveForm({
      leaveType: "",
      fromDate: "",
      toDate: "",
      reason: "",
    });
  };

  const handleCancel = () => {
    setLeaveForm({
      leaveType: "",
      fromDate: "",
      toDate: "",
      reason: "",
    });
  };

  const leaveHistory = [
    {
      type: "Sick Leave",
      from: "05-02-2026",
      to: "06-02-2026",
      status: "Approved",
      reason: "testing",
    },
    {
      type: "Sick Leave",
      from: "05-02-2026",
      to: "06-02-2026",
      status: "Pending",
      reason: "testing",
    },
    {
      type: "Half Unpaid Leave",
      from: "18-10-2025",
      to: "18-10-2025",
      status: "Approved",
      reason: "testing",
    },
    {
      type: "Unpaid Leave",
      from: "10-10-2025",
      to: "11-10-2025",
      status: "Pending",
      reason: "out of town",
    },
    {
      type: "Half Unpaid Leave",
      from: "18-10-2025",
      to: "18-10-2025",
      status: "Approved",
      reason: "testing",
    },
  ];

  // calculate leave days
  const getLeaveDays = (from, to) => {
    const start = new Date(from.split("-").reverse().join("-"));
    const end = new Date(to.split("-").reverse().join("-"));

    const diff = end - start;

    return diff / (1000 * 60 * 60 * 24) + 1;
  };

  let paidLeave = 0;
  let unpaidLeave = 0;

  leaveHistory.forEach((leave) => {
    if (leave.status === "Approved") {
      const days = getLeaveDays(leave.from, leave.to);

      if (
        leave.type === "Paid Leave" ||
        leave.type === "Sick Leave" ||
        leave.type === "Casual Leave"
      ) {
        paidLeave += days;
      }

      if (leave.type === "Unpaid Leave") {
        unpaidLeave += days;
      }

      if (leave.type === "Half Unpaid Leave") {
        unpaidLeave += 0.5;
      }
    }
  });

  const totalLeave = paidLeave + unpaidLeave;

  return (
    <div className="leave-container">
      {/* Tabs */}
      <div className="leave-tabs">
        <button
          className={activeTab === "apply" ? "active" : ""}
          onClick={() => setActiveTab("apply")}
        >
          Apply Leave
        </button>

        <button
          className={activeTab === "history" ? "active" : ""}
          onClick={() => setActiveTab("history")}
        >
          My History
        </button>
      </div>

      {/* Card */}
      {activeTab === "apply" && (
        <div className="leave-card-wrapper">
          <div className="leave-card-heading">Apply for Leave</div>

          <form className="leave-card" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Leave Type</label>
              <select
                name="leaveType"
                value={leaveForm.leaveType}
                onChange={handleChange}
              >
                <option value="">-- Select Leave Type --</option>
                <option value="Casual Leave">Casual Leave</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Paid Leave">Paid Leave</option>
              </select>
            </div>

            <div className="date-row">
              <div className="form-group">
                <label>From</label>
                <input
                  type="date"
                  name="fromDate"
                  value={leaveForm.fromDate}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>To</label>
                <input
                  type="date"
                  name="toDate"
                  value={leaveForm.toDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Reason for leave</label>
              <textarea
                rows="4"
                name="reason"
                value={leaveForm.reason}
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="btn-group">
              <button type="submit" className="apply-btn">
                Apply Leave
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* History Table */}
      {activeTab === "history" && (
        <div className="history-card">
          <table className="history-table">
            <thead>
              {/* 🔥 TOP HEADER (your div moved here) */}
              <tr>
                <th colSpan="6" className="history-card-head">
                  <div className="header-inner">
                    Leave History
                    <span className="leave-count paid">Paid: {paidLeave}</span>
                    <span className="leave-count unpaid">
                      Unpaid: {unpaidLeave}
                    </span>
                    <span className="leave-count total">
                      Total Leave: {totalLeave} day
                    </span>
                  </div>
                </th>
              </tr>

              {/* 🔥 COLUMN HEADER */}
              <tr>
                <th>Leave Type</th>
                <th>From</th>
                <th>To</th>
                <th>Days</th>
                <th>Status</th>
                <th>Reason</th>
              </tr>
            </thead>

            <tbody>
              {leaveHistory.map((item, index) => (
                <tr key={index}>
                  <td>{item.type}</td>
                  <td>{item.from}</td>
                  <td>{item.to}</td>
                  <td>{getLeaveDays(item.from, item.to)}</td>
                  <td>
                    <span
                      className={`status-badge ${item.status.toLowerCase()}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td>{item.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Leave;
