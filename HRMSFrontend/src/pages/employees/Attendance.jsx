import React, { useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCalendar,
  FiClock,
  FiLogIn,
  FiLogOut,
  FiTrendingUp,
} from "react-icons/fi";
import "../../assets/styles/Attendance.css";
import AttendanceList from "./AttendanceList";
import API from "../../utils/axios";
import { useAuth } from "../../context/AuthContext";

const MONTHS = [
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

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STATUS_META = {
  present: { label: "Present", short: "P" },
  late: { label: "Late", short: "L" },
  "half-day": { label: "Half Day", short: "HD" },
  absent: { label: "Absent", short: "A" },
  sunday: { label: "Sunday", short: "Sun" },
  "not-recorded": { label: "No Record", short: "--" },
};

const formatTime = (value) => {
  if (!value) return "--";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatHours = (hours, checkIn, checkOut, showZero = false) => {
  let totalMinutes = null;

  if (Number.isFinite(Number(hours))) {
    totalMinutes = Math.round(Number(hours) * 60);
  } else if (checkIn && checkOut) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end - start;

    if (diff > 0) {
      totalMinutes = Math.round(diff / (1000 * 60));
    }
  }

  if (totalMinutes === null || totalMinutes < 0) {
    return showZero ? "0h" : "--";
  }

  if (totalMinutes === 0 && !showZero) {
    return "--";
  }

  const totalHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (minutes === 0) {
    return `${totalHours}h`;
  }

  return `${totalHours}h ${String(minutes).padStart(2, "0")}m`;
};

const getStatusKey = (record, isSunday) =>
  record?.status || (isSunday ? "sunday" : "not-recorded");

const Attendance = () => {
  const { user } = useAuth();
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(false);
  const [submittingAction, setSubmittingAction] = useState("");
  const [notice, setNotice] = useState(null);

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const totalDays = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
  const isCurrentView =
    selectedYear === currentYear && selectedMonth === currentMonth;
  const isFutureView =
    selectedYear > currentYear ||
    (selectedYear === currentYear && selectedMonth > currentMonth);
  const maxVisibleDay = isFutureView ? 0 : isCurrentView ? currentDay : totalDays;

  const years = [];
  for (
    let year = Math.max(2020, currentYear - 4);
    year <= currentYear + 3;
    year += 1
  ) {
    years.push(year);
  }

  const fetchAttendance = async () => {
    try {
      setLoading(true);

      const res = await API.get("/attendance/me");
      const records = res?.data?.data?.records || res?.data?.data || [];
      const formatted = {};

      records.forEach((item) => {
        const date = new Date(item.date);
        if (Number.isNaN(date.getTime())) return;

        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();

        if (!formatted[year]) formatted[year] = {};
        if (!formatted[year][month]) formatted[year][month] = {};

        formatted[year][month][day] = {
          _id: item._id,
          status: item.status,
          checkIn: item.checkIn,
          checkOut: item.checkOut,
          workingHours: item.workingHours,
          remark: item.remark,
          reason: item.reason,
          approved: item.approved,
        };
      });

      setAttendanceData(formatted);
      return true;
    } catch (err) {
      setNotice({
        type: "error",
        message:
          err.response?.data?.message ||
          "We could not load your attendance right now.",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleAttendanceAction = async (action) => {
    const endpoint =
      action === "check-in" ? "/attendance/check-in" : "/attendance/check-out";
    const fallbackMessage =
      action === "check-in"
        ? "Your check-in was saved."
        : "Your check-out was saved.";

    try {
      setSubmittingAction(action);
      const res = await API.post(endpoint);
      const refreshed = await fetchAttendance();

      if (refreshed) {
        setNotice({
          type: "success",
          message: res?.data?.message || fallbackMessage,
        });
      }
    } catch (err) {
      setNotice({
        type: "error",
        message:
          err.response?.data?.message ||
          (action === "check-in"
            ? "Check-in failed. Please try again."
            : "Check-out failed. Please try again."),
      });
    } finally {
      setSubmittingAction("");
    }
  };

  const prevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((prev) => prev - 1);
      return;
    }

    setSelectedMonth((prev) => prev - 1);
  };

  const nextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((prev) => prev + 1);
      return;
    }

    setSelectedMonth((prev) => prev + 1);
  };

  const todayRecord =
    attendanceData[currentYear]?.[currentMonth]?.[currentDay] || null;
  const todayStatusKey = getStatusKey(todayRecord, today.getDay() === 0);
  const todayStatusLabel =
    todayStatusKey === "not-recorded"
      ? "Not Marked"
      : STATUS_META[todayStatusKey]?.label || "Not Marked";

  const todayMessage =
    todayRecord?.checkIn && !todayRecord?.checkOut
      ? "You are checked in. Remember to check out before ending the day."
      : todayRecord?.checkOut
        ? "Your full workday is recorded for today."
        : "Use the quick actions to start your workday.";

  const canCheckIn =
    !loading && !submittingAction && !Boolean(todayRecord?.checkIn);
  const canCheckOut =
    !loading &&
    !submittingAction &&
    Boolean(todayRecord?.checkIn) &&
    !Boolean(todayRecord?.checkOut);

  const summary = {
    present: 0,
    late: 0,
    "half-day": 0,
    absent: 0,
    recordedDays: 0,
    totalHours: 0,
  };

  const attendanceRecords = [];

  for (let day = 1; day <= maxVisibleDay; day += 1) {
    const date = new Date(selectedYear, selectedMonth, day);
    const isSunday = date.getDay() === 0;
    const dayData = attendanceData[selectedYear]?.[selectedMonth]?.[day] || {};
    const statusKey = getStatusKey(dayData, isSunday);
    const note = dayData.reason || dayData.remark || "";

    if (dayData.status) {
      summary.recordedDays += 1;
      if (summary[dayData.status] !== undefined) {
        summary[dayData.status] += 1;
      }
    }

    summary.totalHours += Number(dayData.workingHours || 0);

    attendanceRecords.push({
      dayNumber: day,
      dateLabel: date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      weekdayLabel: date.toLocaleDateString("en-IN", {
        weekday: "long",
      }),
      statusKey,
      statusLabel: STATUS_META[statusKey]?.label || "No Record",
      shortStatus: STATUS_META[statusKey]?.short || "--",
      checkInLabel: formatTime(dayData.checkIn),
      checkOutLabel: formatTime(dayData.checkOut),
      hoursLabel: formatHours(
        dayData.workingHours,
        dayData.checkIn,
        dayData.checkOut,
      ),
      note,
      noteLabel: dayData.reason
        ? dayData.approved
          ? "Reason approved"
          : "Reason submitted"
        : dayData.remark
          ? "Manager note"
          : "No note",
      isToday:
        selectedYear === currentYear &&
        selectedMonth === currentMonth &&
        day === currentDay,
    });
  }

  attendanceRecords.reverse();

  const calendarCells = [];

  for (let index = 0; index < firstDay; index += 1) {
    calendarCells.push({
      key: `empty-start-${index}`,
      isEmpty: true,
    });
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const date = new Date(selectedYear, selectedMonth, day);
    const isSunday = date.getDay() === 0;
    const dayData = attendanceData[selectedYear]?.[selectedMonth]?.[day] || {};
    const statusKey = getStatusKey(dayData, isSunday);

    calendarCells.push({
      key: `${selectedYear}-${selectedMonth}-${day}`,
      dayNumber: day,
      isToday:
        selectedYear === currentYear &&
        selectedMonth === currentMonth &&
        day === currentDay,
      statusKey,
      statusLabel: STATUS_META[statusKey]?.label || "No Record",
      shortStatus: STATUS_META[statusKey]?.short || "--",
      checkInLabel: formatTime(dayData.checkIn),
      hasData: Boolean(dayData.status || isSunday),
    });
  }

  const trailingCells = (7 - (calendarCells.length % 7)) % 7;
  for (let index = 0; index < trailingCells; index += 1) {
    calendarCells.push({
      key: `empty-end-${index}`,
      isEmpty: true,
    });
  }

  const selectedMonthLabel = `${MONTHS[selectedMonth]} ${selectedYear}`;
  const todayDateLabel = today.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const summaryCards = [
    {
      key: "present",
      label: "Present",
      value: summary.present,
      description: "On-time working days",
    },
    {
      key: "late",
      label: "Late",
      value: summary.late,
      description: "Late starts recorded",
    },
    {
      key: "half-day",
      label: "Half Day",
      value: summary["half-day"],
      description: "Short workdays tracked",
    },
    {
      key: "absent",
      label: "Absent",
      value: summary.absent,
      description: "Days marked absent",
    },
  ];

  return (
    <div className="attendance-page">
      <section className="attendance-hero">
        <div className="attendance-hero-copy">
          <span className="attendance-eyebrow">Employee attendance</span>
          <h1>
            {user?.firstName
              ? `${user.firstName}, keep your workday clear and organised.`
              : "Keep your workday clear and organised."}
          </h1>
          <p>
            Review daily check-ins, stay on top of monthly attendance, and keep
            everything easy to scan on desktop and mobile.
          </p>

          <div className="attendance-hero-chips">
            <span>
              <FiCalendar />
              {selectedMonthLabel}
            </span>
            <span>
              <FiTrendingUp />
              {summary.recordedDays} tracked day
              {summary.recordedDays === 1 ? "" : "s"}
            </span>
            <span>
              <FiClock />
              {formatHours(summary.totalHours, null, null, true)} logged
            </span>
          </div>
        </div>

        <div className="attendance-today-card">
          <div className="attendance-card-label">Today</div>
          <div
            className={`attendance-status-badge attendance-status-badge-lg is-${todayStatusKey}`}
          >
            {todayStatusLabel}
          </div>
          <p className="attendance-today-text">{todayMessage}</p>

          <div className="attendance-today-grid">
            <div>
              <span>Check in</span>
              <strong>{formatTime(todayRecord?.checkIn)}</strong>
            </div>
            <div>
              <span>Check out</span>
              <strong>{formatTime(todayRecord?.checkOut)}</strong>
            </div>
            <div>
              <span>Hours</span>
              <strong>
                {formatHours(
                  todayRecord?.workingHours,
                  todayRecord?.checkIn,
                  todayRecord?.checkOut,
                )}
              </strong>
            </div>
            <div>
              <span>Date</span>
              <strong>{todayDateLabel}</strong>
            </div>
          </div>

          <div className="attendance-cta-group">
            <button
              type="button"
              className="attendance-action-btn primary"
              onClick={() => handleAttendanceAction("check-in")}
              disabled={!canCheckIn}
            >
              <FiLogIn />
              {submittingAction === "check-in"
                ? "Checking in..."
                : todayRecord?.checkIn
                  ? "Checked In"
                  : "Check In"}
            </button>

            <button
              type="button"
              className="attendance-action-btn secondary"
              onClick={() => handleAttendanceAction("check-out")}
              disabled={!canCheckOut}
            >
              <FiLogOut />
              {submittingAction === "check-out"
                ? "Checking out..."
                : todayRecord?.checkOut
                  ? "Checked Out"
                  : "Check Out"}
            </button>
          </div>
        </div>
      </section>

      {notice && (
        <div className={`attendance-notice is-${notice.type}`}>{notice.message}</div>
      )}

      <section className="attendance-summary-grid">
        {summaryCards.map((card) => (
          <article
            key={card.key}
            className={`attendance-summary-card is-${card.key}`}
          >
            <span className="attendance-card-label">{card.label}</span>
            <h3>{card.value}</h3>
            <p>{card.description}</p>
          </article>
        ))}
      </section>

      <section className="attendance-panel attendance-toolbar">
        <div className="attendance-toolbar-main">
          <div>
            <span className="attendance-card-label">Viewing</span>
            <h2>{selectedMonthLabel}</h2>
            <p>
              Switch between months to review your attendance history and recent
              check-in patterns.
            </p>
          </div>

          <div className="attendance-nav-buttons">
            <button type="button" onClick={prevMonth} aria-label="Previous month">
              <FiArrowLeft />
            </button>
            <button type="button" onClick={nextMonth} aria-label="Next month">
              <FiArrowRight />
            </button>
          </div>
        </div>

        <div className="attendance-toolbar-filters">
          <label className="attendance-select-field">
            <span>Month</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {MONTHS.map((month, index) => (
                <option key={month} value={index}>
                  {month}
                </option>
              ))}
            </select>
          </label>

          <label className="attendance-select-field">
            <span>Year</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="attendance-panel">
        <div className="attendance-panel-head">
          <div>
            <span className="attendance-card-label">Monthly calendar</span>
            <h2>Attendance snapshot</h2>
            <p>
              A quick visual overview of your recorded status for each day in{" "}
              {selectedMonthLabel}.
            </p>
          </div>

          <div className="attendance-legend">
            {["present", "late", "half-day", "absent", "sunday"].map((key) => (
              <div key={key} className="attendance-legend-item">
                <span className={`attendance-status-dot is-${key}`}></span>
                {STATUS_META[key].label}
              </div>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="attendance-panel-message">
            Loading your attendance records...
          </div>
        ) : (
          <div className="attendance-calendar-shell">
            <div className="attendance-calendar-weekdays">
              {WEEK_DAYS.map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>

            <div className="attendance-calendar-grid">
              {calendarCells.map((cell) =>
                cell.isEmpty ? (
                  <div
                    key={cell.key}
                    className="attendance-calendar-cell is-empty"
                  ></div>
                ) : (
                  <div
                    key={cell.key}
                    className={`attendance-calendar-cell is-${cell.statusKey} ${
                      cell.isToday ? "is-today" : ""
                    }`}
                  >
                    <div className="attendance-calendar-day">
                      <strong>{cell.dayNumber}</strong>
                      {cell.isToday && <span>Today</span>}
                    </div>

                    <span
                      className={`attendance-status-badge is-${cell.statusKey}`}
                    >
                      <span className="attendance-status-full">
                        {cell.statusLabel}
                      </span>
                      <span className="attendance-status-short">
                        {cell.shortStatus}
                      </span>
                    </span>

                    <small className="attendance-calendar-time">
                      {cell.hasData ? cell.checkInLabel : "No log"}
                    </small>
                  </div>
                ),
              )}
            </div>
          </div>
        )}
      </section>

      <AttendanceList
        selectedLabel={selectedMonthLabel}
        records={attendanceRecords}
        isFutureView={isFutureView}
      />
    </div>
  );
};

export default Attendance;
