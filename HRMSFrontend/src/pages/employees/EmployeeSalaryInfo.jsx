import React from "react";
import   '../../assets/styles/EmployeSalary.css'
import "bootstrap/dist/css/bootstrap.min.css";

function EmployeeSalaryInfo() {

  // Dummy Employee Data
  const employee = {
    id: 1,
    name: "Kratika Sharma",
    designation: "Dot Net Developer",
    department: "IT",

    salaryHistory: [
      {
        month: "January 2026",
        ctc: 17500,
        addition: 200,
        deduction: 500,
        remarks: "Late coming",
        gross: 17200,
        lastPaid: "05 Feb 2026",
      },
      {
        month: "February 2026",
        ctc: 17500,
        addition: 100,
        deduction: 720,
        remarks: "Leave",
        gross: 16880,
        lastPaid: "05 Mar 2026",
      },
      {
        month: "March 2026",
        ctc: 17500,
        addition: 0,
        deduction: 300,
        remarks: "Half day leave",
        gross: 17200,
        lastPaid: "-",
      },
    ],
  };

  // Salary Calculations
  const totalCTC = employee.salaryHistory.reduce(
    (sum, sal) => sum + sal.ctc,
    0
  );

  const totalDeduction = employee.salaryHistory.reduce(
    (sum, sal) => sum + sal.deduction,
    0
  );

  const totalGross = employee.salaryHistory.reduce(
    (sum, sal) => sum + sal.gross,
    0
  );

  return (
    <div className="container py-4">

      <div className="card shadow-sm border-0">

        {/* Header */}
        <div className="card-header bg-white d-flex justify-content-between align-items-center">

          <h4 className="fw-bold text-primary mb-0">
            Employee Salary Information
          </h4>

          <span className="badge bg-info">
            {employee.department}
          </span>

        </div>

        <div className="card-body">

          {/* Employee Info */}
          <div className="mb-4">

            <h5 className="fw-semibold">
              {employee.name}
            </h5>

            <p className="text-muted mb-0">
              {employee.designation}
            </p>

          </div>

          {/* Salary Summary Cards */}
          <div className="row mb-4">

            <div className="col-md-4">
              <div className="card border-0 shadow-sm text-center p-3">
                <h6 className="text-muted">Total CTC</h6>
                <h4 className="fw-bold text-primary">
                  ₹{totalCTC}
                </h4>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm text-center p-3">
                <h6 className="text-muted">Total Deduction</h6>
                <h4 className="fw-bold text-danger">
                  ₹{totalDeduction}
                </h4>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm text-center p-3">
                <h6 className="text-muted">Total Gross Pay</h6>
                <h4 className="fw-bold text-success">
                  ₹{totalGross}
                </h4>
              </div>
            </div>

          </div>

          {/* Salary Table */}
          <div className="table-responsive">

            <table className="table table-hover align-middle">

              <thead className="table-light">
                <tr>
                  <th>Month</th>
                  <th>CTC</th>
                  <th>Addition</th>
                  <th>Deduction</th>
                  <th>Remarks</th>
                  <th>Gross Pay</th>
                  <th>Last Paid</th>
                </tr>
              </thead>

              <tbody>

                {employee.salaryHistory.map((sal, index) => (
                  <tr key={index}>

                    <td className="fw-semibold">
                      {sal.month}
                    </td>

                    <td>₹{sal.ctc}</td>

                    <td className="text-success">
                      +₹{sal.addition}
                    </td>

                    <td className="text-danger">
                      -₹{sal.deduction}
                    </td>

                    <td>{sal.remarks}</td>

                    <td className="fw-bold text-success">
                      ₹{sal.gross}
                    </td>

                    <td>
                      {sal.lastPaid === "-" ? (
                        <span className="badge bg-warning text-dark">
                          Pending
                        </span>
                      ) : (
                        sal.lastPaid
                      )}
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
}

export default EmployeeSalaryInfo;