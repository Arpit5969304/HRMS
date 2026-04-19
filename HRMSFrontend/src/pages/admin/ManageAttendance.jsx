import React, { useState, useEffect } from "react";
import "../../assets/styles/ManageAttendance.css";
import "bootstrap/dist/css/bootstrap.min.css";
export default function ManageAttendance() {
  const [viewType, setViewType] = useState("summary");
  const [monthYear, setMonthYear] = useState("2026-01");
  const [filteredData, setFilteredData] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const dayWiseData = [
    {
      id: 1,
      name: "Amit Sharma",
      attendance: ["2026-01-01", "2026-01-03", "2026-01-05"],
    },
    { id: 2, name: "Priya Sharma", attendance: ["2026-01-02", "2026-01-04"] },
    { id: 3, name: "Ravi Mehta", attendance: ["2026-01-01", "2026-01-06"] },
  ];

  const summaryData = [
    {
      id: 1,
      name: "Amit Sharma fgdsgdsafsdf",
      department: "IT",
      sick: 1,
      unpaid: 0,
      half: 0,
      openRequest: 0,
      noData: 1,
    },
    {
      id: 2,
      name: "Priya Sharma",
      department: "HR",
      sick: 2,
      unpaid: 1,
      half: 0,
      openRequest: 0,
      noData: 1,
    },
    {
      id: 3,
      name: "Ravi Mehta",
      department: "Finance",
      sick: 0,
      unpaid: 0,
      half: 1,
      openRequest: 0,
      noData: 1,
    },
    {
      id: 4,
      name: "Arpit Chaudhary",
      department: "IT",
      sick: 0,
      unpaid: 0,
      half: 1,
      openRequest: 0,
      noData: 1,
    },
  ];

  const openingBalanceData = [
    { id: 1, name: "Amit Sharma", unpaid: 2, sick: 5 },
    { id: 2, name: "Priya Sharma", unpaid: 1, sick: 3 },
    { id: 3, name: "Ravi Mehta", unpaid: 0, sick: 4 },
  ];

  const getAttendanceMap = (attendance) => {
    const map = new Map();
    attendance?.forEach((date) => map.set(date, true));
    return map;
  };

  const getDaysInMonth = (yearMonth) => {
    const [year, month] = yearMonth.split("-");
    const days = new Date(year, month, 0).getDate();
    const dates = [];
    for (let i = 1; i <= days; i++) {
      const day = i.toString().padStart(2, "0");
      dates.push(`${year}-${month}-${day}`);
    }
    return dates;
  };

  const monthDates = getDaysInMonth(monthYear);

  useEffect(() => {
    if (viewType === "summary") {
      let data = summaryData;

      if (selectedDepartment) {
        data = data.filter((emp) => emp.department === selectedDepartment);
      }

      if (selectedEmployee) {
        data = data.filter((emp) => emp.id === Number(selectedEmployee));
      }

      if (searchTerm) {
        data = data.filter((emp) =>
          emp.name.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      }

      setFilteredData(data);
    } else if (viewType === "daywise") {
      if (selectedEmployee) {
        const emp = dayWiseData.find((e) => e.id === Number(selectedEmployee));
        setFilteredData(emp ? [emp] : []);
      } else {
        setFilteredData(dayWiseData);
      }
    } else if (viewType === "opening") {
      let data = openingBalanceData;

      if (selectedEmployee) {
        data = data.filter((emp) => emp.id === Number(selectedEmployee));
      }

      setFilteredData(data);
    }
  }, [viewType, selectedDepartment, selectedEmployee, searchTerm]);

  const departments = [...new Set(summaryData.map((emp) => emp.department))];

  return (
    <div className="att-page">
      <div className="att-card">
        <div className="att-header">
          <h4>Manage Attendance</h4>
          <p>Monitor employee attendance and leave records</p>
        </div>

        {/* FILTER */}
        <div className="att-filter-bar">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map((dept, i) => (
              <option key={i} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
          >
            <option value="">All Employees</option>
            {summaryData
              .filter(
                (emp) =>
                  selectedDepartment === "" ||
                  emp.department === selectedDepartment,
              )
              .map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
          </select>

          <input
            type="text"
            placeholder="Search employee..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            value={viewType}
            onChange={(e) => {
              setViewType(e.target.value);
              setFilteredData([]);
            }}
          >
            <option value="summary">Summary</option>
            <option value="daywise">Day Wise Attendance</option>
            <option value="opening">Leave Opening Balance</option>
          </select>

          <input
            type="month"
            value={monthYear}
            onChange={(e) => setMonthYear(e.target.value)}
          />
        </div>

        {/* SUMMARY */}
        {viewType === "summary" && filteredData.length > 0 && (
          <>
            <div className="att-kpi-row">
              <div className="att-kpi-card success">
                <h6>Total Employees</h6>
                <h3>{filteredData.length}</h3>
              </div>

              <div className="att-kpi-card warning">
                <h6>Total Sick Leave</h6>
                <h3>{filteredData.reduce((a, b) => a + b.sick, 0)}</h3>
              </div>

              <div className="att-kpi-card danger">
                <h6>Total Unpaid</h6>
                <h3>{filteredData.reduce((a, b) => a + b.unpaid, 0)}</h3>
              </div>
            </div>
            <div className="att-table-wrapper">
              <div className="att-table-scroll">
                <table className="table att-modern-table text-nowrap">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Employee</th>
                      <th>Sick</th>
                      <th>Unpaid</th>
                      <th>Half</th>
                      <th>Open</th>
                      <th>No Data</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredData.map((emp) => (
                      <tr key={emp.id}>
                        <td>{emp.id}</td>
                        <td className=" att-emp-name">
                          {emp.name.length > 20
                            ? emp.name.slice(0, 20) + "..."
                            : emp.name}
                        </td>
                        <td>
                          <span className="badge success">{emp.sick}</span>
                        </td>
                        <td>
                          <span className="badge danger">{emp.unpaid}</span>
                        </td>
                        <td>{emp.half}</td>
                        <td>{emp.openRequest}</td>
                        <td>{emp.noData}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* DAYWISE */}
        {viewType === "daywise" && filteredData.length > 0 && (
          <div className="att-table-wrapper">
            <div className="att-table-scroll responsive-daywise">
              <table className="att-modern-table att-daywise-table text-nowrap">
                <thead className="att-sticky-header">
                  <tr>
                    <th className="att-sticky-col">Employee</th>

                    {monthDates.map((date, i) => (
                      <th key={i}>{new Date(date).getDate()}</th>
                    ))}

                    <th>Total P</th>
                    <th>Total A</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredData.map((emp) => {
                    let totalP = 0;
                    let totalA = 0;
                    const map = getAttendanceMap(emp.attendance);

                    return (
                      <tr key={emp.id}>
                        <td className="att-sticky-col att-emp-name">
                          {emp.name}
                        </td>

                        {monthDates.map((date, i) => {
                          let status =
                            new Date(date) > new Date()
                              ? "NA"
                              : map.has(date)
                                ? "P"
                                : "A";

                          if (status === "P") totalP++;
                          if (status === "A") totalA++;

                          return (
                            <td key={i}>
                              <span
                                className={`badge ${status === "P" ? "success" : status === "A" ? "danger" : "secondary"}`}
                              >
                                {status}
                              </span>
                            </td>
                          );
                        })}

                        <td>{totalP}</td>
                        <td>{totalA}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* OPENING */}
        {viewType === "opening" && filteredData.length > 0 && (
          <div className="att-table-wrapper">
            <div className="att-table-scroll">
              <table className="table att-modern-table ">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Employee</th>
                    <th>Unpaid</th>
                    <th>Sick</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredData.map((emp) => (
                    <tr key={emp.id}>
                      <td>{emp.id}</td>
                      <td className="att-emp-name">{emp.name}</td>
                      <td>{emp.unpaid}</td>
                      <td>{emp.sick}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredData.length === 0 && (
          <div className="att-empty-state">
            Click Apply to load attendance data
          </div>
        )}
      </div>
    </div>
  );
}
