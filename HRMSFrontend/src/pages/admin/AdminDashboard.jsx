import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BsArrowRight,
  BsBarChartLine,
  BsBriefcase,
  BsCalendarCheck,
  BsCalendarEvent,
  BsClockHistory,
  BsMegaphone,
  BsPeople,
  BsPersonBadge,
} from "react-icons/bs";
import "../../assets/styles/AdminDashboard.css";
import useDashboard from "../../hooks/useDashboard";
import { useAuth } from "../../context/AuthContext";

const formatShortDate = (value) =>
  new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });

const getNextBirthday = (dob, referenceDate) => {
  const birthday = new Date(dob);
  const nextBirthday = new Date(
    referenceDate.getFullYear(),
    birthday.getMonth(),
    birthday.getDate(),
  );

  if (nextBirthday < referenceDate) {
    nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
  }

  return nextBirthday;
};

const AdminDashboard = () => {
  const [now, setNow] = useState(() => new Date());
  const { data, loading } = useDashboard();
  const { user } = useAuth();

  useEffect(() => {
    const clockId = window.setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => window.clearInterval(clockId);
  }, []);

  const employees = Array.isArray(data.employees) ? data.employees : [];
  const attendance = Array.isArray(data.attendance) ? data.attendance : [];
  const leaves = Array.isArray(data.leaves) ? data.leaves : [];
  const holidays = Array.isArray(data.holidays)
    ? data.holidays
    : data.holidays?.data || [];

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayKey = todayStart.toDateString();

  const activeEmployees = employees.filter(
    (employee) =>
      employee?.status !== "inactive" && employee?.status !== "terminated",
  );

  const todayAttendance = attendance.filter(
    (entry) => entry?.date && new Date(entry.date).toDateString() === todayKey,
  );

  const presentCount = todayAttendance.filter((entry) => entry?.checkIn).length;
  const lateCount = todayAttendance.filter(
    (entry) => entry?.status === "late",
  ).length;
  const halfDayCount = todayAttendance.filter(
    (entry) => entry?.status === "half-day",
  ).length;
  const pendingLeaves = leaves.filter(
    (leave) => leave?.status === "Pending",
  ).length;
  const approvedLeaves = leaves.filter(
    (leave) => leave?.status === "Approved",
  ).length;
  const onLeaveCount = leaves.filter((leave) => {
    if (!leave?.fromDate || !leave?.toDate || leave?.status !== "Approved") {
      return false;
    }

    const leaveStart = new Date(leave.fromDate);
    leaveStart.setHours(0, 0, 0, 0);

    const leaveEnd = new Date(leave.toDate);
    leaveEnd.setHours(23, 59, 59, 999);

    return leaveStart <= now && leaveEnd >= now;
  }).length;

  const attendanceRate = activeEmployees.length
    ? Math.round((presentCount / activeEmployees.length) * 100)
    : 0;

  const approvalRate = leaves.length
    ? Math.round((approvedLeaves / leaves.length) * 100)
    : 0;

  const departmentBreakdown = activeEmployees.reduce((acc, employee) => {
    const department = employee?.department || "General";
    acc[department] = (acc[department] || 0) + 1;
    return acc;
  }, {});

  const departmentStats = Object.entries(departmentBreakdown)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 4)
    .map(([name, count]) => ({
      name,
      count,
      share: activeEmployees.length
        ? Math.round((count / activeEmployees.length) * 100)
        : 0,
    }));

  const topDepartmentCount = departmentStats[0]?.count || 0;

  const upcomingBirthdays = employees
    .filter((employee) => employee?.dob)
    .map((employee) => {
      const nextBirthday = getNextBirthday(employee.dob, todayStart);

      return {
        id: employee._id,
        name:
          `${employee.firstName || ""} ${employee.lastName || ""}`.trim() ||
          "Team member",
        department: employee.department || "General",
        nextBirthday,
      };
    })
    .sort((employeeA, employeeB) => employeeA.nextBirthday - employeeB.nextBirthday)
    .slice(0, 4);

  const upcomingHolidays = holidays
    .filter((holiday) => holiday?.date && new Date(holiday.date) >= todayStart)
    .sort((holidayA, holidayB) => new Date(holidayA.date) - new Date(holidayB.date))
    .slice(0, 4)
    .map((holiday) => ({
      id: holiday._id,
      name: holiday.name,
      type: holiday.type || "Holiday",
      date: new Date(holiday.date),
    }));

  const adminName =
    user?.firstName || user?.fullName || user?.name || "Admin";

  const summaryCards = [
    {
      title: "Active employees",
      value: activeEmployees.length,
      note: `${Object.keys(departmentBreakdown).length} departments in sync`,
      to: "/admin/manage",
      icon: BsPeople,
      tone: "tone-sky",
    },
    {
      title: "Checked in today",
      value: presentCount,
      note: `${attendanceRate}% attendance so far`,
      to: "/admin/manageAttendance",
      icon: BsCalendarCheck,
      tone: "tone-mint",
    },
    {
      title: "Pending leave requests",
      value: pendingLeaves,
      note: pendingLeaves ? "Waiting for approval" : "Leave queue is clear",
      to: "/admin/manageLeave",
      icon: BsClockHistory,
      tone: "tone-amber",
    },
    {
      title: "Employees on leave",
      value: onLeaveCount,
      note: approvedLeaves
        ? `${approvalRate}% leave approval rate`
        : "No approved leave records yet",
      to: "/admin/manageLeave",
      icon: BsBriefcase,
      tone: "tone-coral",
    },
  ];

  const quickActions = [
    {
      title: "Manage employees",
      description: "Review records, profiles, and current team data.",
      to: "/admin/manage",
      icon: BsPeople,
    },
    {
      title: "Attendance desk",
      description: "Track check-ins, late arrivals, and attendance updates.",
      to: "/admin/manageAttendance",
      icon: BsCalendarEvent,
    },
    {
      title: "Company updates",
      description: "Post announcements and keep the team informed.",
      to: "/admin/companyAnnouncement",
      icon: BsMegaphone,
    },
    {
      title: "Employee profiles",
      description: "Open profile insights and supporting HR details.",
      to: "/admin/employeeProfile",
      icon: BsPersonBadge,
    },
  ];

  const pulseStats = [
    {
      label: "Late arrivals",
      value: lateCount,
      helper: lateCount ? "Needs follow-up today" : "Everyone is on time",
    },
    {
      label: "Half days",
      value: halfDayCount,
      helper: halfDayCount ? "Check working hours" : "No half-day flags",
    },
    {
      label: "Leave approvals",
      value: approvedLeaves,
      helper: approvedLeaves ? "Approved successfully" : "No approvals yet",
    },
  ];

  const attentionLabel =
    pendingLeaves || lateCount || halfDayCount ? "Needs attention" : "All smooth";

  return (
    <div className="admin-dashboard-page">
      <section className="admin-hero">
        <div className="hero-copy">
          <span className="hero-chip">Admin workspace</span>
          <h1>Welcome back, {adminName}</h1>
          <p>
            Keep your team moving with a cleaner view of attendance, leave,
            and upcoming events.
          </p>

          <div className="hero-highlights">
            <div className="highlight-pill">
              <span>Attendance</span>
              <strong>{loading ? "..." : `${attendanceRate}%`}</strong>
            </div>
            <div className="highlight-pill">
              <span>Pending approvals</span>
              <strong>{loading ? "..." : pendingLeaves}</strong>
            </div>
            <div className="highlight-pill">
              <span>Upcoming holidays</span>
              <strong>{loading ? "..." : upcomingHolidays.length}</strong>
            </div>
          </div>
        </div>

        <div className="hero-panel">
          <p className="hero-panel-label">Today</p>
          <h2>
            {now.toLocaleDateString("en-GB", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </h2>
          <div className="hero-time">
            {now.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <p className="hero-panel-note">
            {loading
              ? "Syncing the latest team activity."
              : `${attendanceRate}% of active employees have checked in today.`}
          </p>
        </div>
      </section>

      <section className="summary-grid">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <article key={card.title} className={`summary-card ${card.tone}`}>
              <div className="summary-card-top">
                <div>
                  <span className="summary-label">{card.title}</span>
                  <h3 className="summary-value">
                    {loading ? "..." : card.value}
                  </h3>
                </div>
                <div className="summary-icon">
                  <Icon />
                </div>
              </div>

              <p className="summary-note">{card.note}</p>

              <Link to={card.to} className="summary-link">
                Open
                <BsArrowRight />
              </Link>
            </article>
          );
        })}
      </section>

      <section className="insights-grid">
        <article className="dashboard-panel">
          <div className="panel-header">
            <div>
              <span className="panel-eyebrow">Team pulse</span>
              <h3>Daily workforce snapshot</h3>
            </div>
            <span className="panel-badge">{attentionLabel}</span>
          </div>

          <div className="attendance-meter">
            <div className="meter-copy">
              <div>
                <strong>{loading ? "..." : `${attendanceRate}%`}</strong>
                <span>Daily attendance coverage</span>
              </div>
              <div className="meter-meta">
                {loading ? "Updating..." : `${presentCount} of ${activeEmployees.length}`}
              </div>
            </div>
            <div className="meter-track">
              <div
                className="meter-fill"
                style={{ width: `${loading ? 18 : attendanceRate}%` }}
              ></div>
            </div>
          </div>

          <div className="pulse-grid">
            {pulseStats.map((stat) => (
              <div key={stat.label} className="mini-stat-card">
                <span>{stat.label}</span>
                <strong>{loading ? "..." : stat.value}</strong>
                <p>{stat.helper}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard-panel">
          <div className="panel-header">
            <div>
              <span className="panel-eyebrow">Quick actions</span>
              <h3>Jump into admin work</h3>
            </div>
            <BsBarChartLine className="panel-header-icon" />
          </div>

          <div className="quick-actions-grid">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link key={action.title} to={action.to} className="action-card">
                  <div className="action-icon">
                    <Icon />
                  </div>
                  <div>
                    <h4>{action.title}</h4>
                    <p>{action.description}</p>
                  </div>
                  <span className="action-link">
                    Open
                    <BsArrowRight />
                  </span>
                </Link>
              );
            })}
          </div>
        </article>
      </section>

      <section className="details-grid">
        <article className="dashboard-panel">
          <div className="panel-header">
            <div>
              <span className="panel-eyebrow">Plan ahead</span>
              <h3>Upcoming holidays</h3>
            </div>
          </div>

          <div className="list-stack">
            {loading ? (
              <p className="empty-state">Loading holiday calendar...</p>
            ) : upcomingHolidays.length ? (
              upcomingHolidays.map((holiday) => (
                <div key={holiday.id || holiday.name} className="list-item-card">
                  <div>
                    <small>{holiday.type}</small>
                    <strong>{holiday.name}</strong>
                  </div>
                  <span>{formatShortDate(holiday.date)}</span>
                </div>
              ))
            ) : (
              <p className="empty-state">No upcoming holidays added yet.</p>
            )}
          </div>
        </article>

        <article className="dashboard-panel">
          <div className="panel-header">
            <div>
              <span className="panel-eyebrow">Celebrate your team</span>
              <h3>Upcoming birthdays</h3>
            </div>
          </div>

          <div className="list-stack">
            {loading ? (
              <p className="empty-state">Loading birthday reminders...</p>
            ) : upcomingBirthdays.length ? (
              upcomingBirthdays.map((employee) => (
                <div key={employee.id || employee.name} className="list-item-card">
                  <div>
                    <small>{employee.department}</small>
                    <strong>{employee.name}</strong>
                  </div>
                  <span>{formatShortDate(employee.nextBirthday)}</span>
                </div>
              ))
            ) : (
              <p className="empty-state">No birthdays found right now.</p>
            )}
          </div>
        </article>

        <article className="dashboard-panel">
          <div className="panel-header">
            <div>
              <span className="panel-eyebrow">Team mix</span>
              <h3>Department snapshot</h3>
            </div>
          </div>

          <div className="department-list">
            {loading ? (
              <p className="empty-state">Loading department split...</p>
            ) : departmentStats.length ? (
              departmentStats.map((department) => (
                <div key={department.name} className="department-row">
                  <div className="department-top">
                    <span>{department.name}</span>
                    <strong>{department.count}</strong>
                  </div>
                  <div className="department-bar">
                    <div
                      className="department-fill"
                      style={{
                        width: `${
                          topDepartmentCount
                            ? (department.count / topDepartmentCount) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                  <small>{department.share}% of active team</small>
                </div>
              ))
            ) : (
              <p className="empty-state">No department data available yet.</p>
            )}
          </div>
        </article>
      </section>
    </div>
  );
};

export default AdminDashboard;
