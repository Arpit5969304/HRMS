import React from "react";
import "../../assets/styles/AdminDashboard.css";
import { Link } from "react-router-dom";
import useDashboard from "../../hooks/useDashboard";
import { useAuth } from "../../context/AuthContext";

const AdminDashboard = () => {
  const today = new Date();

  const { data, loading } = useDashboard(); // 🔥 hook use
  const { user } = useAuth();

  const employees = data.employees || [];
  const attendance = data.attendance || [];
  const leaves = data.leaves || [];
  const holidays = data.holidays || [];

  // ✅ CALCULATIONS
  const todayStr = new Date().toDateString();

  const presentCount = attendance.filter(
    (a) =>
      new Date(a.date).toDateString() === todayStr && a.checkIn
  ).length;

  const pendingLeaves = leaves.filter(
    (l) => l.status === "Pending"
  ).length;

  const onLeave = leaves.filter((l) => {
    const now = new Date();
    return (
      new Date(l.fromDate) <= now &&
      new Date(l.toDate) >= now &&
      l.status === "Approved"
    );
  }).length;

  // ✅ SUMMARY DATA (REPLACED)
  const summaryData = [
    { title: "Total Employees", value: employees.length, color: "#e7e7ff" },
    { title: "Present", value: presentCount, color: "#ffe6f0" },
    { title: "Leave Request", value: pendingLeaves, color: "#fff5cc" },
    { title: "On Leave", value: onLeave, color: "#ffe6d6" },
  ];

  // ✅ UPCOMING BIRTHDAYS
  const upcomingBirthdays = employees
    .filter((e) => e.dob)
    .slice(0, 5)
    .map((e) => ({
      name: e.firstName + " " + e.lastName,
      date: new Date(e.dob).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      }),
    }));

  // ✅ UPCOMING HOLIDAYS
  const upcomingHolidays = holidays.slice(0, 5).map((h) => ({
    name: h.name,
    date: new Date(h.date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    }),
  }));

  return (
    <div className="dashboard-container">
      <div className="dashboard-grid">

        {/* LEFT SIDE */}
        <div className="left-side">

          {/* Welcome */}
          <div className="welcome-banner">
            <div>
              <h2>Welcome {user?.firstName || "Admin"} 👋</h2>
              <p>Let’s make today productive!</p>
            </div>

            <div className="banner-time">
              <div>
                {today.toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <div>
                {today.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="summary-grid">
            {summaryData.map((card, index) => {
              let link = "#";
              switch (card.title.toLowerCase()) {
                case "total employees":
                  link = "/admin/manage";
                  break;
                case "present":
                  link = "/admin/manageAttendance";
                  break;
                case "leave request":
                  link = "/admin/manageLeave";
                  break;
                case "on leave":
                  link = "/admin/manageLeave";
                  break;
                default:
                  link = "/admin/dashboard";
              }

              return (
                <div
                  key={index}
                  className="summary-card"
                  style={{ backgroundColor: card.color }}
                >
                  <div className="card-title">{card.title}</div>
                  <h3 className="card-value">
                    {loading ? "..." : card.value}
                  </h3>
                  <Link to={link} className="btn btn-light btn-sm mt-2">
                    View Details
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Bottom Section */}
          <div className="bottom-grid">
            <div className="info-card">
              <h3>Upcoming Holiday</h3>
              {loading ? (
                <p>Loading...</p>
              ) : upcomingHolidays.length > 0 ? (
                upcomingHolidays.map((h, i) => (
                  <div key={i} className="item-card">
                    {h.name} <span>{h.date}</span>
                  </div>
                ))
              ) : (
                <p>No holidays</p>
              )}
            </div>

            <div className="info-card">
              <h3>Upcoming Birthday</h3>
              {loading ? (
                <p>Loading...</p>
              ) : upcomingBirthdays.length > 0 ? (
                upcomingBirthdays.map((b, i) => (
                  <div key={i} className="item-card">
                    {b.name} <span>{b.date}</span>
                  </div>
                ))
              ) : (
                <p>No birthdays</p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="right-side">

          {/* Filter */}
          <div className="filter-card">
            <h3>Filter</h3>
            <div className="filter-row">
              <div className="custom-select">
                <select>
                  <option>January</option>
                  <option>February</option>
                  <option>March</option>
                </select>
              </div>

              <div className="custom-select">
                <select>
                  <option>2026</option>
                  <option>2025</option>
                </select>
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="calendar-box">
            <h3>Calendar</h3>
            <p>Live data connected 🎯</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;