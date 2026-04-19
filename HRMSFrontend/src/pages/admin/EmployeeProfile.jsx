import React, { useState, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import "../../assets/styles/employeeProfile.css";

const EmployeeProfile = () => {
  const calendarRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [employee, setEmployee] = useState(null);
  const [isSearched, setIsSearched] = useState(false);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [errors, setErrors] = useState({
    search: "",
    date: "",
  });

  const attendanceEvents =
    employee?.attendance.map((att) => ({
      title: att.status === "Present" ? "P" : "A",
      date: att.date,
      color: att.status === "Present" ? "#28a745" : "#dc3545",
    })) || [];

  const employees = [
    {
      id: 1,
      name: "Kratika Sharma",
      email: "test@mail.in",
      phone: "0101010101",
      gender: "Female",
      department: "IT",
      designation: "Dot Net Developer",
      joinDate: "16 Aug 2024",
      address: "Indore",
      dob: "14 Mar 2000",

      attendance: [
        {
          date: "2026-02-20",
          checkIn: "09:00 AM",
          checkOut: "06:00 PM",
          status: "Present",
        },
        {
          date: "2026-02-21",
          checkIn: "09:15 AM",
          checkOut: "06:05 PM",
          status: "Present",
        },
        { date: "2026-02-22", checkIn: "-", checkOut: "-", status: "Absent" },
        {
          date: "2026-02-23",
          checkIn: "09:05 AM",
          checkOut: "06:10 PM",
          status: "Present",
        },
      ],

      salaryHistory: [
        {
          month: "February 2026",
          ctc: 17500,
          addition: 20,
          deduction: 720,
          remarks: "Leave",
          gross: 16800,
          lastPaid: "-",
        },
      ],
    },
  ];

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
    const calendarApi = calendarRef.current.getApi();
    calendarApi.gotoDate(new Date(year, month, 1));
  };

  const handleEmployeeSearch = () => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      setErrors((prev) => ({
        ...prev,
        search: "Please enter employee name or ID",
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, search: "" }));

    const result = employees.find((emp) => {
      const matchesDepartment =
        selectedDepartment === "" || emp.department === selectedDepartment;

      const matchesSearch =
        emp.name.toLowerCase().includes(search) ||
        emp.department.toLowerCase().includes(search) ||
        emp.id.toString().includes(search);

      return matchesDepartment && matchesSearch;
    });

    setEmployee(result || null);
    setIsSearched(true);
  };
  const handleDepartmentChange = (dept) => {
    setSelectedDepartment(dept);

    const results = employees.filter(
      (emp) => dept === "" || emp.department === dept,
    );

    setFilteredEmployees(results);
  };

  const handleFilter = () => {
    if (!employee) {
      setErrors((prev) => ({
        ...prev,
        date: "Please search employee first",
      }));
      return;
    }

    if (!fromDate || !toDate) {
      setErrors((prev) => ({
        ...prev,
        date: "Please select both dates",
      }));
      return;
    }

    if (fromDate > toDate) {
      setErrors((prev) => ({
        ...prev,
        date: "From date cannot be greater than To date",
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, date: "" }));

    const filtered = employee.attendance.filter(
      (att) => att.date >= fromDate && att.date <= toDate,
    );

    setFilteredAttendance(filtered);
  };

  const departments = [...new Set(employees.map((emp) => emp.department))];

  return (
    <div className="container py-4">
      <div className="card shadow-sm">
        <div className="card-header bg-white d-flex flex-column flex-md-row gap-3 justify-content-between align-items-stretch align-items-md-center">
          {/* Title */}
          <h4 className="fw-bold text-primary mb-0 text-center text-md-start">
            Employee Profile
          </h4>

          {/* Right Section (Filter + Search) */}
          <div className="d-flex flex-column flex-md-row gap-2 w-100 w-md-auto">
            {/* Department Filter */}
            <div className="w-100 w-md-auto">
              <select
                className="form-select"
                value={selectedDepartment}
                onChange={(e) => handleDepartmentChange(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map((dept, index) => (
                  <option key={index} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Box */}
            <div className="d-flex flex-column flex-md-row w-100 w-md-auto align-items-stretch align-items-md-center">
              <input
                type="text"
                className="form-control me-md-2 mb-2 mb-md-0"
                placeholder="Search employee..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsSearched(false);
                }}
              />

              <button
                className="btn btn-primary"
                onClick={handleEmployeeSearch}
              >
                Search
              </button>
            </div>
          </div>
        </div>

        <div className="card-body">
          {employee && (
            <>
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body d-flex flex-column flex-md-row align-items-center align-items-md-start text-center text-md-start">
                  <img
                    src="https://i.pravatar.cc/100"
                    alt="profile"
                    className="rounded-circle mb-3 mb-md-0 me-md-3"
                    width="80"
                  />

                  <div>
                    <h5 className="fw-bold mb-1">{employee.name}</h5>

                    <div className="mb-2">
                      <span className="badge bg-primary me-2">
                        {employee.designation}
                      </span>

                      <span className="badge bg-light text-dark border">
                        {employee.department}
                      </span>
                    </div>

                    <div className="text-muted">{employee.email}</div>
                  </div>

                  <div className="row g-3 mt-3 w-100">
                    <div className="col-12 col-sm-6 col-md-4">
                      <strong>Phone:</strong> {employee.phone}
                    </div>

                    <div className="col-12 col-sm-6 col-md-4">
                      <strong>Gender:</strong> {employee.gender}
                    </div>

                    <div className="col-12 col-sm-6 col-md-4">
                      <strong>Join Date:</strong> {employee.joinDate}
                    </div>

                    <div className="col-12 col-sm-6 col-md-4">
                      <strong>DOB:</strong> {employee.dob}
                    </div>

                    <div className="col-12 col-sm-6 col-md-4">
                      <strong>Address:</strong> {employee.address}
                    </div>
                  </div>
                </div>

                <hr />
              </div>

              {/* Attendance Calendar */}

              <div className="card shadow-sm mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <span className="fw-semibold">Attendance Calendar</span>

                  <div className="d-flex gap-2">
                    <select
                      className="form-select form-select-sm"
                      style={{ width: "110px" }}
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
                      style={{ width: "90px" }}
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

                <div className="card-body ">
                  <div className="calendar-wrapper">
                    <FullCalendar
                      ref={calendarRef}
                      plugins={[dayGridPlugin, interactionPlugin]}
                      initialView="dayGridMonth"
                      headerToolbar={false}
                      height="auto"
                      events={attendanceEvents}
                    />
                  </div>
                </div>
              </div>

              <div className="card shadow-sm">
                <div className="card-header fw-semibold">Salary Details</div>

                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Month</th>
                        <th>Name</th>
                        <th>Monthly CTC</th>
                        <th>Addition</th>
                        <th>Deduction</th>
                        <th>Remarks</th>
                        <th>Gross Pay</th>
                        <th>Last Paid</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {employee?.salaryHistory?.map((sal, index) => (
                        <tr key={index}>
                          <td>{sal.month}</td>
                          <td>{employee.name}</td>
                          <td>{sal.ctc}</td>
                          <td>{sal.addition}</td>
                          <td>{sal.deduction}</td>
                          <td>{sal.remarks}</td>

                          <td className="fw-bold text-success">{sal.gross}</td>

                          <td>{sal.lastPaid}</td>

                          <td>
                            <button className="btn btn-sm btn-primary">
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {isSearched && !employee && (
            <div className="alert alert-danger mt-3">Employee not found</div>
          )}
          {errors.search && (
            <small className="text-danger">{errors.search}</small>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
