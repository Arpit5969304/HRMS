import React from "react";
import "../../assets/styles/Attendance.css";

const AttendanceList = ({ selectedLabel, records, isFutureView }) => {
  if (!records.length) {
    return (
      <section className="attendance-panel attendance-records-panel">
        <div className="attendance-panel-head">
          <div>
            <span className="attendance-card-label">Daily records</span>
            <h2>Attendance history</h2>
            <p>
              {isFutureView
                ? `Attendance records for ${selectedLabel} will appear once the month begins.`
                : `Attendance entries for ${selectedLabel} will show up here as soon as they are recorded.`}
            </p>
          </div>
        </div>

        <div className="attendance-empty-state">
          {isFutureView
            ? "This is an upcoming month, so there are no work logs yet."
            : "No attendance records are available for this period yet."}
        </div>
      </section>
    );
  }

  return (
    <section className="attendance-panel attendance-records-panel">
      <div className="attendance-panel-head">
        <div>
          <span className="attendance-card-label">Daily records</span>
          <h2>Attendance history</h2>
          <p>
            A detailed day-by-day breakdown for {selectedLabel}, including
            timing, hours, and any note attached to the record.
          </p>
        </div>
      </div>

      <div className="attendance-records-table-wrap">
        <table className="attendance-records-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Day</th>
              <th>Status</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Hours</th>
              <th>Notes</th>
            </tr>
          </thead>

          <tbody>
            {records.map((record) => (
              <tr key={record.dateLabel}>
                <td>
                  <div className="attendance-record-date">
                    <strong>{record.dateLabel}</strong>
                    {record.isToday && <span>Today</span>}
                  </div>
                </td>
                <td>{record.weekdayLabel}</td>
                <td>
                  <span
                    className={`attendance-status-badge is-${record.statusKey}`}
                  >
                    {record.statusLabel}
                  </span>
                </td>
                <td>{record.checkInLabel}</td>
                <td>{record.checkOutLabel}</td>
                <td>{record.hoursLabel}</td>
                <td>
                  <div className="attendance-note-cell">
                    <strong>{record.noteLabel}</strong>
                    <span>{record.note || "No note added for this day."}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="attendance-records-mobile">
        {records.map((record) => (
          <article
            key={`${record.dateLabel}-mobile`}
            className={`attendance-record-card is-${record.statusKey}`}
          >
            <div className="attendance-record-card-top">
              <div>
                <strong>{record.dateLabel}</strong>
                <span>{record.weekdayLabel}</span>
              </div>

              <span className={`attendance-status-badge is-${record.statusKey}`}>
                {record.statusLabel}
              </span>
            </div>

            <div className="attendance-record-card-grid">
              <div>
                <span>Check in</span>
                <strong>{record.checkInLabel}</strong>
              </div>
              <div>
                <span>Check out</span>
                <strong>{record.checkOutLabel}</strong>
              </div>
              <div>
                <span>Hours</span>
                <strong>{record.hoursLabel}</strong>
              </div>
              <div>
                <span>Note type</span>
                <strong>{record.noteLabel}</strong>
              </div>
            </div>

            <p className="attendance-record-card-note">
              {record.note || "No note added for this day."}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default AttendanceList;
