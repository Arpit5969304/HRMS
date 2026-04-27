import React, { useEffect, useMemo, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  BsBriefcase,
  BsBuilding,
  BsCalendar3,
  BsCashStack,
  BsCheckCircle,
  BsCircleHalf,
  BsClock,
  BsEnvelope,
  BsPersonBadge,
  BsSearch,
  BsTelephone,
  BsXCircle,
} from "react-icons/bs";
import "../../assets/styles/employeeProfile.css";
import useAttendance from "../../hooks/useAttendance";
import useEmployees from "../../hooks/useEmployees";
import useSalary from "../../hooks/useSalary";

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateKey = (date) => {
  if (!date) return "";

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "";

  return parsedDate.toISOString().slice(0, 10);
};

const formatTime = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatMoney = (amount) =>
  `Rs. ${Number(amount || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const getEmployeeName = (emp) =>
  [emp?.firstName, emp?.lastName].filter(Boolean).join(" ") ||
  emp?.name ||
  emp?.employeeId ||
  "Employee";

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

const getSalaryRecordTotal = (record) => {
  if (record?.totalSalary !== undefined && record?.totalSalary !== null) {
    return record.totalSalary;
  }

  return salaryFields.reduce(
    (total, field) => total + Number(record?.salary?.[field] || 0),
    0
  );
};

const attendanceStatusConfig = {
  present: {
    title: "P",
    color: "#16a34a",
    label: "Present",
    className: "is-present",
  },
  late: {
    title: "L",
    color: "#d97706",
    label: "Late",
    className: "is-late",
  },
  "half-day": {
    title: "H",
    color: "#0284c7",
    label: "Half Day",
    className: "is-half-day",
  },
  absent: {
    title: "A",
    color: "#dc2626",
    label: "Absent",
    className: "is-absent",
  },
};

const getAttendanceConfig = (status) => {
  const normalizedStatus = status?.toLowerCase() || "absent";

  return attendanceStatusConfig[normalizedStatus] || attendanceStatusConfig.absent;
};

const EmployeeProfile = () => {
  const calendarRef = useRef(null);
  const { employees, loading: employeesLoading } = useEmployees();
  const {
    attendance: attendanceRecords,
    loading: attendanceLoading,
    error: attendanceError,
    getAllAttendance,
  } = useAttendance();
  const {
    salaryHistory,
    loading: salaryLoading,
    getCurrentSalary,
    getSalaryHistory,
  } = useSalary();

  const [searchTerm, setSearchTerm] = useState("");
  const [employee, setEmployee] = useState(null);
  const [isSearched, setIsSearched] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentSalary, setCurrentSalary] = useState(null);
  const [salaryLoadedEmployeeId, setSalaryLoadedEmployeeId] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [errors, setErrors] = useState({
    search: "",
  });

  useEffect(() => {
    getAllAttendance();
  }, [getAllAttendance]);

  const selectedEmployeeId = employee?._id;
  const profileSalaryHistory =
    salaryLoadedEmployeeId === selectedEmployeeId ? salaryHistory : [];

  const selectedEmployeeAttendance = useMemo(() => {
    if (!selectedEmployeeId) return [];

    return attendanceRecords
      .filter((att) => {
        const attendanceEmployeeId =
          typeof att.employee === "object" ? att.employee?._id : att.employee;

        return attendanceEmployeeId === selectedEmployeeId;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [attendanceRecords, selectedEmployeeId]);

  const attendanceEvents = useMemo(
    () =>
      selectedEmployeeAttendance
        .map((att) => {
          const config = getAttendanceConfig(att.status);

          return {
            title: config.title,
            date: formatDateKey(att.date),
            color: config.color,
            textColor: "#ffffff",
          };
        })
        .filter((event) => event.date),
    [selectedEmployeeAttendance]
  );

  const attendanceStats = useMemo(() => {
    const stats = {
      total: selectedEmployeeAttendance.length,
      present: 0,
      late: 0,
      halfDay: 0,
      absent: 0,
      rate: 0,
    };

    selectedEmployeeAttendance.forEach((att) => {
      const status = att.status?.toLowerCase();

      if (status === "present") stats.present += 1;
      else if (status === "late") stats.late += 1;
      else if (status === "half-day") stats.halfDay += 1;
      else stats.absent += 1;
    });

    const attendedDays = stats.present + stats.late + stats.halfDay;
    stats.rate = stats.total ? Math.round((attendedDays / stats.total) * 100) : 0;

    return stats;
  }, [selectedEmployeeAttendance]);

  const recentAttendance = useMemo(
    () => selectedEmployeeAttendance.slice(0, 5),
    [selectedEmployeeAttendance]
  );

  const departments = useMemo(
    () => [...new Set(employees.map((emp) => emp.department).filter(Boolean))],
    [employees]
  );

  const searchSuggestions = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return [];

    return employees
      .filter((emp) => {
        const name = getEmployeeName(emp).toLowerCase();
        const matchesDepartment =
          selectedDepartment === "" || emp.department === selectedDepartment;
        const matchesSearch =
          name.includes(search) ||
          emp.employeeId?.toLowerCase().includes(search) ||
          emp.email?.toLowerCase().includes(search) ||
          emp.department?.toLowerCase().includes(search);

        return matchesDepartment && matchesSearch;
      })
      .slice(0, 6);
  }, [employees, searchTerm, selectedDepartment]);

  const currentSalaryTotal = useMemo(() => {
    if (!currentSalary) return 0;

    if (currentSalary.netSalary !== undefined && currentSalary.netSalary !== null) {
      return currentSalary.netSalary;
    }

    return salaryFields.reduce(
      (total, field) => total + Number(currentSalary[field] || 0),
      0
    );
  }, [currentSalary]);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const years = [];
  for (let y = 2020; y <= 2035; y++) {
    years.push(y);
  }

  const changeCalendarDate = (month, year) => {
    const calendarApi = calendarRef.current?.getApi();

    if (!calendarApi) return;

    calendarApi.gotoDate(new Date(year, month, 1));
  };

  const selectEmployee = async (selectedEmployee) => {
    setEmployee(selectedEmployee);
    setSearchTerm(getEmployeeName(selectedEmployee));
    setIsSearched(true);
    setShowSuggestions(false);
    setErrors({ search: "" });
    setCurrentSalary(null);
    setSalaryLoadedEmployeeId("");

    if (!selectedEmployee?._id) return;

    const salary = await getCurrentSalary(selectedEmployee._id);
    setCurrentSalary(salary);
    await getSalaryHistory(selectedEmployee._id);
    setSalaryLoadedEmployeeId(selectedEmployee._id);
  };

  const handleEmployeeSearch = async () => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      setErrors((prev) => ({
        ...prev,
        search: "Please enter employee name or ID",
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, search: "" }));

    const result = searchSuggestions[0] || null;

    if (result) {
      await selectEmployee(result);
      return;
    }

    setEmployee(null);
    setCurrentSalary(null);
    setSalaryLoadedEmployeeId("");
    setIsSearched(true);
    setShowSuggestions(false);
  };
  const handleDepartmentChange = (dept) => {
    setSelectedDepartment(dept);
  };

  return (
    <div className="employee-profile-page">
      <div className="employee-profile-toolbar">
        <div className="employee-profile-title">
          <h4>Employee Profile</h4>
          <span>{employees.length} employee records</span>
        </div>

        <div className="employee-profile-controls">
          <select
            className="form-select profile-department-select"
            value={selectedDepartment}
            onChange={(e) => handleDepartmentChange(e.target.value)}
            disabled={employeesLoading}
          >
            <option value="">All Departments</option>
            {departments.map((dept, index) => (
              <option key={index} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <div className="employee-search-control">
            <div className="employee-search-input-wrap">
              <input
                type="text"
                className="form-control"
                placeholder="Search employee..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsSearched(false);
                  setShowSuggestions(Boolean(e.target.value.trim()));
                }}
                onFocus={() => setShowSuggestions(Boolean(searchTerm.trim()))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleEmployeeSearch();
                  }

                  if (e.key === "Escape") {
                    setShowSuggestions(false);
                  }
                }}
              />

              {showSuggestions && (
                <div className="employee-search-suggestions">
                  {searchSuggestions.length ? (
                    searchSuggestions.map((emp) => (
                      <button
                        type="button"
                        key={emp._id || emp.employeeId}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          selectEmployee(emp);
                        }}
                      >
                        <span>{getEmployeeName(emp)}</span>
                        <small>
                          {emp.employeeId || "-"} - {emp.department || "-"}
                        </small>
                      </button>
                    ))
                  ) : (
                    <div className="employee-suggestion-empty">
                      No matching employees
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              className="btn btn-primary profile-search-button"
              onClick={handleEmployeeSearch}
              disabled={employeesLoading}
            >
              <BsSearch aria-hidden="true" />
              <span>{employeesLoading ? "Loading" : "Search"}</span>
            </button>
          </div>
        </div>
      </div>

      {errors.search && (
        <div className="profile-message is-danger">{errors.search}</div>
      )}

      {isSearched && !employee && (
        <div className="profile-message is-danger">Employee not found</div>
      )}

      {!employee && !isSearched && (
        <section className="profile-empty-panel">
          <BsPersonBadge aria-hidden="true" />
          <h5>No employee selected</h5>
        </section>
      )}

      {employee && (
        <>
          <section className="profile-overview-panel">
            <div className="profile-identity">
              <img
                src={employee.profileImage || "https://i.pravatar.cc/100"}
                alt={getEmployeeName(employee)}
                className="profile-avatar"
              />

              <div className="profile-title-block">
                <span className="profile-eyebrow">
                  {employee.employeeId || "Employee"}
                </span>
                <h5>{getEmployeeName(employee)}</h5>

                <div className="profile-badge-row">
                  <span>
                    <BsBriefcase aria-hidden="true" />
                    {employee.designation || "Employee"}
                  </span>
                  <span>
                    <BsBuilding aria-hidden="true" />
                    {employee.department || "-"}
                  </span>
                  <span className="profile-status-badge">
                    {employee.status || "-"}
                  </span>
                </div>
              </div>
            </div>

            <div className="profile-detail-grid">
              <div className="profile-detail-item">
                <BsEnvelope aria-hidden="true" />
                <div>
                  <span>Email</span>
                  <strong>{employee.email || "-"}</strong>
                </div>
              </div>

              <div className="profile-detail-item">
                <BsTelephone aria-hidden="true" />
                <div>
                  <span>Phone</span>
                  <strong>{employee.phone || "-"}</strong>
                </div>
              </div>

              <div className="profile-detail-item">
                <BsCalendar3 aria-hidden="true" />
                <div>
                  <span>Join Date</span>
                  <strong>{formatDate(employee.joinDate)}</strong>
                </div>
              </div>

              <div className="profile-detail-item">
                <BsPersonBadge aria-hidden="true" />
                <div>
                  <span>Gender</span>
                  <strong>{employee.gender || "-"}</strong>
                </div>
              </div>
            </div>
          </section>

          <section className="profile-section">
            <div className="profile-section-header">
              <div>
                <span className="profile-section-kicker">
                  <BsCalendar3 aria-hidden="true" />
                  Attendance
                </span>
                <h5>Calendar</h5>
              </div>

              <div className="profile-period-controls">
                <select
                  className="form-select form-select-sm"
                  value={currentMonth}
                  onChange={(e) => {
                    const m = Number(e.target.value);
                    setCurrentMonth(m);
                    changeCalendarDate(m, currentYear);
                  }}
                >
                  {months.map((m, i) => (
                    <option key={i} value={i}>
                      {m}
                    </option>
                  ))}
                </select>

                <select
                  className="form-select form-select-sm"
                  value={currentYear}
                  onChange={(e) => {
                    const y = Number(e.target.value);
                    setCurrentYear(y);
                    changeCalendarDate(currentMonth, y);
                  }}
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="attendance-stat-grid">
              <div className="attendance-stat">
                <BsCalendar3 aria-hidden="true" />
                <span>Marked Days</span>
                <strong>{attendanceStats.total}</strong>
              </div>
              <div className="attendance-stat">
                <BsCheckCircle aria-hidden="true" />
                <span>Present</span>
                <strong>{attendanceStats.present}</strong>
              </div>
              <div className="attendance-stat">
                <BsClock aria-hidden="true" />
                <span>Late</span>
                <strong>{attendanceStats.late}</strong>
              </div>
              <div className="attendance-stat">
                <BsCircleHalf aria-hidden="true" />
                <span>Half Day</span>
                <strong>{attendanceStats.halfDay}</strong>
              </div>
              <div className="attendance-stat">
                <BsXCircle aria-hidden="true" />
                <span>Absent</span>
                <strong>{attendanceStats.absent}</strong>
              </div>
              <div className="attendance-stat">
                <BsCheckCircle aria-hidden="true" />
                <span>Attendance Rate</span>
                <strong>{attendanceStats.rate}%</strong>
              </div>
            </div>

            <div className="attendance-legend">
              {Object.values(attendanceStatusConfig).map((item) => (
                <span key={item.label}>
                  <i style={{ backgroundColor: item.color }} />
                  {item.label}
                </span>
              ))}
            </div>

            {attendanceError && (
              <div className="profile-message is-danger">{attendanceError}</div>
            )}

            {!attendanceLoading &&
              !attendanceError &&
              selectedEmployeeAttendance.length === 0 && (
                <div className="profile-message is-info">
                  No attendance records found
                </div>
              )}

            <div className="profile-calendar-wrapper employee-profile-calendar">
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={false}
                height="auto"
                events={attendanceEvents}
              />
            </div>

            {attendanceLoading && (
              <div className="profile-loading-text">Loading attendance...</div>
            )}

            <div className="recent-attendance-block">
              <div className="profile-subsection-header">
                <h6>Recent Attendance</h6>
              </div>

              <div className="table-responsive">
                <table className="table profile-table align-middle">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Hours</th>
                      <th>Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAttendance.length ? (
                      recentAttendance.map((att) => {
                        const config = getAttendanceConfig(att.status);

                        return (
                          <tr key={att._id || `${att.date}-${att.status}`}>
                            <td>{formatDate(att.date)}</td>
                            <td>
                              <span className={`status-pill ${config.className}`}>
                                {config.label}
                              </span>
                            </td>
                            <td>{formatTime(att.checkIn)}</td>
                            <td>{formatTime(att.checkOut)}</td>
                            <td>{att.workingHours ?? "-"}</td>
                            <td>{att.remark || "-"}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center text-muted py-4">
                          No recent attendance found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="profile-section">
            <div className="profile-section-header">
              <div>
                <span className="profile-section-kicker">
                  <BsCashStack aria-hidden="true" />
                  Payroll
                </span>
                <h5>Salary Details</h5>
              </div>
            </div>

            {salaryLoading && (
              <div className="profile-loading-text">Loading salary...</div>
            )}

            {currentSalary ? (
              <div className="salary-summary-grid">
                <div className="salary-summary-card is-total">
                  <span>Monthly Salary</span>
                  <strong>{formatMoney(currentSalaryTotal)}</strong>
                </div>

                {salaryFields.map((field) => (
                  <div className="salary-summary-card" key={field}>
                    <span>{salaryLabels[field]}</span>
                    <strong>{formatMoney(currentSalary[field])}</strong>
                  </div>
                ))}
              </div>
            ) : (
              !salaryLoading && (
                <div className="profile-message is-info">
                  No current salary found
                </div>
              )
            )}

            <div className="table-responsive">
              <table className="table profile-table align-middle">
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
                  {profileSalaryHistory.length ? (
                    profileSalaryHistory.map((salaryRecord, index) => (
                      <tr key={salaryRecord._id || index}>
                        <td className="fw-semibold">
                          {monthNames[salaryRecord.month] || salaryRecord.month}{" "}
                          {salaryRecord.year}
                        </td>
                        {salaryFields.map((field) => (
                          <td key={field}>
                            {formatMoney(salaryRecord.salary?.[field])}
                          </td>
                        ))}
                        <td className="fw-bold">
                          {formatMoney(getSalaryRecordTotal(salaryRecord))}
                        </td>
                        <td>
                          {formatDate(
                            salaryRecord.updatedAt ||
                              salaryRecord.createdAt ||
                              salaryRecord.date
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={salaryFields.length + 3}
                        className="text-center text-muted py-3"
                      >
                        No salary history found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default EmployeeProfile;
