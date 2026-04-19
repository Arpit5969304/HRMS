import React, { useState } from "react";
import "../../assets/styles/ManageSalary.css";

const ManageSalary = () => {
  // Demo Employee Data
  const [employees, setEmployees] = useState([
    {
      id: 1,
      name: "Rahul Sharma",
      department: "IT",
      salary: {
        basic: 15000,
        hra: 7000,
        conveyance: 1000,
        medical: 1200,
        lta: 900,
        special: 3500,
      },
    },
    {
      id: 2,
      name: "Priya Verma",
      department: "HR",
      salary: {
        basic: 18000,
        hra: 8000,
        conveyance: 1200,
        medical: 1500,
        lta: 1000,
        special: 4000,
      },
    },
    {
      id: 3,
      name: "Amit Singh",
      department: "Finance",
      salary: {
        basic: 20000,
        hra: 9000,
        conveyance: 1500,
        medical: 1800,
        lta: 1200,
        special: 4500,
      },
    },
  ]);

  const [salary, setSalary] = useState({
    basic: 12000,
    hra: 6000,
    conveyance: 800,
    medical: 1250,
    lta: 750,
    special: 3200,
  });

  const [searchEmployee, setSearchEmployee] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [errors, setErrors] = useState({});
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("salary");
  const [incrementHistory, setIncrementHistory] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const departments = [...new Set(employees.map((emp) => emp.department))];

  const [incrementAmount, setIncrementAmount] = useState("");
  const [remarks, setRemarks] = useState("");

  const netSalary =
    Number(salary.basic) +
    Number(salary.hra) +
    Number(salary.conveyance) +
    Number(salary.medical) +
    Number(salary.lta) +
    Number(salary.special);

  const handleChange = (field, value) => {
    setSalary({ ...salary, [field]: value });
  };

  // Search employee
  const handleEmployeeSearch = (value) => {
    setSearchEmployee(value);

    const search = value.toLowerCase();

    const results = employees.filter((emp) => {
      const matchesDepartment =
        !selectedDepartment || emp.department === selectedDepartment;

      const matchesSearch =
        emp.name.toLowerCase().includes(search) ||
        emp.department.toLowerCase().includes(search) ||
        emp.id.toString().includes(search);

      return matchesDepartment && matchesSearch;
    });

    setFilteredEmployees(results);
  };

  // Select employee from dropdown
  const selectEmployee = (emp) => {
    setSearchEmployee(emp.name);
    setSelectedEmployeeId(emp.id);
    setSalary({ ...emp.salary });
    setFilteredEmployees([]);
  };

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

  const handleSaveSalary = () => {
    if (!selectedEmployeeId) {
      alert("Please select employee");
      return;
    }

    if (!validateSalary()) return;

    const historyRecord = {
      employeeId: selectedEmployeeId,
      salary: { ...salary },
      date: new Date().toLocaleDateString(),
    };

    setSalaryHistory((prev) => [...prev, historyRecord]);
    const updatedEmployees = employees.map((emp) =>
      emp.id === selectedEmployeeId ? { ...emp, salary: { ...salary } } : emp,
    );

    setEmployees(updatedEmployees);

    alert("Salary updated successfully");
  };

  const handleIncrement = () => {
    if (!selectedEmployeeId) {
      alert("Select employee first");
      return;
    }

    if (!incrementAmount || Number(incrementAmount) <= 0) {
      alert("Enter valid increment amount");
      return;
    }

    const updatedBasic = Number(salary.basic) + Number(incrementAmount);

    const updatedSalary = {
      ...salary,
      basic: updatedBasic,
    };

    setSalary(updatedSalary);

    const record = {
      employeeId: selectedEmployeeId,
      amount: incrementAmount,
      remarks: remarks,
      date: new Date().toLocaleDateString(),
    };

    setIncrementHistory((prev) => [...prev, record]);
    setIncrementAmount("");
    setRemarks("");
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
                    onChange={(e) => handleEmployeeSearch(e.target.value)}
                  />

                  {filteredEmployees.length > 0 && (
                    <ul className="list-group position-absolute w-100 shadow">
                      {filteredEmployees.map((emp) => (
                        <li
                          key={emp.id}
                          className="list-group-item list-group-item-action"
                          onClick={() => selectEmployee(emp)}
                        >
                          <div className="d-flex justify-content-between">
                            <span>{emp.name}</span>
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

              <div className="col-12 col-sm-6 col-lg-4">
                <label className="form-label fw-semibold">Monthly Salary</label>

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

            {/* Salary Structure */}

            {activeTab === "salary" && (
              <>
                <div className="row g-3">
                  {Object.keys(salary).map((key) => (
                    <div className="col-12 col-sm-6 col-lg-4" key={key}>
                      {/* Compact Input */}
                      <div className="input-group-m">
                        <span className="input-addon text-capitalize">
                          {key}
                        </span>

                        <input
                          type="number"
                          className="custom-input"
                          value={salary[key]}
                          onChange={(e) => handleChange(key, e.target.value)}
                        />
                      </div>

                      {/* Error SAME */}
                      {errors[key] && (
                        <small className="text-danger">{errors[key]}</small>
                      )}
                    </div>
                  ))}

                  <div className="col-12 col-sm-6 col-lg-4">
                    <label className="form-label fw-semibold">Net Salary</label>

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

                {/* Increment Section */}

                <div className="card  border-0 bg-light">
                  <div className="card-body">
                    <h6 className="fw-bold mb-3">Apply Increment</h6>

                    <div className="row g-3 align-items-end">
                      {/* Increment Amount */}
                      <div className="col-12 col-sm-6 col-lg-4">

                        <div className="input-group-m">
                          <span className="input-addon">Increment</span>

                          <input
                            type="number"
                            className="custom-input"
                            value={incrementAmount}
                            onChange={(e) => setIncrementAmount(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Remarks */}
                      <div className="col-12 col-sm-6 col-lg-4">

                        <div className="input-group-m">
                          <span className="input-addon">Remarks</span>

                          <input
                            type="text"
                            name="remarks"
                            className="custom-input"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                          />
                        </div>

                        {errors?.remarks && (
                          <small className="error">{errors.remarks}</small>
                        )}
                      </div>

                      {/* Button */}
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
                <table className="table table-striped table-bordered">
                  <thead className="table-light">
                    <tr>
                      <th>Date</th>
                      <th>Basic</th>
                      <th>HRA</th>
                      <th>Conveyance</th>
                      <th>Medical</th>
                      <th>LTA</th>
                      <th>Special</th>
                    </tr>
                  </thead>

                  <tbody>
                    {salaryHistory
                      .filter((h) => h.employeeId === selectedEmployeeId)
                      .map((h, index) => (
                        <tr key={index}>
                          <td>{h.date}</td>
                          <td>{h.salary.basic}</td>
                          <td>{h.salary.hra}</td>
                          <td>{h.salary.conveyance}</td>
                          <td>{h.salary.medical}</td>
                          <td>{h.salary.lta}</td>
                          <td>{h.salary.special}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Increment History */}

            {activeTab === "increment" && (
              <div className="table-responsive">
                <table className="table table-striped table-bordered">
                  <thead className="table-light">
                    <tr>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>

                  <tbody>
                    {incrementHistory
                      .filter((i) => i.employeeId === selectedEmployeeId)
                      .map((i, index) => (
                        <tr key={index}>
                          <td>{i.date}</td>
                          <td>₹ {i.amount}</td>
                          <td>{i.remarks}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ManageSalary;
