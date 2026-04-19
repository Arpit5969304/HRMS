import React, { useState, useEffect } from "react";
import "../../assets/styles/Attendance.css";
import AttendanceList from "./AttendanceList";
import "bootstrap/dist/css/bootstrap.min.css"; // Make sure Bootstrap CSS is imported

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState({
    2026: {
      1: {
        3: { status: "present" },
        5: { status: "absent" },
        6: { status: "absent" },
        14: { status: "present" },
      },
    },
  });

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

  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();
    const currentTime = today.toTimeString().slice(0, 5);

    setAttendanceData((prev) => {
      const todayData = prev[year]?.[month]?.[day];
      if (todayData?.checkIn) return prev;
      return {
        ...prev,
        [year]: {
          ...prev[year],
          [month]: {
            ...prev[year]?.[month],
            [day]: {
              status: "present",
              checkIn: currentTime,
              checkOut: todayData?.checkOut || "",
              break: todayData?.break || "",
            },
          },
        },
      };
    });
  }, []);

  const handleCheckout = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();
    const currentTime = today.toTimeString().slice(0, 5);

    setAttendanceData((prev) => ({
      ...prev,
      [year]: {
        ...prev[year],
        [month]: {
          ...prev[year]?.[month],
          [day]: {
            ...prev[year]?.[month]?.[day],
            checkOut: currentTime,
            status: "present",
          },
        },
      },
    }));
  };

  // Updated handleBreak to accept type
  const handleBreak = (type) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();
    const currentTime = today.toTimeString().slice(0, 5);

    setAttendanceData((prev) => ({
      ...prev,
      [year]: {
        ...prev[year],
        [month]: {
          ...prev[year]?.[month],
          [day]: {
            ...prev[year]?.[month]?.[day],
            break: `${type} at ${currentTime}`,
          },
        },
      },
    }));
  };

  return (
    <>
      <div className="attendance-headingSection d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
        <div>
          <h2>Attendance</h2>
          <p>Click edit button to update Attendance</p>
        </div>
        <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-md-auto">
          <button
            onClick={handleCheckout}
            className="btn btn-success w-100 w-sm-auto"
          >
            CheckOut
          </button>

          <button
            className="break-btn w-100 w-sm-auto"
            data-bs-toggle="modal"
            data-bs-target="#breakModal"
          >
            ☕ Break
          </button>

          {/* Break Modal */}
          <div
            className="modal fade"
            id="breakModal"
            tabIndex="-1"
            aria-labelledby="breakModalLabel"
            aria-hidden="true"
            data-bs-backdrop="static"
            data-bs-keyboard="false"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content break-modal">
                <div className="modal-header">
                  <h5 className="modal-title" id="breakModalLabel">
                    Take a Break
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                  ></button>
                </div>

                <div className="modal-body break-options">
                  <button
                    className="break-option"
                    onClick={() => handleBreak("Tea Break")}
                    data-bs-dismiss="modal"
                  >
                    ☕ Tea Break
                  </button>

                  <button
                    className="break-option"
                    onClick={() => handleBreak("Lunch Break")}
                    data-bs-dismiss="modal"
                  >
                    🍽 Lunch Break
                  </button>

                  <button
                    className="break-option"
                    onClick={() => handleBreak("Personal Break")}
                    data-bs-dismiss="modal"
                  >
                    🚶 Personal Break
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Month & Year Navigation */}
      <div className="attendance-top-row d-flex flex-column flex-md-row  align-items-start align-items-md-center gap-3">
        <div className="d-flex gap-2">
          <button onClick={prevMonth} className="btn btn-light btn-sm">
            &lt;
          </button>

          <button onClick={nextMonth} className="btn btn-light btn-sm">
            &gt;
          </button>
        </div>

        <div>
          <label>Month: </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {months.map((m, index) => (
              <option key={index} value={index}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Year: </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Calendar */}
      <div className="attendance-container">
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

      <AttendanceList
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        attendanceData={attendanceData}
        setAttendanceData={setAttendanceData}
      />
    </>
  );
};

export default Attendance;
