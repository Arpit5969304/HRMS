import React, { useState, useEffect } from "react";

const ManageLeaves = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [filteredLeaves, setFilteredLeaves] = useState([]);

  const [leaves, setLeaves] = useState([
    {
      id: 10,
      employee: "Kratika Sharma",
      department: "IT",
      type: "Half Unpaid Leave",
      from: "2025-01-01",
      to: "2025-01-01",
      days: 1,
      status: "Rejected",
    },
    {
      id: 11,
      employee: "Kratika Sharma",
      department: "IT",
      type: "Unpaid Leave",
      from: "2025-08-09",
      to: "2025-08-10",
      days: 2,
      status: "Approved",
    },
    {
      id: 20,
      employee: "Ravi Mehta",
      department: "HR",
      type: "Unpaid Leave",
      from: "2025-10-10",
      to: "2025-10-11",
      days: 2,
      status: "Pending",
    },
  ]);

  const handleApprove = (id) => {
    setLeaves((prev) =>
      prev.map((leave) =>
        leave.id === id ? { ...leave, status: "Approved" } : leave,
      ),
    );
  };

  const handleReject = (id) => {
    setLeaves((prev) =>
      prev.map((leave) =>
        leave.id === id ? { ...leave, status: "Rejected" } : leave,
      ),
    );
  };

  const formatDate = (date) => new Date(date).toLocaleDateString("en-CA");

  const departments = [...new Set(leaves.map((l) => l.department))];
  const employees = [...new Set(leaves.map((l) => l.employee))];

  useEffect(() => {
    let data = leaves;

    if (selectedDepartment) {
      data = data.filter((l) => l.department === selectedDepartment);
    }

    if (selectedEmployee) {
      data = data.filter((l) => l.employee === selectedEmployee);
    }

    if (selectedStatus) {
      data = data.filter((l) => l.status === selectedStatus);
    }

    if (searchTerm) {
      data = data.filter(
        (l) =>
          l.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.status.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredLeaves(data);
  }, [
    searchTerm,
    selectedDepartment,
    selectedEmployee,
    selectedStatus,
    leaves,
  ]);

  return (
    <div className="container-fluid p-3 p-md-4">
      <div className="card shadow-sm">
        <div className="card-body">
          {/* Header */}
          <div className="d-flex flex-column flex-lg-row gap-2 justify-content-between align-items-stretch align-items-lg-center mb-3">
            <h5 className="fw-semibold mb-0 text-primary text-center text-lg-start">
              Manage Leaves
            </h5>

            <div className="d-flex flex-column flex-lg-row gap-2 w-100 w-lg-auto">
              {/* Department */}
              <select
                className="form-select w-100 w-lg-auto"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map((dept, i) => (
                  <option key={i}>{dept}</option>
                ))}
              </select>

              {/* Employee */}
              <select
                className="form-select w-100 w-lg-auto"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
              >
                <option value="">All Employees</option>
                {employees.map((emp, i) => (
                  <option key={i}>{emp}</option>
                ))}
              </select>

              {/* Status */}
              <select
                className="form-select w-100 w-lg-auto"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option>Approved</option>
                <option>Pending</option>
                <option>Rejected</option>
              </select>

              {/* Search */}
              <input
                type="text"
                className="form-control w-100 w-lg-auto"
                placeholder="Search employee"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="table-responsive">
            <table className="table table-bordered table-hover align-middle text-nowrap">
              <thead className="table-light">
                <tr>
                  <th>Leave ID</th>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>From Date</th>
                  <th>To Date</th>
                  <th>Days</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredLeaves.length > 0 ? (
                  filteredLeaves.map((leave) => (
                    <tr key={leave.id}>
                      <td>{leave.id}</td>
                      <td>{leave.employee}</td>
                      <td>{leave.type}</td>
                      <td>{formatDate(leave.from)}</td>
                      <td>{formatDate(leave.to)}</td>
                      <td>{leave.days}</td>

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
                        <div className="d-flex flex-row flex-nowrap gap-2 justify-content-center">
                          <button
                            className="btn btn-sm btn-link text-success p-0"
                            onClick={() => handleApprove(leave.id)}
                          >
                            Approve
                          </button>

                          <button
                            className="btn btn-sm btn-link text-danger p-0"
                            onClick={() => handleReject(leave.id)}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageLeaves;
