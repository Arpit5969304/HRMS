import React, { useMemo, useState } from "react";
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

const getCurrentPeriodValue = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
};

const parsePeriodValue = (value) => {
  const [year, month] = value.split("-").map(Number);
  return { month, year };
};

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

const formatMonthYear = (month, year) =>
  `${monthNames[month] || month} ${year}`;

const getEmployeeName = (employee) =>
  [employee?.firstName, employee?.lastName].filter(Boolean).join(" ") ||
  employee?.employeeId ||
  "Employee";

const getHistoryTotal = (record) => {
  if (record?.totalSalary !== undefined && record?.totalSalary !== null) {
    return Number(record.totalSalary);
  }

  return salaryFields.reduce(
    (total, field) => total + Number(record?.salary?.[field] || 0),
    0,
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

const getPayrollStatusClass = (status) =>
  status === "Paid" ? "is-paid" : "is-pending";

const ManageSalary = () => {
  const { employees } = useEmployees();
  const {
    salaryHistory,
    incrementHistory,
    payrollHistory,
    loading,
    saveSalary,
    applyIncrement,
    getCurrentSalary,
    getSalaryHistory,
    getIncrementHistory,
    getPayrollPreview,
    getAdminPayrollHistory,
    payMonthlySalary,
  } = useSalary();

  const [salary, setSalary] = useState(emptySalary);
  const [searchEmployee, setSearchEmployee] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("structure");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [incrementAmount, setIncrementAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [payrollPeriod, setPayrollPeriod] = useState(getCurrentPeriodValue);
  const [payrollNotes, setPayrollNotes] = useState("");
  const [payrollPreview, setPayrollPreview] = useState(null);

  const departments = useMemo(
    () => [...new Set(employees.map((emp) => emp.department).filter(Boolean))],
    [employees],
  );

  const employeeSuggestions = useMemo(() => {
    const search = searchEmployee.trim().toLowerCase();

    return employees
      .filter((emp) => {
        const matchesDepartment =
          selectedDepartment === "" || emp.department === selectedDepartment;

        if (!matchesDepartment) return false;
        if (!search) return true;

        return (
          getEmployeeName(emp).toLowerCase().includes(search) ||
          emp.employeeId?.toLowerCase().includes(search) ||
          emp.department?.toLowerCase().includes(search) ||
          emp.designation?.toLowerCase().includes(search)
        );
      })
      .slice(0, 8);
  }, [employees, searchEmployee, selectedDepartment]);

  const totalIncrementAmount = useMemo(
    () =>
      incrementHistory.reduce(
        (total, increment) => total + Number(increment.amount || 0),
        0,
      ),
    [incrementHistory],
  );

  const latestIncrementDate = incrementHistory[0]?.createdAt;

  const netSalary = useMemo(
    () =>
      salaryFields.reduce(
        (total, field) => total + Number(salary[field] || 0),
        0,
      ),
    [salary],
  );

  const annualSalary = netSalary * 12;
  const latestPaidPayroll = payrollHistory[0] || null;
  const payrollRate = payrollPreview?.workingDays
    ? Math.round(
        (Number(payrollPreview.payableDays || 0) / payrollPreview.workingDays) *
          100,
      )
    : 0;
  const selectedPeriod = parsePeriodValue(payrollPeriod);

  const loadPayrollPreview = async (
    employeeId = selectedEmployee?._id,
    period = payrollPeriod,
  ) => {
    if (!employeeId) return;

    const { month, year } = parsePeriodValue(period);
    const preview = await getPayrollPreview(employeeId, month, year);
    setPayrollPreview(preview);
  };

  const handlePayrollPeriodChange = async (value) => {
    setPayrollPeriod(value);

    if (!selectedEmployee?._id) return;

    await loadPayrollPreview(selectedEmployee._id, value);
  };

  const selectEmployee = async (employee) => {
    setSelectedEmployee(employee);
    setSearchEmployee(getEmployeeName(employee));
    setShowSuggestions(false);
    setErrors({});
    setPayrollNotes("");

    const { month, year } = parsePeriodValue(payrollPeriod);

    const [currentSalary, , , , preview] = await Promise.all([
      getCurrentSalary(employee._id),
      getSalaryHistory(employee._id),
      getIncrementHistory(employee._id),
      getAdminPayrollHistory(employee._id),
      getPayrollPreview(employee._id, month, year),
    ]);

    setSalary(
      currentSalary
        ? {
            basic: currentSalary.basic ?? "",
            hra: currentSalary.hra ?? "",
            conveyance: currentSalary.conveyance ?? "",
            medical: currentSalary.medical ?? "",
            lta: currentSalary.lta ?? "",
            special: currentSalary.special ?? "",
          }
        : emptySalary,
    );
    setPayrollPreview(preview);
  };

  const validateSalary = () => {
    const nextErrors = {};

    salaryFields.forEach((field) => {
      if (salary[field] === "" || Number(salary[field]) < 0) {
        nextErrors[field] = "Invalid amount";
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSaveSalary = async () => {
    if (!selectedEmployee) {
      alert("Please select employee");
      return;
    }

    if (!validateSalary()) return;

    try {
      const result = await saveSalary(selectedEmployee._id, salary);
      alert(result?.message || "Salary saved successfully");
      await loadPayrollPreview(selectedEmployee._id, payrollPeriod);
    } catch (err) {
      alert(err.response?.data?.message || "Unable to save salary");
    }
  };

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
        remarks,
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
      await loadPayrollPreview(selectedEmployee._id, payrollPeriod);
      alert("Increment applied successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Unable to apply increment");
    }
  };

  const handlePaySalary = async () => {
    if (!selectedEmployee) {
      alert("Select employee first");
      return;
    }

    const { month, year } = parsePeriodValue(payrollPeriod);

    try {
      const result = await payMonthlySalary(
        selectedEmployee._id,
        month,
        year,
        payrollNotes,
      );

      setPayrollPreview(result?.payroll || null);
      setPayrollNotes("");
      await getAdminPayrollHistory(selectedEmployee._id);
      alert(result?.message || "Salary paid successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Unable to pay salary");
    }
  };

  return (
    <div className="salary-admin-page">
      <div className="salary-admin-shell">
        <div className="salary-admin-header">
          <div>
            <h3>Salary & Payroll Management</h3>
            <p>
              Manage salary structure, increments, and monthly payroll from
              real attendance.
            </p>
          </div>
          <div className="salary-period-chip">
            Payroll Period:{" "}
            {formatMonthYear(selectedPeriod.month, selectedPeriod.year)}
          </div>
        </div>

        <div className="salary-toolbar">
          <div className="salary-toolbar-field">
            <label>Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </div>

          <div className="salary-toolbar-field is-search">
            <label>Select Employee</label>
            <div className="salary-search-wrap">
              <input
                type="text"
                value={searchEmployee}
                placeholder="Search by name, employee ID, or department"
                onChange={(e) => {
                  setSearchEmployee(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
              />

              {showSuggestions && employeeSuggestions.length > 0 && (
                <div className="salary-suggestion-list">
                  {employeeSuggestions.map((employee) => (
                    <button
                      key={employee._id}
                      type="button"
                      className="salary-suggestion-item"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        selectEmployee(employee);
                      }}
                    >
                      <strong>{getEmployeeName(employee)}</strong>
                      <span>
                        {employee.employeeId || "-"} - {employee.department || "-"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="salary-toolbar-field">
            <label>Payroll Month</label>
            <input
              type="month"
              value={payrollPeriod}
              onChange={(e) => handlePayrollPeriodChange(e.target.value)}
            />
          </div>
        </div>

        {selectedEmployee ? (
          <>
            <div className="salary-employee-hero">
              <div>
                <span className="hero-kicker">
                  {selectedEmployee.employeeId || "Employee"}
                </span>
                <h4>{getEmployeeName(selectedEmployee)}</h4>
                <p>
                  {selectedEmployee.designation || "Employee"} -{" "}
                  {selectedEmployee.department || "-"}
                </p>
              </div>

              <div className="hero-meta-grid">
                <div>
                  <span>Current Monthly CTC</span>
                  <strong>{formatMoney(netSalary)}</strong>
                </div>
                <div>
                  <span>Annual CTC</span>
                  <strong>{formatMoney(annualSalary)}</strong>
                </div>
                <div>
                  <span>Latest Paid Month</span>
                  <strong>
                    {latestPaidPayroll
                      ? formatMonthYear(
                          latestPaidPayroll.month,
                          latestPaidPayroll.year,
                        )
                      : "-"}
                  </strong>
                </div>
                <div>
                  <span>Total Increment</span>
                  <strong>{formatMoney(totalIncrementAmount)}</strong>
                </div>
              </div>
            </div>

            <div className="salary-tabs">
              <button
                type="button"
                className={activeTab === "structure" ? "active" : ""}
                onClick={() => setActiveTab("structure")}
              >
                Salary Structure
              </button>
              <button
                type="button"
                className={activeTab === "payroll" ? "active" : ""}
                onClick={() => setActiveTab("payroll")}
              >
                Monthly Payroll
              </button>
              <button
                type="button"
                className={activeTab === "history" ? "active" : ""}
                onClick={() => setActiveTab("history")}
              >
                Salary History
              </button>
              <button
                type="button"
                className={activeTab === "increment" ? "active" : ""}
                onClick={() => setActiveTab("increment")}
              >
                Increment History
              </button>
            </div>

            {activeTab === "structure" && (
              <div className="salary-panel">
                <div className="salary-panel-header">
                  <div>
                    <h5>Salary Structure</h5>
                    <p>Update the employee's fixed monthly salary components.</p>
                  </div>
                  <button
                    type="button"
                    className="salary-action-btn is-primary"
                    onClick={handleSaveSalary}
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Salary"}
                  </button>
                </div>

                <div className="salary-form-grid">
                  {salaryFields.map((field) => (
                    <label key={field} className="salary-input-card">
                      <span>{salaryLabels[field]}</span>
                      <input
                        type="number"
                        min="0"
                        value={salary[field]}
                        onChange={(e) =>
                          setSalary((prev) => ({
                            ...prev,
                            [field]: e.target.value,
                          }))
                        }
                      />
                      {errors[field] && (
                        <small className="salary-error">{errors[field]}</small>
                      )}
                    </label>
                  ))}

                  <div className="salary-input-card is-total">
                    <span>Net Salary</span>
                    <strong>{formatMoney(netSalary)}</strong>
                    <small>Auto-calculated from all salary heads</small>
                  </div>
                </div>

                <div className="salary-subpanel">
                  <div className="salary-panel-header compact">
                    <div>
                      <h5>Apply Increment</h5>
                      <p>Increase the employee's basic salary and keep history.</p>
                    </div>
                  </div>

                  <div className="salary-inline-grid">
                    <label className="salary-inline-field">
                      <span>Increment Amount</span>
                      <input
                        type="number"
                        min="0"
                        value={incrementAmount}
                        onChange={(e) => setIncrementAmount(e.target.value)}
                      />
                    </label>

                    <label className="salary-inline-field">
                      <span>Remarks</span>
                      <input
                        type="text"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Promotion, annual revision, etc."
                      />
                    </label>

                    <button
                      type="button"
                      className="salary-action-btn is-warning"
                      onClick={handleIncrement}
                      disabled={loading}
                    >
                      {loading ? "Applying..." : "Apply Increment"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "payroll" && (
              <div className="salary-panel">
                <div className="salary-panel-header">
                  <div>
                    <h5>Monthly Payroll</h5>
                    <p>
                      Salary is auto-calculated from working days, attendance,
                      paid leave, unpaid leave, and half days.
                    </p>
                  </div>

                  <div className="salary-panel-actions">
                    <button
                      type="button"
                      className="salary-action-btn is-secondary"
                      onClick={() => loadPayrollPreview()}
                      disabled={loading}
                    >
                      {loading ? "Calculating..." : "Calculate Payroll"}
                    </button>
                    <button
                      type="button"
                      className="salary-action-btn is-success"
                      onClick={handlePaySalary}
                      disabled={
                        loading ||
                        !payrollPreview ||
                        payrollPreview.paymentStatus === "Paid"
                      }
                    >
                      {payrollPreview?.paymentStatus === "Paid"
                        ? "Already Paid"
                        : "Pay Salary"}
                    </button>
                  </div>
                </div>

                <div className="salary-inline-grid payroll-controls">
                  <label className="salary-inline-field">
                    <span>Payroll Month</span>
                    <input
                      type="month"
                      value={payrollPeriod}
                      onChange={(e) => handlePayrollPeriodChange(e.target.value)}
                    />
                  </label>

                  <label className="salary-inline-field is-wide">
                    <span>Payment Notes</span>
                    <input
                      type="text"
                      value={payrollNotes}
                      onChange={(e) => setPayrollNotes(e.target.value)}
                      placeholder="Optional note for this salary payment"
                    />
                  </label>
                </div>

                {payrollPreview ? (
                  <>
                    <div className="payroll-status-row">
                      <div className="payroll-status-card">
                        <span>Status</span>
                        <strong
                          className={getPayrollStatusClass(
                            payrollPreview.paymentStatus,
                          )}
                        >
                          {payrollPreview.paymentStatus || "Pending"}
                        </strong>
                        <small>
                          {payrollPreview.paymentStatus === "Paid"
                            ? `Paid on ${formatDate(payrollPreview.paidAt)}`
                            : "Not paid yet"}
                        </small>
                      </div>

                      <div className="payroll-status-card">
                        <span>Gross Salary</span>
                        <strong>{formatMoney(payrollPreview.grossSalary)}</strong>
                        <small>Monthly fixed salary structure</small>
                      </div>

                      <div className="payroll-status-card">
                        <span>Deduction</span>
                        <strong>
                          {formatMoney(payrollPreview.deductionAmount)}
                        </strong>
                        <small>
                          {Number(payrollPreview.deductionDays || 0)} unpaid day(s)
                        </small>
                      </div>

                      <div className="payroll-status-card accent">
                        <span>Payable Salary</span>
                        <strong>
                          {formatMoney(payrollPreview.payableSalary)}
                        </strong>
                        <small>{payrollRate}% attendance payout rate</small>
                      </div>
                    </div>

                    <div className="payroll-metrics-grid">
                      <div className="metric-card">
                        <span>Working Days</span>
                        <strong>{payrollPreview.workingDays || 0}</strong>
                      </div>
                      <div className="metric-card">
                        <span>Present</span>
                        <strong>{payrollPreview.presentDays || 0}</strong>
                      </div>
                      <div className="metric-card">
                        <span>Late</span>
                        <strong>{payrollPreview.lateDays || 0}</strong>
                      </div>
                      <div className="metric-card">
                        <span>Half Days</span>
                        <strong>{payrollPreview.halfDays || 0}</strong>
                      </div>
                      <div className="metric-card">
                        <span>Paid Leave</span>
                        <strong>{payrollPreview.paidLeaveDays || 0}</strong>
                      </div>
                      <div className="metric-card">
                        <span>Unpaid Leave</span>
                        <strong>{payrollPreview.unpaidLeaveDays || 0}</strong>
                      </div>
                      <div className="metric-card">
                        <span>Unpaid Attendance</span>
                        <strong>
                          {payrollPreview.unpaidAttendanceDays || 0}
                        </strong>
                      </div>
                      <div className="metric-card">
                        <span>Weekly Offs</span>
                        <strong>{payrollPreview.weeklyOffDays || 0}</strong>
                      </div>
                      <div className="metric-card">
                        <span>Holidays</span>
                        <strong>{payrollPreview.holidayDays || 0}</strong>
                      </div>
                      <div className="metric-card">
                        <span>Per Day Salary</span>
                        <strong>{formatMoney(payrollPreview.perDaySalary)}</strong>
                      </div>
                      <div className="metric-card">
                        <span>Payable Days</span>
                        <strong>{payrollPreview.payableDays || 0}</strong>
                      </div>
                      <div className="metric-card">
                        <span>Absent</span>
                        <strong>{payrollPreview.absentDays || 0}</strong>
                      </div>
                    </div>

                    {payrollPreview.notes && (
                      <div className="salary-callout">
                        <strong>Payment Note:</strong> {payrollPreview.notes}
                      </div>
                    )}

                    <div className="table-responsive salary-table-wrap">
                      <table className="table salary-data-table align-middle">
                        <thead>
                          <tr>
                            <th>Period</th>
                            <th>Status</th>
                            <th>Gross</th>
                            <th>Deduction</th>
                            <th>Payable</th>
                            <th>Paid On</th>
                            <th>Paid By</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payrollHistory.length === 0 ? (
                            <tr>
                              <td
                                colSpan="7"
                                className="text-center text-muted py-4"
                              >
                                No payroll payments recorded yet
                              </td>
                            </tr>
                          ) : (
                            payrollHistory.map((record) => (
                              <tr key={record._id}>
                                <td className="fw-semibold">
                                  {formatMonthYear(record.month, record.year)}
                                </td>
                                <td>
                                  <span
                                    className={`status-chip ${getPayrollStatusClass(
                                      record.paymentStatus,
                                    )}`}
                                  >
                                    {record.paymentStatus}
                                  </span>
                                </td>
                                <td>{formatMoney(record.grossSalary)}</td>
                                <td>{formatMoney(record.deductionAmount)}</td>
                                <td className="fw-bold">
                                  {formatMoney(record.payableSalary)}
                                </td>
                                <td>{formatDate(record.paidAt)}</td>
                                <td>{record.paidBy?.name || "-"}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="salary-empty-state">
                    Save salary structure first, then calculate payroll for the
                    selected month.
                  </div>
                )}
              </div>
            )}

            {activeTab === "history" && (
              <div className="salary-panel">
                <div className="salary-panel-header compact">
                  <div>
                    <h5>Salary History</h5>
                    <p>Monthly snapshots of salary structure changes.</p>
                  </div>
                </div>

                <div className="table-responsive salary-table-wrap">
                  <table className="table salary-data-table align-middle">
                    <thead>
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
                        salaryHistory.map((record, index) => (
                          <tr key={record._id || index}>
                            <td className="fw-semibold">
                              {formatMonthYear(record.month, record.year)}
                            </td>
                            {salaryFields.map((field) => (
                              <td key={field}>
                                {formatMoney(record.salary?.[field])}
                              </td>
                            ))}
                            <td className="fw-bold">
                              {formatMoney(getHistoryTotal(record))}
                            </td>
                            <td>
                              {formatDate(record.updatedAt || record.createdAt)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "increment" && (
              <div className="salary-panel">
                <div className="increment-summary-grid">
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

                <div className="table-responsive salary-table-wrap">
                  <table className="table salary-data-table align-middle">
                    <thead>
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
                        incrementHistory.map((increment, index) => (
                          <tr key={increment._id || index}>
                            <td className="fw-semibold">
                              {formatDate(increment.createdAt)}
                            </td>
                            <td className="text-end">
                              {formatOptionalMoney(getPreviousBasic(increment))}
                            </td>
                            <td className="text-end fw-bold text-success">
                              {formatMoney(increment.amount)}
                            </td>
                            <td className="text-end fw-semibold">
                              {formatOptionalMoney(getNewBasic(increment))}
                            </td>
                            <td className="increment-remarks">
                              {increment.remarks || "-"}
                            </td>
                            <td>{getAppliedByName(increment)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="salary-empty-state">
            Search and select an employee to manage salary and payroll.
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageSalary;
