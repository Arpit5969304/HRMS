import React, { useState, useEffect } from "react";
import API from "../../utils/axios";

const ManageLeaves = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ==============================
     🔥 FETCH ALL LEAVES (ADMIN)
  ============================== */
  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await API.get("/leave");
      setLeaves(res.data);
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
     🔥 APPROVE / REJECT
  ============================== */
  const handleStatusUpdate = async (id, status) => {
    try {
      await API.put(`/leave/${id}/status`, { status });

      // 🔥 instant UI update
      setLeaves((prev) =>
        prev.map((leave) =>
          leave._id === id ? { ...leave, status } : leave
        )
      );
    } catch (error) {
      console.error("Error updating status", error);
      alert("Failed to update status");
    }
  };

  /* ==============================
     🔥 FILTER LOGIC
  ============================== */
  useEffect(() => {
    let data = leaves;

    if (selectedStatus) {
      data = data.filter((l) => l.status === selectedStatus);
    }

    if (searchTerm) {
      data = data.filter(
        (l) =>
          l.employee?.firstName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          l.employee?.lastName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLeaves(data);
  }, [searchTerm, selectedStatus, leaves]);

  /* ==============================
     🔥 DATE FORMAT
  ============================== */
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-CA");

  return (
    <div className="container-fluid p-3 p-md-4">
      <div className="card shadow-sm">
        <div className="card-body">

          {/* HEADER */}
          <div className="d-flex flex-column flex-lg-row gap-2 justify-content-between align-items-center mb-3">
            <h5 className="fw-semibold text-primary">Manage Leaves</h5>

            <div className="d-flex flex-wrap gap-2">

              <select
                className="form-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option>Approved</option>
                <option>Pending</option>
                <option>Rejected</option>
              </select>

              <input
                type="text"
                className="form-control"
                placeholder="Search employee"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

            </div>
          </div>

          {/* TABLE */}
          <div className="table-responsive">
            {loading ? (
              <p className="text-center">Loading...</p>
            ) : (
              <table className="table table-bordered table-hover align-middle text-nowrap">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Employee</th>
                    <th>Leave Type</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Days</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredLeaves.length > 0 ? (
                    filteredLeaves.map((leave) => (
                      <tr key={leave._id}>
                        <td>{leave._id.slice(-5)}</td>

                        <td>
                          {leave.employee?.firstName}{" "}
                          {leave.employee?.lastName}
                        </td>

                        <td>{leave.leaveType}</td>

                        <td>{formatDate(leave.fromDate)}</td>
                        <td>{formatDate(leave.toDate)}</td>

                        <td>{leave.totalDays}</td>

                        <td>
                          <span
                            className={`badge ${
                              leave.status === "Approved"
                                ? "bg-success"
                                : leave.status === "Rejected"
                                ? "bg-danger"
                                : "bg-warning text-dark"
                            }`}
                          >
                            {leave.status}
                          </span>
                        </td>

                        <td>
                          <div className="d-flex gap-2 justify-content-center">

                            <button
                              className="btn btn-sm btn-success"
                              disabled={leave.status === "Approved"}
                              onClick={() =>
                                handleStatusUpdate(leave._id, "Approved")
                              }
                            >
                              Approve
                            </button>

                            <button
                              className="btn btn-sm btn-danger"
                              disabled={leave.status === "Rejected"}
                              onClick={() =>
                                handleStatusUpdate(leave._id, "Rejected")
                              }
                            >
                              Reject
                            </button>

                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center py-3">
                        No leaves found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ManageLeaves;
