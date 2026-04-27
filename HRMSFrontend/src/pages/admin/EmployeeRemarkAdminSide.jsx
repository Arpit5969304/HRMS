import React, { useState, useMemo, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../assets/styles/EmployeeRemarks.css";
import API from "../../utils/axios";

const EmployeeRemarkAdminSide = () => {
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ==============================
     FETCH DATA
  ============================== */
  const fetchRemarks = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/remarks/admin");

      const records = res?.data?.data?.records || [];

      const formatted = records.map((item) => ({
        id: item._id,
        name: `${item.employee?.firstName || ""} ${item.employee?.lastName || ""}`,
        department: item.employee?.department || "Unknown",
        date: new Date(item.date).toLocaleDateString(),
        checkIn: item.checkIn
          ? new Date(item.checkIn).toLocaleTimeString()
          : "-",
        checkOut: item.checkOut
          ? new Date(item.checkOut).toLocaleTimeString()
          : "-",
        reason: item.reason || "", // 🔥 NEW
        remark: item.remark || "",
        approved: item.approved,
        selected: false,
      }));

      setEmployees(formatted);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch remarks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRemarks();
  }, []);

  /* ==============================
     FILTERS
  ============================== */
  const departments = useMemo(() => {
    return [...new Set(employees.map((emp) => emp.department))];
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesDepartment =
        selectedDepartment === "" || emp.department === selectedDepartment;

      const matchesSearch = emp.name
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchesDepartment && matchesSearch;
    });
  }, [employees, search, selectedDepartment]);

  /* ==============================
     SELECT
  ============================== */
  const toggleSelect = (id) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === id ? { ...emp, selected: !emp.selected } : emp
      )
    );
  };

  const toggleSelectAll = (checked) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        filteredEmployees.some((f) => f.id === emp.id)
          ? { ...emp, selected: checked }
          : emp
      )
    );
  };

  /* ==============================
     APPROVE
  ============================== */
  const approveSelected = async () => {
    const selectedEmployees = employees.filter((emp) => emp.selected);

    if (selectedEmployees.length === 0) {
      return alert("Select at least one record");
    }

    if (window.confirm(`Approve ${selectedEmployees.length} records?`)) {
      try {
        const ids = selectedEmployees.map((emp) => emp.id);

        await API.post("/remarks/admin/approve", { ids });

        setEmployees((prev) =>
          prev.map((emp) =>
            emp.selected
              ? { ...emp, approved: true, selected: false }
              : emp
          )
        );

        alert("Approved successfully");
      } catch (err) {
        console.error(err);
        alert("Approval failed");
      }
    }
  };

  /* ==============================
     UPDATE REMARK (onBlur)
  ============================== */
  const updateRemark = async (id, value) => {
    try {
      await API.put(`/remarks/admin/${id}`, { remark: value });

      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === id ? { ...emp, remark: value } : emp
        )
      );
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="card shadow border-0 rounded-4 employee-card">

        {/* HEADER */}
        <div className="card-header bg-white border-0 d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <h5 className="fw-bold mb-1">Employee Remarks</h5>
            <small className="text-muted">Manage employee remarks</small>
          </div>

          <div className="d-flex gap-2 flex-wrap">
            <select
              className="form-select"
              style={{ maxWidth: "180px" }}
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((dept, i) => (
                <option key={i}>{dept}</option>
              ))}
            </select>

            <input
              type="text"
              className="form-control"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: "200px" }}
            />
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="alert alert-danger m-3">{error}</div>
        )}

        {/* TABLE */}
        <div className="table-responsive px-3">
          <table className="table align-middle">
            <thead className="table-light">
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={
                      filteredEmployees.length > 0 &&
                      filteredEmployees.every((emp) => emp.selected)
                    }
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                  />
                </th>
                <th>Employee</th>
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
                  <td colSpan="8" className="text-center py-4">
                    <div className="spinner-border text-primary" />
                  </td>
                </tr>
              ) : filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={emp.selected}
                        onChange={() => toggleSelect(emp.id)}
                      />
                    </td>

                    <td className="fw-semibold">{emp.name}</td>
                    <td>{emp.date}</td>
                    <td className="text-success">{emp.checkIn}</td>
                    <td className="text-danger">{emp.checkOut}</td>

                    {/* 🔥 REASON */}
                    <td>
                      {emp.reason || (
                        <span className="text-muted">No reason</span>
                      )}
                    </td>

                    {/* 🔥 REMARK */}
                    <td>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        defaultValue={emp.remark}
                        onBlur={(e) =>
                          updateRemark(emp.id, e.target.value)
                        }
                      />
                    </td>

                    {/* STATUS */}
                    <td>
                      <span
                        className={`badge ${
                          emp.approved
                            ? "bg-success"
                            : "bg-warning text-dark"
                        }`}
                      >
                        {emp.approved ? "Approved" : "Pending"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="card-footer text-end">
          <button className="btn btn-success" onClick={approveSelected}>
            Approve Selected
          </button>
        </div>

      </div>
    </div>
  );
};

export default EmployeeRemarkAdminSide;