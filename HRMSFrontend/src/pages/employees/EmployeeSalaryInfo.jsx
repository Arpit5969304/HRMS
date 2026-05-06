import React, { useEffect, useState } from "react";
import "../../assets/styles/EmployeSalary.css";
import "bootstrap/dist/css/bootstrap.min.css";
import useSalary from "../../hooks/useSalary";

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

const salaryFields = ["basic", "hra", "conveyance", "medical", "lta", "special"];

const salaryLabels = {
  basic: "Basic",
  hra: "HRA",
  conveyance: "Conveyance",
  medical: "Medical",
  lta: "LTA",
  special: "Special",
};

const getCurrentPeriodValue = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
};

const parsePeriodValue = (value) => {
  const [year, month] = value.split("-").map(Number);
  return { month, year };
};

const formatCurrency = (amount) =>
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

const getPayrollStatusClass = (status) =>
  status === "Paid" ? "is-paid" : "is-pending";

const EmployeeSalaryInfo = () => {
  const {
    payrollHistory,
    loading,
    getMySalaryData,
    getMyPayrollPreview,
    getMyPayrollHistory,
  } = useSalary();

  const [salary, setSalary] = useState(null);
  const [payrollPreview, setPayrollPreview] = useState(null);
  const [payrollPeriod, setPayrollPeriod] = useState(getCurrentPeriodValue);

  const selectedPeriod = parsePeriodValue(payrollPeriod);

  const loadPayrollPreview = async (period = payrollPeriod) => {
    const { month, year } = parsePeriodValue(period);
    const preview = await getMyPayrollPreview(month, year);
    setPayrollPreview(preview);
  };

  useEffect(() => {
    let active = true;

    const loadInitialData = async () => {
      const { month, year } = parsePeriodValue(payrollPeriod);
      const [salaryData, preview] = await Promise.all([
        getMySalaryData(),
        getMyPayrollPreview(month, year),
        getMyPayrollHistory(),
      ]);

      if (!active) return;

      setSalary(salaryData);
      setPayrollPreview(preview);
    };

    loadInitialData();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const annualSalary = Number(salary?.totalSalary || 0) * 12;
  const payrollRate = payrollPreview?.workingDays
    ? Math.round(
        (Number(payrollPreview.payableDays || 0) / payrollPreview.workingDays) *
          100,
      )
    : 0;
  const latestPaidPayroll = payrollHistory[0] || null;

  return (
    <div className="employee-payroll-page">
      <div className="employee-payroll-shell">
        <div className="employee-payroll-header">
          <div>
            <h3>Salary & Payroll</h3>
            <p>
              View your salary structure, estimated monthly payout, and salary
              payment history.
            </p>
          </div>

          <div className="employee-payroll-period">
            Payroll Month:{" "}
            {formatMonthYear(selectedPeriod.month, selectedPeriod.year)}
          </div>
        </div>

        {loading && !salary && (
          <div className="employee-payroll-empty">Loading salary details...</div>
        )}

        {!loading && !salary && (
          <div className="employee-payroll-empty">
            No salary structure is available yet.
          </div>
        )}

        {salary && (
          <>
            <div className="employee-salary-summary">
              <div className="summary-card accent">
                <span>Monthly Salary</span>
                <strong>{formatCurrency(salary.totalSalary)}</strong>
                <small>Current fixed monthly salary</small>
              </div>
              <div className="summary-card">
                <span>Annual CTC</span>
                <strong>{formatCurrency(annualSalary)}</strong>
                <small>Monthly salary x 12 months</small>
              </div>
              <div className="summary-card">
                <span>Estimated Payout</span>
                <strong>
                  {formatCurrency(payrollPreview?.payableSalary || 0)}
                </strong>
                <small>
                  {payrollPreview?.paymentStatus === "Paid"
                    ? "This month is already paid"
                    : "Auto-calculated from attendance"}
                </small>
              </div>
              <div className="summary-card">
                <span>Latest Paid Month</span>
                <strong>
                  {latestPaidPayroll
                    ? formatMonthYear(
                        latestPaidPayroll.month,
                        latestPaidPayroll.year,
                      )
                    : "-"}
                </strong>
                <small>
                  {latestPaidPayroll
                    ? `Paid on ${formatDate(latestPaidPayroll.paidAt)}`
                    : "No payroll payment yet"}
                </small>
              </div>
            </div>

            <div className="employee-salary-grid">
              {salaryFields.map((field) => (
                <div key={field} className="salary-breakdown-card">
                  <span>{salaryLabels[field]}</span>
                  <strong>{formatCurrency(salary[field])}</strong>
                </div>
              ))}
            </div>

            <div className="employee-payroll-card">
              <div className="employee-payroll-card-header">
                <div>
                  <h5>Monthly Payroll Preview</h5>
                  <p>
                    This payout changes automatically based on your monthly
                    attendance, paid leave, unpaid leave, and half days.
                  </p>
                </div>

                <div className="employee-payroll-actions">
                  <input
                    type="month"
                    value={payrollPeriod}
                    onChange={async (e) => {
                      setPayrollPeriod(e.target.value);
                      await loadPayrollPreview(e.target.value);
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => loadPayrollPreview()}
                    disabled={loading}
                  >
                    Refresh
                  </button>
                </div>
              </div>

              {payrollPreview ? (
                <>
                  <div className="employee-payroll-status-row">
                    <div className="status-box">
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
                          : "Awaiting payment from admin"}
                      </small>
                    </div>

                    <div className="status-box">
                      <span>Gross Salary</span>
                      <strong>{formatCurrency(payrollPreview.grossSalary)}</strong>
                      <small>Fixed monthly salary</small>
                    </div>

                    <div className="status-box">
                      <span>Deduction</span>
                      <strong>
                        {formatCurrency(payrollPreview.deductionAmount)}
                      </strong>
                      <small>
                        {Number(payrollPreview.deductionDays || 0)} unpaid day(s)
                      </small>
                    </div>

                    <div className="status-box accent">
                      <span>Payable Salary</span>
                      <strong>
                        {formatCurrency(payrollPreview.payableSalary)}
                      </strong>
                      <small>{payrollRate}% attendance payout rate</small>
                    </div>
                  </div>

                  <div className="employee-payroll-metrics">
                    <div className="metric-box">
                      <span>Working Days</span>
                      <strong>{payrollPreview.workingDays || 0}</strong>
                    </div>
                    <div className="metric-box">
                      <span>Present</span>
                      <strong>{payrollPreview.presentDays || 0}</strong>
                    </div>
                    <div className="metric-box">
                      <span>Late</span>
                      <strong>{payrollPreview.lateDays || 0}</strong>
                    </div>
                    <div className="metric-box">
                      <span>Half Days</span>
                      <strong>{payrollPreview.halfDays || 0}</strong>
                    </div>
                    <div className="metric-box">
                      <span>Paid Leave</span>
                      <strong>{payrollPreview.paidLeaveDays || 0}</strong>
                    </div>
                    <div className="metric-box">
                      <span>Unpaid Leave</span>
                      <strong>{payrollPreview.unpaidLeaveDays || 0}</strong>
                    </div>
                    <div className="metric-box">
                      <span>Unpaid Attendance</span>
                      <strong>{payrollPreview.unpaidAttendanceDays || 0}</strong>
                    </div>
                    <div className="metric-box">
                      <span>Weekly Offs</span>
                      <strong>{payrollPreview.weeklyOffDays || 0}</strong>
                    </div>
                  </div>

                  {payrollPreview.notes && (
                    <div className="employee-payroll-note">
                      <strong>Payment Note:</strong> {payrollPreview.notes}
                    </div>
                  )}
                </>
              ) : (
                <div className="employee-payroll-empty">
                  Payroll preview is not available for this month yet.
                </div>
              )}
            </div>

            <div className="employee-payroll-card">
              <div className="employee-payroll-card-header">
                <div>
                  <h5>Payroll History</h5>
                  <p>Every paid salary month is listed below.</p>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table employee-payroll-table align-middle">
                  <thead>
                    <tr>
                      <th>Period</th>
                      <th>Status</th>
                      <th>Gross</th>
                      <th>Deduction</th>
                      <th>Payable</th>
                      <th>Paid On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrollHistory.length > 0 ? (
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
                          <td>{formatCurrency(record.grossSalary)}</td>
                          <td>{formatCurrency(record.deductionAmount)}</td>
                          <td className="fw-bold">
                            {formatCurrency(record.payableSalary)}
                          </td>
                          <td>{formatDate(record.paidAt)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center">
                          No salary payment history found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmployeeSalaryInfo;
