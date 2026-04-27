import React, { useEffect, useState } from "react";
import API from "../../utils/axios";
import { FaSearch } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

function EmployeeAccountAdmin() {

  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [department, setDepartment] = useState("");

  const [formData, setFormData] = useState({
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    panNumber: "",
  });

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  /* ==============================
     🔥 FETCH EMPLOYEES
  ============================== */
  const fetchEmployees = async () => {
    try {
      const res = await API.get("/employees");
      setEmployees(res.data);
      setFilteredEmployees(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  /* ==============================
     🔥 FILTER
  ============================== */
  useEffect(() => {
    let filtered = employees;

    if (department) {
      filtered = filtered.filter(e => e.department === department);
    }

    if (search) {
      filtered = filtered.filter(e =>
        `${e.firstName} ${e.lastName}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    setFilteredEmployees(filtered);
  }, [search, department, employees]);

  /* ==============================
     🔥 SELECT EMPLOYEE
  ============================== */
  const handleSelectEmployee = async (emp) => {
    setSelectedEmployee(emp);
    setSearch(`${emp.firstName} ${emp.lastName}`);
    setShowDropdown(false);

    try {
      const res = await API.get(`/employee-account/${emp._id}`);

      if (res.data?.data) {
        const acc = res.data.data;

        setFormData({
          bankName: acc.bankName || "",
          accountNumber: "", // 🔒 don't show existing
          ifscCode: acc.ifscCode || "",
          panNumber: acc.panNumber || "",
        });

        setEditMode(true);
      } else {
        resetForm();
      }
    } catch {
      resetForm();
    }
  };

  /* ==============================
     🔥 RESET FORM
  ============================== */
  const resetForm = () => {
    setFormData({
      bankName: "",
      accountNumber: "",
      ifscCode: "",
      panNumber: "",
    });
    setEditMode(false);
  };

  /* ==============================
     🔥 HANDLE CHANGE
  ============================== */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /* ==============================
     🔥 VALIDATION
  ============================== */
  const validate = () => {
    if (!formData.bankName) return "Bank name required";
    if (!formData.accountNumber && !editMode)
      return "Account number required";
    if (!formData.ifscCode) return "IFSC required";
    return null;
  };

  /* ==============================
     🔥 SUBMIT
  ============================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validate();
    if (error) {
      alert(error);
      return;
    }

    if (!selectedEmployee) {
      alert("Select employee first");
      return;
    }

    try {
      setLoading(true);

      if (editMode) {
        await API.put(`/employee-account/${selectedEmployee._id}`, formData);
        alert("✅ Updated successfully");
      } else {
        await API.post("/employee-account/add", {
          ...formData,
          employeeId: selectedEmployee._id,
        });
        alert("✅ Added successfully");
      }

      resetForm();

    } catch (err) {
      alert(err.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">

      <div className="card shadow-lg border-0">

        <div className="card-header bg-white">
          <h4 className="fw-bold text-primary">
            Employee Account Management
          </h4>
        </div>

        <div className="card-body">

          {/* FILTER */}
          <div className="row mb-4">

            {/* Department */}
            <div className="col-md-3">
              <select
                className="form-select"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="">All Departments</option>
                <option>IT</option>
                <option>HR</option>
                <option>Finance</option>
              </select>
            </div>

            {/* SEARCH */}
            <div className="col-md-5 position-relative">

              <FaSearch
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "12px",
                  transform: "translateY(-50%)",
                }}
              />

              <input
                className="form-control ps-5"
                placeholder="Search employee..."
                value={search}
                onFocus={() => setShowDropdown(true)}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowDropdown(true);
                }}
              />

              {/* DROPDOWN */}
              {showDropdown && search && (
                <div className="list-group position-absolute w-100 shadow" style={{ zIndex: 1000 }}>
                  {filteredEmployees.map(emp => (
                    <button
                      key={emp._id}
                      className="list-group-item list-group-item-action"
                      onClick={() => handleSelectEmployee(emp)}
                    >
                      {emp.firstName} {emp.lastName}
                    </button>
                  ))}
                </div>
              )}

            </div>

          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit}>

            <div className="row g-3">

              <div className="col-md-6">
                <input
                  name="bankName"
                  className="form-control"
                  placeholder="Bank Name"
                  value={formData.bankName}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <input
                  name="accountNumber"
                  className="form-control"
                  placeholder="Account Number"
                  value={formData.accountNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <input
                  name="ifscCode"
                  className="form-control"
                  placeholder="IFSC Code"
                  value={formData.ifscCode}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <input
                  name="panNumber"
                  className="form-control"
                  placeholder="PAN Number"
                  value={formData.panNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12 text-end">
                <button className="btn btn-primary px-4" disabled={loading}>
                  {loading
                    ? "Saving..."
                    : editMode
                    ? "Update Account"
                    : "Add Account"}
                </button>
              </div>

            </div>

          </form>

        </div>

      </div>

    </div>
  );
}

export default EmployeeAccountAdmin;