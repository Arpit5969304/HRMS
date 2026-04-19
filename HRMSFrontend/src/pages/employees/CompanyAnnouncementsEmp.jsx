import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const CompanyAnnouncementsEmp = () => {

  // Demo Logged-in Employee
  const employeeDepartment = "IT";

  const [announcements] = useState([
    {
      id: 1,
      title: "Office Holiday",
      message: "Office will remain closed on 26 January.",
      department: "All",
      priority: "High",
      date: "20 Jan 2026",
      expiryDate: "2026-01-26"
    },
    {
      id: 2,
      title: "New HR Policy",
      message: "New leave policy has been updated. Please review it.",
      department: "HR",
      priority: "Medium",
      date: "10 March 2026",
      expiryDate: "2026-12-31"
    },
    {
      id: 3,
      title: "Server Maintenance",
      message: "System maintenance scheduled tonight from 10 PM.",
      department: "IT",
      priority: "Normal",
      date: "15 March 2026",
      expiryDate: "2026-03-20"
    }
  ]);

  // Filter announcements for employee department + expiry
  const today = new Date();

  const visibleAnnouncements = announcements.filter((a) => {
    const expiry = new Date(a.expiryDate);

    const departmentMatch =
      a.department === "All" || a.department === employeeDepartment;

    return departmentMatch && expiry >= today;
  });

  return (
    <div className="container py-4">

      <div className="card shadow-sm border-0">

        <div className="card-header bg-white">
          <h5 className="mb-0 fw-bold text-primary">
            Company Announcements
          </h5>
        </div>

        <div className="card-body">

          {visibleAnnouncements.length > 0 ? (
            <div className="row g-3">

              {visibleAnnouncements.map((item) => (

                <div key={item.id} className="col-md-6">

                  <div className="card border-0 shadow-sm h-100">

                    <div className="card-body">

                      <div className="d-flex justify-content-between align-items-center mb-2">

                        <h6 className="fw-bold mb-0">
                          {item.title}
                        </h6>

                        <span
                          className={`badge ${
                            item.priority === "High"
                              ? "bg-danger"
                              : item.priority === "Medium"
                              ? "bg-warning text-dark"
                              : "bg-secondary"
                          }`}
                        >
                          {item.priority}
                        </span>

                      </div>

                      <p className="text-muted mb-2">
                        {item.message}
                      </p>

                      <small className="text-secondary">
                        📅 {item.date}
                      </small>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          ) : (

            <div className="text-center text-muted py-4">
              No announcements available
            </div>

          )}

        </div>

      </div>

    </div>
  );
};

export default CompanyAnnouncementsEmp;