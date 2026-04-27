import React, { useEffect, useState } from "react";
import "../../assets/styles/EmployeeRemarks.css";
import API from "../../utils/axios";
import { useAuth } from "../../context/AuthContext";

const EmployeeRemarkside = () => {
  const { user } = useAuth();
  const employeeId = user?.employeeId;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reasonInputs, setReasonInputs] = useState({});

  /* =========================
     FETCH DATA
  ========================= */
  const fetchRemarks = async () => {
    if (!employeeId) return;

    try {
      setLoading(true);
      setError("");

      const res = await API.get(`/remarks/employee/${employeeId}`);

      setData(res?.data?.data || []);
    } catch (err) {
      console.error("API ERROR:", err.response?.data || err.message);

      setError(
        err.response?.data?.message ||
        "Failed to load attendance data"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     WAIT for employeeId
  ========================= */
  useEffect(() => {
    if (employeeId) {
      fetchRemarks();
    }
  }, [employeeId]);

  /* =========================
     HANDLE INPUT
  ========================= */
  const handleReasonChange = (id, value) => {
    setReasonInputs((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  /* =========================
     SUBMIT REASON
  ========================= */
  const submitReason = async (id) => {
    const reason = reasonInputs[id];

    if (!reason || !reason.trim()) {
      return alert("Please enter reason");
    }

    try {
      await API.post(`/remarks/employee/reason/${id}`, { reason });

      // update UI instantly
      setData((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, reason } : item
        )
      );

      setReasonInputs((prev) => ({ ...prev, [id]: "" }));

      alert("Reason submitted successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to submit reason");
    }
  };

  return (
    <div className="container py-3 py-md-5">
      <div className="card shadow-sm border-0 employee-card">

        {/* HEADER */}
        <div className="card-header d-flex justify-content-between align-items-center bg-primary text-white">
          <span className="fw-semibold">My Attendance & Remarks</span>
          <button className="btn btn-light btn-sm" onClick={fetchRemarks}>
            Refresh
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="alert alert-danger m-3">{error}</div>
        )}

        {/* TABLE */}
        <div className="table-responsive">
          <table className="table align-middle employee-table text-nowrap mb-0">
            <thead className="table-light">
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Reason</th>
                <th>Remark</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    <div className="spinner-border text-primary"></div>
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((item) => (
                  <tr key={item._id}>

                    {/* DATE */}
                    <td>
                      {new Date(item.date).toLocaleDateString()}
                    </td>

                    {/* CHECK IN */}
                    <td className="text-success fw-semibold">
                      {item.checkIn
                        ? new Date(item.checkIn).toLocaleTimeString()
                        : "-"}
                    </td>

                    {/* CHECK OUT */}
                    <td className="text-danger fw-semibold">
                      {item.checkOut
                        ? new Date(item.checkOut).toLocaleTimeString()
                        : "-"}
                    </td>

                    {/* REASON */}
                    <td>
                      {item.reason ? (
                        <span className="fw-semibold">{item.reason}</span>
                      ) : item.approved ? (
                        <span className="text-muted">Locked</span>
                      ) : (
                        <div className="d-flex gap-2">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Enter reason"
                            value={reasonInputs[item._id] || ""}
                            onChange={(e) =>
                              handleReasonChange(item._id, e.target.value)
                            }
                          />
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => submitReason(item._id)}
                          >
                            Submit
                          </button>
                        </div>
                      )}
                    </td>

                    {/* REMARK */}
                    <td>
                      {item.remark ? (
                        item.remark
                      ) : (
                        <span className="text-muted">No remark</span>
                      )}
                    </td>

                    {/* STATUS */}
                    <td>
                      <span
                        className={`badge ${
                          item.approved
                            ? "bg-success"
                            : "bg-warning text-dark"
                        }`}
                      >
                        {item.approved ? "Approved" : "Pending"}
                      </span>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeRemarkside;