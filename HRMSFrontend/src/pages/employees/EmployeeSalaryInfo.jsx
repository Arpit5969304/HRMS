import React, { useEffect, useState } from "react";
import "../../assets/styles/EmployeSalary.css";
import "bootstrap/dist/css/bootstrap.min.css";
import API from "../../utils/axios";

function EmployeeSalaryInfo() {

  const [salary, setSalary] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ==============================
     🔥 FETCH DATA
  ============================== */
  const fetchSalaryData = async () => {
    try {
      setLoading(true);

      const [salaryRes, historyRes] = await Promise.all([
        API.get("/salary/my"),
        API.get("/salary/me/history"),
      ]);

      setSalary(salaryRes.data);
      setHistory(historyRes.data);

    } catch (error) {
      console.error("Salary fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaryData();
  }, []);

  /* ==============================
     🔥 FORMAT
  ============================== */
  const formatCurrency = (amount) =>
    `₹${amount?.toLocaleString("en-IN") || 0}`;

  const getMonthName = (month, year) => {
    const date = new Date(year, month - 1);
    return date.toLocaleString("en-IN", { month: "long", year: "numeric" });
  };

  /* ==============================
     🔥 CALCULATIONS
  ============================== */
  const totalCTC = history.reduce((sum, sal) => sum + (sal.totalSalary || 0), 0);

  const totalGross = totalCTC;

  return (
    <div className="container py-4 employee-salary-page">

      <div className="card shadow-sm border-0">

        {/* Header */}
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h4 className="fw-bold text-primary mb-0">
            Employee Salary Information
          </h4>
        </div>

        <div className="card-body">

          {loading ? (
            <p className="text-center">Loading...</p>
          ) : !salary ? (
            <p className="text-center text-muted">
              No salary data available
            </p>
          ) : (
            <>
              {/* Salary Summary */}
              <div className="row mb-4">

                <div className="col-md-4">
                  <div className="card border-0 shadow-sm text-center p-3">
                    <h6 className="text-muted">Basic Salary</h6>
                    <h4 className="fw-bold text-primary">
                      {formatCurrency(salary.basic)}
                    </h4>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card border-0 shadow-sm text-center p-3">
                    <h6 className="text-muted">HRA</h6>
                    <h4 className="fw-bold text-info">
                      {formatCurrency(salary.hra)}
                    </h4>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card border-0 shadow-sm text-center p-3">
                    <h6 className="text-muted">Total Salary</h6>
                    <h4 className="fw-bold text-success">
                      {formatCurrency(salary.totalSalary)}
                    </h4>
                  </div>
                </div>

              </div>

              {/* HISTORY TABLE */}
              <div className="table-responsive">

                <table className="table table-hover align-middle">

                  <thead className="table-light">
                    <tr>
                      <th>Month</th>
                      <th>Total Salary</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>

                    {history.length > 0 ? (
                      history.map((sal, index) => (
                        <tr key={index}>

                          <td className="fw-semibold">
                            {getMonthName(sal.month, sal.year)}
                          </td>

                          <td className="fw-bold text-success">
                            {formatCurrency(sal.totalSalary)}
                          </td>

                          <td>
                            <span className="badge bg-success">
                              Paid
                            </span>
                          </td>

                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center">
                          No salary history found
                        </td>
                      </tr>
                    )}

                  </tbody>

                </table>

              </div>
            </>
          )}

        </div>

      </div>

    </div>
  );
}

export default EmployeeSalaryInfo;