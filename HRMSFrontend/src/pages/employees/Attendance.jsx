import React, { useState, useEffect } from "react";
import "../../assets/styles/Attendance.css";
import AttendanceList from "./AttendanceList";
import API from "../../utils/axios";
import { useAuth } from "../../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

const Attendance = () => {
  const { user } = useAuth();

  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(false);

  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());

  const totalDays = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();

  const months = [
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

  const years = [];
  for (let y = 2020; y <= 2030; y++) years.push(y);

  /* =========================
     FETCH ATTENDANCE
  ========================= */
  const fetchAttendance = async () => {
    try {
      setLoading(true);

      const res = await API.get("/attendance/me");

      console.log("API:", res.data); // 🔥 debug

      const records = res?.data?.data?.records || res?.data?.data || [];

      const formatted = {};

      records.forEach((item) => {
        const date = new Date(item.date);
        if (isNaN(date)) return;

        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();

        if (!formatted[year]) formatted[year] = {};
        if (!formatted[year][month]) formatted[year][month] = {};

        formatted[year][month][day] = {
          _id: item._id, // 🔥 IMPORTANT
          status: item.status,
          checkIn: item.checkIn,
          checkOut: item.checkOut,
        };
      });

      setAttendanceData(formatted);
    } catch (err) {
      console.error("FETCH ERROR:", err.response || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  /* =========================
     CHECK-IN
  ========================= */
  const handleCheckIn = async () => {
    try {
      const res = await API.post("/attendance/check-in");

      console.log("CHECK-IN SUCCESS:", res.data);

      fetchAttendance(); // refresh calendar
    } catch (err) {
      console.error("CHECK-IN ERROR:", err.response || err.message);

      alert(err.response?.data?.message || "Check-in failed");
    }
  };
  /* =========================
     CHECK-OUT
  ========================= */
  const handleCheckout = async () => {
    try {
      await API.post("/attendance/check-out");
      fetchAttendance();
    } catch (err) {
      console.error(err);
      alert("Checkout failed");
    }
  };

  /* =========================
     NAVIGATION
  ========================= */
  const prevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const nextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  return (
    <>
      {/* HEADER */}
      <div className="attendance-headingSection d-flex justify-content-between align-items-center">
        <div>
          <h2>Attendance</h2>
          <p>Track your attendance</p>
        </div>
        <div className="d-flex gap-2">
          <button onClick={handleCheckIn} className="btn btn-primary">
            Check In
          </button>

          <button onClick={handleCheckout} className="btn btn-success">
            Check Out
          </button>
        </div>
      </div>

      {/* NAV */}
      <div className="attendance-top-row d-flex gap-3 mt-3">
        <button onClick={prevMonth} className="btn btn-light btn-sm">
          &lt;
        </button>
        <button onClick={nextMonth} className="btn btn-light btn-sm">
          &gt;
        </button>

        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
        >
          {months.map((m, i) => (
            <option key={i} value={i}>
              {m}
            </option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
        >
          {years.map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* CALENDAR */}
      <div className="attendance-container mt-3">
        <div className="calendar-header-row">
          <div>Su</div>
          <div>Mo</div>
          <div>Tu</div>
          <div>We</div>
          <div>Th</div>
          <div>Fr</div>
          <div>Sa</div>
        </div>

        <div className="calendar-grid">
          {Array.from({ length: Math.ceil((firstDay + totalDays) / 7) }).map(
            (_, weekIndex) => (
              <div key={weekIndex} className="calendar-row">
                {Array.from({ length: 7 }).map((_, dayIndex) => {
                  const cellIndex = weekIndex * 7 + dayIndex;
                  const dayNumber = cellIndex - firstDay + 1;

                  if (cellIndex < firstDay || dayNumber > totalDays) {
                    return (
                      <div key={dayIndex} className="calendar-cell empty"></div>
                    );
                  }

                  const date = new Date(selectedYear, selectedMonth, dayNumber);
                  const isSunday = date.getDay() === 0;

                  const dayData =
                    attendanceData[selectedYear]?.[selectedMonth]?.[
                      dayNumber
                    ] || {};

                  let statusClass = dayData.status || "";
                  if (!statusClass && isSunday) statusClass = "sunday";

                  return (
                    <div
                      key={dayIndex}
                      className={`calendar-cell ${statusClass}`}
                    >
                      {dayNumber}
                    </div>
                  );
                })}
              </div>
            ),
          )}
        </div>
      </div>

      {/* LIST */}
      <AttendanceList
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        attendanceData={attendanceData}
      />
    </>
  );
};

export default Attendance;
