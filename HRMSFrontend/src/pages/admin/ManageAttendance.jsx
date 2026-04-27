import React, { useMemo, useState } from "react";
import "../../assets/styles/ManageAttendance.css";
import "bootstrap/dist/css/bootstrap.min.css";
import useDashboard from "../../hooks/useDashboard";

const getEmployeeName = (emp) =>
  [emp?.firstName, emp?.lastName].filter(Boolean).join(" ") ||
  emp?.name ||
  emp?.employeeId ||
  "Employee";

const getRelatedEmployeeId = (employee) =>
  typeof employee === "object"
    ? employee?._id || employee?.id || employee?.employeeId
    : employee;

const formatDateKey = (date) => {
  if (!date) return "";

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "";

  return parsedDate.toISOString().slice(0, 10);
};

const isInMonth = (date, yearMonth) => formatDateKey(date).startsWith(yearMonth);

const isLeaveInMonth = (leave, yearMonth) => {
  const [year, month] = yearMonth.split("-").map(Number);
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);
  const fromDate = new Date(leave.fromDate);
  const toDate = new Date(leave.toDate);

  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    return false;
  }

  return fromDate <= monthEnd && toDate >= monthStart;
};

const getLeaveDays = (leave) => {
  if (leave.totalDays !== undefined && leave.totalDays !== null) {
    return Number(leave.totalDays) || 0;
  }

  const fromDate = new Date(leave.fromDate);
  const toDate = new Date(leave.toDate);

  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    return 0;
  }

  const diff = toDate - fromDate;
  return Math.max(0, diff / (1000 * 60 * 60 * 24) + 1);
};

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

export default function ManageAttendance() {
  const { data, loading } = useDashboard();
  const [viewType, setViewType] = useState("summary");
  const [monthYear, setMonthYear] = useState("2026-01");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentDateKey] = useState(() => formatDateKey(new Date()));

  const monthDates = useMemo(() => getDaysInMonth(monthYear), [monthYear]);

  const employees = useMemo(
    () =>
      (data.employees || []).map((emp, index) => ({
        id: emp._id || emp.id || emp.employeeId || String(index),
        displayId: emp.employeeId || index + 1,
        name: getEmployeeName(emp),
        department: emp.department || "-",
      })),
    [data.employees],
  );

  const attendanceByEmployee = useMemo(() => {
    const map = new Map();

    (data.attendance || []).forEach((att) => {
      const employeeId = getRelatedEmployeeId(att.employee);
      if (!employeeId) return;

      if (!map.has(employeeId)) {
        map.set(employeeId, []);
      }

      map.get(employeeId).push(att);
    });

    return map;
  }, [data.attendance]);

  const leavesByEmployee = useMemo(() => {
    const map = new Map();

    (data.leaves || []).forEach((leave) => {
      const employeeId = getRelatedEmployeeId(leave.employee);
      if (!employeeId) return;

      if (!map.has(employeeId)) {
        map.set(employeeId, []);
      }

      map.get(employeeId).push(leave);
    });

    return map;
  }, [data.leaves]);

  const summaryData = useMemo(
    () =>
      employees.map((emp) => {
        const employeeAttendance = attendanceByEmployee.get(emp.id) || [];
        const employeeLeaves = leavesByEmployee.get(emp.id) || [];
        const monthAttendance = employeeAttendance.filter((att) =>
          isInMonth(att.date, monthYear),
        );
        const monthLeaves = employeeLeaves.filter((leave) =>
          isLeaveInMonth(leave, monthYear),
        );
        const attendanceDateSet = new Set(
          monthAttendance.map((att) => formatDateKey(att.date)),
        );
        const pastMonthDates = monthDates.filter(
          (date) => date <= currentDateKey,
        );
        const approvedLeaves = monthLeaves.filter(
          (leave) => leave.status === "Approved",
        );
        const sumLeaveDays = (leaveType) =>
          approvedLeaves
            .filter((leave) => leave.leaveType === leaveType)
            .reduce((total, leave) => total + getLeaveDays(leave), 0);

        return {
          id: emp.id,
          displayId: emp.displayId,
          name: emp.name,
          department: emp.department,
          sick: sumLeaveDays("Sick Leave"),
          unpaid: sumLeaveDays("Unpaid Leave"),
          half:
            sumLeaveDays("Half Unpaid Leave") +
            monthAttendance.filter((att) => att.status === "half-day").length,
          openRequest: monthLeaves.filter((leave) => leave.status === "Pending")
            .length,
          noData: pastMonthDates.filter((date) => !attendanceDateSet.has(date))
            .length,
        };
      }),
    [
      attendanceByEmployee,
      currentDateKey,
      employees,
      leavesByEmployee,
      monthDates,
      monthYear,
    ],
  );

  const dayWiseData = useMemo(
    () =>
      employees.map((emp) => {
        const monthAttendance = (attendanceByEmployee.get(emp.id) || []).filter(
          (att) => isInMonth(att.date, monthYear),
        );
        const attendance = monthAttendance
          .filter((att) => att.status !== "absent")
          .map((att) => formatDateKey(att.date))
          .filter(Boolean);

        return {
          id: emp.id,
          displayId: emp.displayId,
          name: emp.name,
          department: emp.department,
          attendance,
        };
      }),
    [attendanceByEmployee, employees, monthYear],
  );

  const openingBalanceData = useMemo(
    () =>
      employees.map((emp) => {
        const approvedLeaves = (leavesByEmployee.get(emp.id) || []).filter(
          (leave) => leave.status === "Approved",
        );
        const sumLeaveDays = (leaveType) =>
          approvedLeaves
            .filter((leave) => leave.leaveType === leaveType)
            .reduce((total, leave) => total + getLeaveDays(leave), 0);

        return {
          id: emp.id,
          displayId: emp.displayId,
          name: emp.name,
          department: emp.department,
          unpaid: sumLeaveDays("Unpaid Leave"),
          sick: sumLeaveDays("Sick Leave"),
        };
      }),
    [employees, leavesByEmployee],
  );

  const filteredData = useMemo(() => {
    if (viewType === "summary") {
      let filtered = summaryData;

      if (selectedEmployee) {
        filtered = filtered.filter((emp) => emp.id === selectedEmployee);
      }

      if (selectedDepartment) {
        filtered = filtered.filter(
          (emp) => emp.department === selectedDepartment,
        );
      }

      if (searchTerm) {
        filtered = filtered.filter((emp) =>
          emp.name.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      }

      return filtered;
    }

    if (viewType === "daywise") {
      let filtered = dayWiseData;

      if (selectedEmployee) {
        filtered = filtered.filter((emp) => emp.id === selectedEmployee);
      }

      if (selectedDepartment) {
        filtered = filtered.filter(
          (emp) => emp.department === selectedDepartment,
        );
      }

      if (searchTerm) {
        filtered = filtered.filter((emp) =>
          emp.name.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      }

      return filtered;
    }

    if (viewType === "opening") {
      let filtered = openingBalanceData;

      if (selectedEmployee) {
        filtered = filtered.filter((emp) => emp.id === selectedEmployee);
      }

      if (selectedDepartment) {
        filtered = filtered.filter(
          (emp) => emp.department === selectedDepartment,
        );
      }

      if (searchTerm) {
        filtered = filtered.filter((emp) =>
          emp.name.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      }

      return filtered;
    }

    return [];
  }, [
    dayWiseData,
    openingBalanceData,
    searchTerm,
    selectedDepartment,
    selectedEmployee,
    summaryData,
    viewType,
  ]);

  const departments = useMemo(
    () => [...new Set(employees.map((emp) => emp.department).filter(Boolean))],
    [employees],
  );

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
                        <td>{emp.displayId}</td>
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
                      <td>{emp.displayId}</td>
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
            {loading ? "Loading attendance data..." : "No attendance data found"}
          </div>
        )}
      </div>
    </div>
  );
}
