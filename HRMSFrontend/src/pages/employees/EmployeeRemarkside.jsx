import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../assets/styles/EmployeeRemarks.css";
import axios from "axios";

const EmployeeRemarkside = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔥 Replace with logged-in employeeId
  const employeeId = "EMPC39932";

  // ✅ FETCH DATA

  useEffect(() => {
    const dummyData = [
      {
        _id: "1",
        date: "2026-02-27",
        checkIn: "2026-02-27T08:32:00",
        checkOut: "2026-02-27T14:28:00",
        remark: "Test remark",
        approved: false,
      },
      {
        _id: "2",
        date: "2026-02-28",
        checkIn: "2026-02-28T09:00:00",
        checkOut: "2026-02-28T17:00:00",
        remark: "On time",
        approved: true,
      },
    ];

    setData(dummyData);
  }, []);

  return (
    <div className="container py-3 py-md-5">
      <div className="card shadow-sm border-0 employee-card">
        {/* Header */}
        <div className="card-header bg-primary text-white fw-semibold">
          My Attendance & Remarks
        </div>

        {/* Table */}
        <div className="table-responsive mt-3">
          <table className="table align-middle employee-table text-nowrap">
            <thead>
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Remark</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((item) => (
                  <tr key={item._id}>
                    <td>{new Date(item.date).toLocaleDateString()}</td>

                    <td className="text-success fw-semibold">
                      {item.checkIn
                        ? new Date(item.checkIn).toLocaleTimeString()
                        : "-"}
                    </td>

                    <td className="text-danger fw-semibold">
                      {item.checkOut
                        ? new Date(item.checkOut).toLocaleTimeString()
                        : "-"}
                    </td>

                    <td>
                      {item.remark || (
                        <span className="text-muted">No remark</span>
                      )}
                    </td>

                    <td>
                      <span
                        className={`badge ${
                          item.approved ? "bg-success" : "bg-warning text-dark"
                        }`}
                      >
                        {item.approved ? "Approved" : "Pending"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeRemarkside;
