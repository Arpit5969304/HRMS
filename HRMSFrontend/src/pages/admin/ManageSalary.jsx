import React, { useState } from "react";
import "../../assets/styles/ManageSalary.css";
import useEmployees from "../../hooks/useEmployees";
import useSalary from "../../hooks/useSalary";

const emptySalary = {
  basic: "",
  hra: "",
  conveyance: "",
  medical: "",
  lta: "",
  special: "",
};

const salaryFields = ["basic", "hra", "conveyance", "medical", "lta", "special"];

const salaryLabels = {
  basic: "Basic",
  hra: "HRA",
  conveyance: "Conveyance",
  medical: "Medical",
  lta: "LTA",
  special: "Special",
};

const monthNames = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const formatMoney = (amount) =>
  `Rs. ${Number(amount || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getHistoryTotal = (record) => {
  if (record.totalSalary !== undefined && record.totalSalary !== null) {
    return record.totalSalary;
  }

  return salaryFields.reduce(
    (total, field) => total + Number(record.salary?.[field] || 0),
    0
  );
};

const hasAmount = (amount) =>
  amount !== undefined && amount !== null && amount !== "";

const formatOptionalMoney = (amount) =>
  hasAmount(amount) ? formatMoney(amount) : "-";

const getAppliedByName = (increment) => {
  const appliedBy = increment.createdBy;

  if (!appliedBy) return "-";
  if (typeof appliedBy === "string") return appliedBy;

  const name = [appliedBy.firstName, appliedBy.lastName]
    .filter(Boolean)
    .join(" ");

  if (name && appliedBy.employeeId) {
    return `${name} (${appliedBy.employeeId})`;
  }

  return name || appliedBy.employeeId || "-";
};

const getPreviousBasic = (increment) => {
  if (hasAmount(increment.previousBasic)) return increment.previousBasic;
  if (hasAmount(increment.newBasic)) {
    return Number(increment.newBasic) - Number(increment.amount || 0);
  }

  return null;
};

const getNewBasic = (increment) => {
  if (hasAmount(increment.newBasic)) return increment.newBasic;
  if (hasAmount(increment.previousBasic)) {
    return Number(increment.previousBasic) + Number(increment.amount || 0);
  }

  return null;
};

const ManageSalary = () => {
  const { employees } = useEmployees();

  const {
    salaryHistory,
    incrementHistory,
    saveSalary,
    applyIncrement,
    getCurrentSalary,
    getSalaryHistory,
    getIncrementHistory,
  } = useSalary();

  const [salary, setSalary] = useState(emptySalary);

  const [searchEmployee, setSearchEmployee] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("salary");
  const [selectedDepartment, setSelectedDepartment] = useState("");

  const departments = [
    ...new Set(employees.map((emp) => emp.department).filter(Boolean)),
  ];

  const [incrementAmount, setIncrementAmount] = useState("");
  const [remarks, setRemarks] = useState("");

  const totalIncrementAmount = incrementHistory.reduce(
    (total, increment) => total + Number(increment.amount || 0),
    0
  );

  const latestIncrementDate = incrementHistory[0]?.createdAt;

  const netSalary =
    Number(salary.basic || 0) +
    Number(salary.hra || 0) +
    Number(salary.conveyance || 0) +
    Number(salary.medical || 0) +
    Number(salary.lta || 0) +
    Number(salary.special || 0);

  const handleChange = (field, value) => {
    setSalary({ ...salary, [field]: value });
  };

  /* ==============================
     🔥 SEARCH
  ============================== */
  const handleEmployeeSearch = (value) => {
    setSearchEmployee(value);

    const search = value.toLowerCase();

    const results = employees.filter((emp) => {
      const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();

      const matchesDepartment =
        !selectedDepartment || emp.department === selectedDepartment;

      const matchesSearch =
        fullName.includes(search) ||
        emp.department?.toLowerCase().includes(search) ||
        emp.employeeId?.toLowerCase().includes(search);

      return matchesDepartment && matchesSearch;
    });

    setFilteredEmployees(results);
  };

  /* ==============================
     🔥 SELECT EMPLOYEE
  ============================== */
  const selectEmployee = async (emp) => {
    setSearchEmployee(`${emp.firstName} ${emp.lastName}`);
    setSelectedEmployee(emp);
    setFilteredEmployees([]);
    setErrors({});

    const currentSalary = await getCurrentSalary(emp._id);

    if (currentSalary) {
      setSalary({
        basic: currentSalary.basic ?? "",
        hra: currentSalary.hra ?? "",
        conveyance: currentSalary.conveyance ?? "",
        medical: currentSalary.medical ?? "",
        lta: currentSalary.lta ?? "",
        special: currentSalary.special ?? "",
      });
    } else {
      setSalary(emptySalary);
    }

    // 🔥 fetch history from backend
    await getSalaryHistory(emp._id);
    await getIncrementHistory(emp._id);
  };

  /* ==============================
     🔥 VALIDATION
  ============================== */
  const validateSalary = () => {
    let newErrors = {};

    Object.keys(salary).forEach((key) => {
      if (salary[key] === "" || Number(salary[key]) < 0) {
        newErrors[key] = "Invalid amount";
      }
    });

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* ==============================
     🔥 SAVE SALARY (API)
  ============================== */
  const handleSaveSalary = async () => {
    if (!selectedEmployee) {
      alert("Please select employee");
      return;
    }

    if (!validateSalary()) return;

    try {
      const result = await saveSalary(selectedEmployee._id, salary);
      alert(result?.message || "Salary saved successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  /* ==============================
     🔥 INCREMENT (API)
  ============================== */
  const handleIncrement = async () => {
    if (!selectedEmployee) {
      alert("Select employee first");
      return;
    }

    if (!incrementAmount || Number(incrementAmount) <= 0) {
      alert("Enter valid increment amount");
      return;
    }

    try {
      const result = await applyIncrement(
        selectedEmployee._id,
        incrementAmount,
        remarks
      );

      if (result?.salary) {
        setSalary({
          basic: result.salary.basic ?? "",
          hra: result.salary.hra ?? "",
          conveyance: result.salary.conveyance ?? "",
          medical: result.salary.medical ?? "",
          lta: result.salary.lta ?? "",
          special: result.salary.special ?? "",
        });
      }

      setIncrementAmount("");
      setRemarks("");

      alert("✅ Increment applied");
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <>
      <div className="container-fluid ">
        <div className="card shadow-sm border-0">
          <div className="card-body">
            <h4 className=" fw-bold text-primary">
              Manage Employee Salary
            </h4>

            {/* Employee Search + Net Salary */}
            <div className="row g-3 mb-3">
              {/* Department */}
              <div className="col-12 col-sm-6 col-lg-4">
                <label className="form-label fw-semibold">Department</label>

                <select
                  className="form-select"
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
              </div>

              {/* Search */}
              <div className="col-12 col-sm-6 col-lg-4">
                <label className="form-label fw-semibold">
                  Select Employee
                </label>

                <div className="position-relative">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search employee..."
                    value={searchEmployee}
                    onChange={(e) =>
                      handleEmployeeSearch(e.target.value)
                    }
                  />

                  {filteredEmployees.length > 0 && (
                    <ul className="list-group position-absolute w-100 shadow">
                      {filteredEmployees.map((emp) => (
                        <li
                          key={emp._id}
                          className="list-group-item list-group-item-action"
                          onClick={() => selectEmployee(emp)}
                        >
                          <div className="d-flex justify-content-between">
                            <span>
                              {emp.firstName} {emp.lastName}
                            </span>
                            <small className="text-muted">
                              {emp.department}
                            </small>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Net Salary */}
              <div className="col-12 col-sm-6 col-lg-4">
                <label className="form-label fw-semibold">
                  Monthly Salary
                </label>

                <input
                  type="text"
                  className="form-control fw-bold bg-light"
                  value={netSalary.toFixed(2)}
                  readOnly
                />
              </div>
            </div>

            {/* Tabs */}
            <ul className="nav nav-tabs mb-4">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "salary" ? "active" : ""}`}
                  onClick={() => setActiveTab("salary")}
                >
                  Salary Structure
                </button>
              </li>

              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "history" ? "active" : ""}`}
                  onClick={() => setActiveTab("history")}
                >
                  Salary History
                </button>
              </li>

              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "increment" ? "active" : ""}`}
                  onClick={() => setActiveTab("increment")}
                >
                  Increment History
                </button>
              </li>
            </ul>

            {/* Salary */}
            {activeTab === "salary" && (
              <>
                <div className="row g-3">
                  {Object.keys(salary).map((key) => (
                    <div className="col-12 col-sm-6 col-lg-4" key={key}>
                      <div className="input-group-m">
                        <span className="input-addon text-capitalize">
                          {key}
                        </span>

                        <input
                          type="number"
                          className="custom-input"
                          value={salary[key]}
                          onChange={(e) =>
                            handleChange(key, (e.target.value))
                          }
                        />
                      </div>

                      {errors[key] && (
                        <small className="text-danger">
                          {errors[key]}
                        </small>
                      )}
                    </div>
                  ))}

                  <div className="col-12 col-sm-6 col-lg-4">
                    <label className="form-label fw-semibold">
                      Net Salary
                    </label>

                    <input
                      type="text"
                      className="form-control fw-bold bg-light"
                      value={netSalary.toFixed(2)}
                      readOnly
                    />
                  </div>
                </div>

                <div className="text-end ">
                  <button
                    className="btn btn-success px-4"
                    onClick={handleSaveSalary}
                  >
                    Save Salary
                  </button>
                </div>

                {/* Increment */}
                <div className="card border-0 bg-light">
                  <div className="card-body">
                    <h6 className="fw-bold mb-3">Apply Increment</h6>

                    <div className="row g-3 align-items-end">
                      <div className="col-12 col-sm-6 col-lg-4">
                        <div className="input-group-m">
                          <span className="input-addon">
                            Increment
                          </span>

                          <input
                            type="number"
                            className="custom-input"
                            value={incrementAmount}
                            onChange={(e) =>
                              setIncrementAmount(e.target.value)
                            }
                          />
                        </div>
                      </div>

                      <div className="col-12 col-sm-6 col-lg-4">
                        <div className="input-group-m">
                          <span className="input-addon">
                            Remarks
                          </span>

                          <input
                            type="text"
                            className="custom-input"
                            value={remarks}
                            onChange={(e) =>
                              setRemarks(e.target.value)
                            }
                          />
                        </div>
                      </div>

                      <div className="col-12 col-sm-6 col-lg-4 d-grid">
                        <button
                          className="btn btn-warning"
                          onClick={handleIncrement}
                        >
                          Apply Increment
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Salary History */}
            {activeTab === "history" && (
              <div className="table-responsive">
                <table className="table table-striped table-bordered align-middle salary-history-table">
                  <thead className="table-light">
                    <tr>
                      <th>Period</th>
                      {salaryFields.map((field) => (
                        <th key={field}>{salaryLabels[field]}</th>
                      ))}
                      <th>Total</th>
                      <th>Updated</th>
                    </tr>
                  </thead>

                  <tbody>
                    {salaryHistory.length === 0 ? (
                      <tr>
                        <td
                          colSpan={salaryFields.length + 3}
                          className="text-center text-muted py-4"
                        >
                          No salary history found
                        </td>
                      </tr>
                    ) : (
                      salaryHistory.map((h, index) => (
                        <tr
                          key={h._id || index}
                          className={index === 0 ? "table-success" : ""}
                        >
                          <td className="fw-semibold">
                            {monthNames[h.month] || h.month} {h.year}
                          </td>
                          {salaryFields.map((field) => (
                            <td key={field}>{formatMoney(h.salary?.[field])}</td>
                          ))}
                          <td className="fw-bold">
                            {formatMoney(getHistoryTotal(h))}
                          </td>
                          <td>{formatDate(h.updatedAt || h.createdAt || h.date)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Increment History */}
            {activeTab === "increment" && (
              <>
                <div className="increment-summary-grid mb-3">
                  <div className="increment-summary-item">
                    <span>Total Increment</span>
                    <strong>{formatMoney(totalIncrementAmount)}</strong>
                  </div>

                  <div className="increment-summary-item">
                    <span>Last Increment</span>
                    <strong>{formatDate(latestIncrementDate)}</strong>
                  </div>

                  <div className="increment-summary-item">
                    <span>Records</span>
                    <strong>{incrementHistory.length}</strong>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-striped table-bordered align-middle increment-history-table">
                    <thead className="table-light">
                      <tr>
                        <th>Date</th>
                        <th className="text-end">Previous Basic</th>
                        <th className="text-end">Increment</th>
                        <th className="text-end">New Basic</th>
                        <th>Remarks</th>
                        <th>Applied By</th>
                      </tr>
                    </thead>

                    <tbody>
                      {incrementHistory.length === 0 ? (
                        <tr>
                          <td
                            colSpan="6"
                            className="text-center text-muted py-4"
                          >
                            No increment history found
                          </td>
                        </tr>
                      ) : (
                        incrementHistory.map((i, index) => {
                          const previousBasic = getPreviousBasic(i);
                          const newBasic = getNewBasic(i);

                          return (
                            <tr
                              key={i._id || index}
                              className={index === 0 ? "table-success" : ""}
                            >
                              <td className="fw-semibold">
                                {formatDate(i.createdAt)}
                              </td>
                              <td className="text-end">
                                {formatOptionalMoney(previousBasic)}
                              </td>
                              <td className="text-end fw-bold text-success">
                                {formatMoney(i.amount)}
                              </td>
                              <td className="text-end fw-semibold">
                                {formatOptionalMoney(newBasic)}
                              </td>
                              <td className="increment-remarks">
                                {i.remarks || "-"}
                              </td>
                              <td>{getAppliedByName(i)}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ManageSalary;
