import React, { useEffect, useState } from "react";
import "../../assets/styles/Leave.css";
import API from "../../utils/axios";

const Leave = () => {
  const [activeTab, setActiveTab] = useState("apply");

  const [leaveForm, setLeaveForm] = useState({
    leaveType: "",
    fromDate: "",
    toDate: "",
    reason: "",
  });

  const [leaveHistory, setLeaveHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* ==============================
     🔥 FETCH MY LEAVES
  ============================== */
  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await API.get("/leave/my");
      setLeaveHistory(res.data);
    } catch (error) {
      console.error("Error fetching leaves", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  /* ==============================
     🔥 HANDLE INPUT
  ============================== */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLeaveForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ==============================
     🔥 APPLY LEAVE
  ============================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!leaveForm.leaveType || !leaveForm.fromDate || !leaveForm.toDate) {
      alert("Please fill all required fields");
      return;
    }

    const start = new Date(leaveForm.fromDate);
    const end = new Date(leaveForm.toDate);

    // normalize
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      alert("Leave cannot start in the past");
      return;
    }

    if (end < start) {
      alert("To date cannot be before From date");
      return;
    }

    try {
      setSubmitting(true);

      await API.post("/leave", {
        leaveType: leaveForm.leaveType,
        fromDate: leaveForm.fromDate,
        toDate: leaveForm.toDate,
        reason: leaveForm.reason?.trim(),
      });

      alert("Leave Applied Successfully");

      setLeaveForm({
        leaveType: "",
        fromDate: "",
        toDate: "",
        reason: "",
      });

      await fetchLeaves();
      setActiveTab("history");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Error applying leave");
    } finally {
      setSubmitting(false);
    }
  };

  /* ==============================
     🔥 CANCEL
  ============================== */
  const handleCancel = () => {
    setLeaveForm({
      leaveType: "",
      fromDate: "",
      toDate: "",
      reason: "",
    });
  };

  /* ==============================
     🔥 CALCULATE DAYS
  ============================== */
  const getLeaveDays = (from, to) => {
    const start = new Date(from);
    const end = new Date(to);

    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const diff = end - start;
    return diff / (1000 * 60 * 60 * 24) + 1;
  };

  /* ==============================
     🔥 LEAVE SUMMARY
  ============================== */
  let paidLeave = 0;
  let unpaidLeave = 0;

  leaveHistory.forEach((leave) => {
    if (leave.status === "Approved") {
      const days = getLeaveDays(leave.fromDate, leave.toDate);

      if (
        leave.leaveType === "Paid Leave" ||
        leave.leaveType === "Sick Leave" ||
        leave.leaveType === "Casual Leave"
      ) {
        paidLeave += days;
      }

      if (leave.leaveType === "Unpaid Leave") {
        unpaidLeave += days;
      }

      if (leave.leaveType === "Half Unpaid Leave") {
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

      {/* APPLY FORM */}
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
              <label>Reason</label>
              <textarea
                rows="4"
                name="reason"
                value={leaveForm.reason}
                onChange={handleChange}
              />
            </div>

            <div className="btn-group">
              <button
                type="submit"
                className="apply-btn"
                disabled={submitting}
              >
                {submitting ? "Applying..." : "Apply Leave"}
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

      {/* HISTORY */}
      {activeTab === "history" && (
        <div className="history-card">
          {loading ? (
            <p>Loading...</p>
          ) : leaveHistory.length === 0 ? (
            <p style={{ textAlign: "center" }}>No leave history found</p>
          ) : (
            <table className="history-table">
              <thead>
                <tr>
                  <th colSpan="6" className="history-card-head">
                    <div className="header-inner">
                      Leave History
                      <span className="leave-count paid">
                        Paid: {paidLeave}
                      </span>
                      <span className="leave-count unpaid">
                        Unpaid: {unpaidLeave}
                      </span>
                      <span className="leave-count total">
                        Total Leave: {totalLeave} days
                      </span>
                    </div>
                  </th>
                </tr>

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
                    <td>{item.leaveType}</td>
                    <td>{item.fromDate?.slice(0, 10)}</td>
                    <td>{item.toDate?.slice(0, 10)}</td>
                    <td>{getLeaveDays(item.fromDate, item.toDate)}</td>
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
          )}
        </div>
      )}
    </div>
  );
};

export default Leave;