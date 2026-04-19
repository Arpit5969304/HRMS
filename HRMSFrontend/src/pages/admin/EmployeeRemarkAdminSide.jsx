import React, { useState, useMemo, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../assets/styles/EmployeeRemarks.css";

const EmployeeRemarkAdminSide = () => {
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [employees, setEmployees] = useState([]);

  // ✅ MOCK API FETCH (replace with real API)
  useEffect(() => {
    const mockData = [
      {
        id: 1,
        name: "Gyasi Kumar",
        department: "IT",
        date: "2026-02-27",
        checkIn: "08:32",
        checkOut: "14:28",
        remark: "Test",
        approved: false,
        selected: false,
      },
      {
        id: 2,
        name: "Ravi Singh",
        department: "HR",
        date: "2026-02-27",
        checkIn: "09:00",
        checkOut: "17:00",
        remark: "On time",
        approved: false,
        selected: false,
      },
    ];

    setEmployees(mockData);
  }, []);

  // ✅ Optimized departments
  const departments = useMemo(() => {
    return [...new Set(employees.map((emp) => emp.department))];
  }, [employees]);

  // ✅ Filtering
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) {
      setError("Please enter employee name");
      return;
    }
    setError("");
  };

  // ✅ Select single
  const toggleSelect = (id) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === id ? { ...emp, selected: !emp.selected } : emp
      )
    );
  };

  // ✅ Select ALL (only filtered)
  const toggleSelectAll = (checked) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        filteredEmployees.some((f) => f.id === emp.id)
          ? { ...emp, selected: checked }
          : emp
      )
    );
  };

  // ✅ Approve selected
  const approveSelected = async () => {
    const selectedEmployees = employees.filter((emp) => emp.selected);

    if (selectedEmployees.length === 0) return;

    if (
      window.confirm(
        `Approve ${selectedEmployees.length} selected employee(s)?`
      )
    ) {
      try {
        // 👉 Replace with API call
        // await fetch("/api/approve", {...})

        setEmployees((prev) =>
          prev.map((emp) =>
            emp.selected
              ? { ...emp, approved: true, selected: false }
              : emp
          )
        );
      } catch (err) {
        console.error(err);
      }
    }
  };

  // ✅ Update remark (inline edit)
  const updateRemark = (id, value) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === id ? { ...emp, remark: value } : emp
      )
    );
  };

  return (
    <div className="container py-3 py-md-5">
      <div className="card shadow-sm border-0 employee-card">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row gap-2 align-items-stretch align-items-md-center">
          <select
            className="form-select w-100 w-md-auto"
            style={{ maxWidth: "180px" }}
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map((dept, index) => (
              <option key={index} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <form
            className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2 w-100 w-md-auto"
            style={{ maxWidth: "350px" }}
            onSubmit={handleSearch}
          >
            <input
              type="text"
              className="form-control w-100"
              placeholder="Search employee..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setError("");
              }}
            />

            <button className="btn btn-primary w-100 w-sm-auto">
              Search
            </button>
          </form>
        </div>

        {error && <div className="alert alert-danger m-3">{error}</div>}

        {/* Table */}
        <div className="table-responsive mt-3">
          <table className="table align-middle employee-table text-nowrap">
            <thead>
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
                <th>Remark</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredEmployees.length > 0 ? (
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

                    <td className="text-success fw-semibold">
                      {emp.checkIn}
                    </td>

                    <td className="text-danger fw-semibold">
                      {emp.checkOut}
                    </td>

                    {/* ✅ Editable Remark */}
                    <td>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={emp.remark}
                        onChange={(e) =>
                          updateRemark(emp.id, e.target.value)
                        }
                      />
                    </td>

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
                  <td colSpan="7" className="text-center text-muted py-4">
                    No employees found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ✅ Approve Button */}
        <div className="p-3">
          <button className="btn btn-success" onClick={approveSelected}>
            Approve Selected
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeRemarkAdminSide;