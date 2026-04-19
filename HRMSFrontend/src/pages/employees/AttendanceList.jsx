import React, { useState } from "react";
import "../../assets/styles/Attendance.css";
import { GrEdit } from "react-icons/gr";

const AttendanceList = ({
  selectedYear,
  selectedMonth,
  attendanceData,
  setAttendanceData,
}) => {
  const totalDays = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const daysArray = [];

  const [selectedDay, setSelectedDay] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Current date
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Only show till current date if current month selected
  const maxDay =
    selectedYear === currentYear && selectedMonth === currentMonth
      ? currentDay
      : totalDays;

  for (let d = 1; d <= maxDay; d++) {
    const statusData = attendanceData[selectedYear]?.[selectedMonth]?.[d] || {};
    const dateObj = new Date(selectedYear, selectedMonth, d);
    const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long" });

    let finalStatus = "-";

    if (typeof statusData === "string") {
      finalStatus = statusData;
    } else if (statusData.status) {
      finalStatus = statusData.status;
    } else if (dayName === "Sunday") {
      finalStatus = "Sunday";
    }

    daysArray.push({
      date: `${d}/${selectedMonth + 1}/${selectedYear}`,
      status: finalStatus,
      checkIn: statusData.checkIn || "-",
      checkOut: statusData.checkOut || "-",
      duration:
        statusData.checkIn && statusData.checkOut
          ? calculateDuration(statusData.checkIn, statusData.checkOut)
          : "-",
      breakTime: statusData.break || "-",
    });
  }

  function savetheChanges() {
    const dayNumber = new Date(selectedDay.date).getDate();

    setAttendanceData((prev) => ({
      ...prev,
      [selectedYear]: {
        ...prev[selectedYear],
        [selectedMonth]: {
          ...prev[selectedYear]?.[selectedMonth],
          [dayNumber]: {
            status: "present",
            checkIn: selectedDay.checkIn,
            checkOut: selectedDay.checkOut,
            break: selectedDay.breakTime,
          },
        },
      },
    }));

    setIsModalOpen(false);
  }

  function calculateDuration(start, end) {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);

    const startMinutes = sh * 60 + sm;
    const endMinutes = eh * 60 + em;

    const diff = endMinutes - startMinutes;

    const hours = Math.floor(diff / 60)
      .toString()
      .padStart(2, "0");
    const minutes = (diff % 60).toString().padStart(2, "0");

    return `${hours}:${minutes}:00`;
  }

  return (
    <>
      <div className="table-responsive">
        <table className="attendance-table">
          <thead>
            <tr>
              <th className="top-tr" colSpan="8">
                  Attendance List - {selectedMonth + 1}/{selectedYear}
              </th>
            </tr>

            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Duration</th>
              <th>Break</th>
              <th>Note</th>
              <th>Edit</th>
            </tr>
          </thead>

          <tbody>
            {daysArray.map((day, idx) => (
              <tr key={idx}>
                <td>{day.date}</td>

                <td
                  className={
                    day.status === "present"
                      ? "present"
                      : day.status === "absent"
                        ? "absent"
                        : day.status === "Sunday"
                          ? "sunday"
                          : ""
                  }
                >
                  {day.status !== "-"
                    ? day.status.charAt(0).toUpperCase() + day.status.slice(1)
                    : "-"}
                </td>

                <td>{day.checkIn}</td>

                <td>{day.checkOut}</td>

                <td>{day.duration}</td>

                <td>{day.breakTime}</td>

                <td>-</td>

                <td>
                  <button
                    className="edit-btn"
                    onClick={() => {
                      setSelectedDay(day);
                      setIsModalOpen(true);
                    }}
                  >
                    <GrEdit className="edit-icon" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay-att">
          <div className="modal-container-att px-2 px-sm-3">
            <div className="modal-header">
              <h3>Edit Attendance</h3>

              <span onClick={() => setIsModalOpen(false)} className="close-btn">
                ✖
              </span>
            </div>

            <div className="modal-body">
              <label>Check-In</label>

              <input
                className="w-100"
                type="time"
                value={selectedDay?.checkIn === "-" ? "" : selectedDay?.checkIn}
                onChange={(e) =>
                  setSelectedDay({ ...selectedDay, checkIn: e.target.value })
                }
              />

              <label>Check-Out</label>

              <input
                className="w-100"
                type="time"
                value={
                  selectedDay?.checkOut === "-" ? "" : selectedDay?.checkOut
                }
                onChange={(e) =>
                  setSelectedDay({ ...selectedDay, checkOut: e.target.value })
                }
              />

              <label>Remarks</label>
              <textarea
                className="w-100"
                placeholder="Enter remarks..."
              ></textarea>
            </div>

            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>

              <button onClick={savetheChanges} className="save-btn">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AttendanceList;
