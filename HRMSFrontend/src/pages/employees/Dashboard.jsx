import { useEffect, useState } from "react";
import {
  BsArrowRight,
  BsBell,
  BsBriefcase,
  BsCalendar2Check,
  BsCalendar3,
  BsCashStack,
  BsCheckCircle,
  BsClock,
  BsGraphUpArrow,
  BsMegaphone,
  BsPersonBadge,
  BsStars,
} from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../utils/axios";
import "../../assets/styles/dashboard.css";

const extractArray = (response) => {
  const payload = response?.data;

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.records)) return payload.data.records;
  if (Array.isArray(payload?.records)) return payload.records;

  return [];
};

const extractObject = (response) => response?.data?.data || response?.data || null;

const formatDate = (value, options) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString(
    "en-IN",
    options || {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );
};

const formatTime = (value) => {
  const date = new Date(value);

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatMoney = (value) =>
  `Rs. ${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

const getEmployeeName = (employee) =>
  [employee?.firstName, employee?.lastName].filter(Boolean).join(" ") ||
  employee?.fullName ||
  employee?.employeeId ||
  "Team member";

const getStatusMeta = (status) => {
  const normalized = status?.toLowerCase();

  if (normalized === "present") {
    return {
      label: "Present",
      tone: "is-present",
      helper: "Your attendance is marked on time.",
    };
  }

  if (normalized === "late") {
    return {
      label: "Late",
      tone: "is-late",
      helper: "Your check-in was recorded after the regular start time.",
    };
  }

  if (normalized === "half-day") {
    return {
      label: "Half Day",
      tone: "is-half-day",
      helper: "A short workday has been recorded for today.",
    };
  }

  if (normalized === "absent") {
    return {
      label: "Absent",
      tone: "is-absent",
      helper: "No active attendance has been logged for today.",
    };
  }

  return {
    label: "Not Marked",
    tone: "is-neutral",
    helper: "Check in from the attendance page to start the day.",
  };
};

const getPriorityTone = (priority) => {
  if (priority === "High") return "is-high";
  if (priority === "Medium") return "is-medium";
  return "is-normal";
};

const getDaysUntil = (date, referenceDate) => {
  const start = new Date(referenceDate);
  start.setHours(0, 0, 0, 0);

  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  return Math.ceil((target - start) / (1000 * 60 * 60 * 24));
};

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

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    employees: [],
    attendance: [],
    leaves: [],
    holidays: [],
    announcements: [],
    tasks: [],
    salary: null,
  });
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const clockId = window.setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => window.clearInterval(clockId);
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setNotice("");

        const results = await Promise.allSettled([
          API.get("/employees"),
          API.get("/attendance/me"),
          API.get("/leave/my"),
          API.get("/holidays"),
          API.get("/announcements"),
          API.get("/tasks/my"),
          API.get("/salary/my"),
        ]);

        const [
          employeesResult,
          attendanceResult,
          leavesResult,
          holidaysResult,
          announcementsResult,
          tasksResult,
          salaryResult,
        ] = results;

        setDashboardData({
          employees:
            employeesResult.status === "fulfilled"
              ? extractArray(employeesResult.value)
              : [],
          attendance:
            attendanceResult.status === "fulfilled"
              ? extractArray(attendanceResult.value)
              : [],
          leaves:
            leavesResult.status === "fulfilled"
              ? extractArray(leavesResult.value)
              : [],
          holidays:
            holidaysResult.status === "fulfilled"
              ? extractArray(holidaysResult.value)
              : [],
          announcements:
            announcementsResult.status === "fulfilled"
              ? extractArray(announcementsResult.value)
              : [],
          tasks:
            tasksResult.status === "fulfilled"
              ? extractArray(tasksResult.value)
              : [],
          salary:
            salaryResult.status === "fulfilled"
              ? extractObject(salaryResult.value)
              : null,
        });

        const failures = results.filter((result) => result.status === "rejected");
        if (failures.length) {
          setNotice(
            "Some live dashboard details could not be loaded. The page is showing the information that is available.",
          );
        }
      } catch (error) {
        setNotice("We could not load the dashboard right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const employees = dashboardData.employees;
  const attendanceRecords = dashboardData.attendance;
  const leaveRecords = dashboardData.leaves;
  const holidays = dashboardData.holidays;
  const announcements = dashboardData.announcements;
  const tasks = dashboardData.tasks;
  const salary = dashboardData.salary;

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const todayAttendance = attendanceRecords.find((entry) => {
    const attendanceDate = new Date(entry.date);
    attendanceDate.setHours(0, 0, 0, 0);
    return attendanceDate.getTime() === today.getTime();
  });

  const attendanceMeta = getStatusMeta(todayAttendance?.status);
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const currentMonthAttendance = attendanceRecords.filter((entry) => {
    const attendanceDate = new Date(entry.date);
    return attendanceDate >= firstDayOfMonth && attendanceDate <= today;
  });

  const presentDays = currentMonthAttendance.filter(
    (entry) => entry.status === "present",
  ).length;
  const lateDays = currentMonthAttendance.filter(
    (entry) => entry.status === "late",
  ).length;
  const halfDays = currentMonthAttendance.filter(
    (entry) => entry.status === "half-day",
  ).length;
  const absentDays = currentMonthAttendance.filter(
    (entry) => entry.status === "absent",
  ).length;

  let workingDaysElapsed = 0;
  for (
    const cursor = new Date(firstDayOfMonth);
    cursor <= today;
    cursor.setDate(cursor.getDate() + 1)
  ) {
    if (cursor.getDay() !== 0) {
      workingDaysElapsed += 1;
    }
  }

  const attendanceUnits = presentDays + lateDays + halfDays * 0.5;
  const attendanceRate = workingDaysElapsed
    ? Math.round((attendanceUnits / workingDaysElapsed) * 100)
    : 0;

  const activeTasks = tasks
    .filter((task) => task.status !== "Completed")
    .sort((taskA, taskB) => new Date(taskA.deadline) - new Date(taskB.deadline));
  const completedTasks = tasks.filter((task) => task.status === "Completed").length;
  const taskCompletionRate = tasks.length
    ? Math.round((completedTasks / tasks.length) * 100)
    : 0;
  const nextTask = activeTasks[0] || null;
  const urgentTasks = activeTasks.filter((task) => task.priority === "High").length;

  const pendingLeaves = leaveRecords.filter((leave) => leave.status === "Pending");
  const approvedLeaves = leaveRecords.filter((leave) => leave.status === "Approved");
  const nextApprovedLeave =
    approvedLeaves
      .filter((leave) => new Date(leave.fromDate) >= today)
      .sort((leaveA, leaveB) => new Date(leaveA.fromDate) - new Date(leaveB.fromDate))[0] ||
    null;

  const upcomingHolidays = holidays
    .filter((holiday) => holiday?.date && new Date(holiday.date) >= today)
    .sort((holidayA, holidayB) => new Date(holidayA.date) - new Date(holidayB.date))
    .slice(0, 4);

  const upcomingBirthdays = employees
    .filter((employee) => employee?.dob)
    .map((employee) => {
      const nextBirthday = getNextBirthday(employee.dob, today);

      return {
        id: employee._id,
        name: getEmployeeName(employee),
        department: employee.department || "Team",
        nextBirthday,
        daysUntil: getDaysUntil(nextBirthday, today),
      };
    })
    .filter((employee) => employee.daysUntil <= 30)
    .sort((employeeA, employeeB) => employeeA.nextBirthday - employeeB.nextBirthday)
    .slice(0, 3);

  const anniversaries = employees
    .filter((employee) => employee?.joinDate)
    .map((employee) => {
      const joinDate = new Date(employee.joinDate);
      const nextAnniversary = new Date(
        today.getFullYear(),
        joinDate.getMonth(),
        joinDate.getDate(),
      );

      if (nextAnniversary < today) {
        nextAnniversary.setFullYear(nextAnniversary.getFullYear() + 1);
      }

      return {
        id: employee._id,
        name: getEmployeeName(employee),
        department: employee.department || "Team",
        nextAnniversary,
        daysUntil: getDaysUntil(nextAnniversary, today),
      };
    })
    .filter((employee) => employee.daysUntil <= 30)
    .sort(
      (employeeA, employeeB) =>
        employeeA.nextAnniversary - employeeB.nextAnniversary,
    )
    .slice(0, 3);

  const currentSalary = Number(salary?.netSalary || salary?.totalSalary || 0);
  const highlightAnnouncement = announcements[0] || null;
  const actionName = user?.firstName || user?.fullName || "Teammate";
  const greeting =
    now.getHours() < 12
      ? "Good morning"
      : now.getHours() < 18
        ? "Good afternoon"
        : "Good evening";

  const summaryCards = [
    {
      title: "Today",
      value: loading ? "..." : attendanceMeta.label,
      note: loading ? "Syncing attendance" : attendanceMeta.helper,
      icon: BsCalendar2Check,
      tone: attendanceMeta.tone,
    },
    {
      title: "Open tasks",
      value: loading ? "..." : activeTasks.length,
      note: loading
        ? "Fetching your work items"
        : nextTask
          ? `Next due ${formatDate(nextTask.deadline, {
              day: "numeric",
              month: "short",
            })}`
          : "No pending tasks right now",
      icon: BsBriefcase,
      tone: "is-blue",
    },
    {
      title: "Leave requests",
      value: loading ? "..." : pendingLeaves.length,
      note: loading
        ? "Checking request status"
        : pendingLeaves.length
          ? "Waiting for manager approval"
          : "No pending leave requests",
      icon: BsClock,
      tone: "is-gold",
    },
    {
      title: "Current salary",
      value: loading ? "..." : currentSalary ? formatMoney(currentSalary) : "N/A",
      note: loading
        ? "Pulling salary summary"
        : currentSalary
          ? "Latest saved salary structure"
          : "Salary details are not available yet",
      icon: BsCashStack,
      tone: "is-mint",
    },
  ];

  const quickActions = [
    {
      title: "Attendance",
      description: "Check in, review the calendar, and keep your month on track.",
      to: "/employee/attendance",
      icon: BsCalendar3,
    },
    {
      title: "My Profile",
      description: "Update personal details and review your employee record.",
      to: "/employee/profile",
      icon: BsPersonBadge,
    },
    {
      title: "Leave Desk",
      description: "Raise a leave request and watch approval progress.",
      to: "/employee/leave",
      icon: BsCheckCircle,
    },
    {
      title: "My Tasks",
      description: "See deadlines, priorities, and current task status.",
      to: "/employee/MyTasks",
      icon: BsBriefcase,
    },
    {
      title: "Salary Info",
      description: "Review your salary records and payroll details.",
      to: "/employee/salaryInfo",
      icon: BsCashStack,
    },
    {
      title: "Announcements",
      description: "Catch up on company-wide updates and notices.",
      to: "/employee/EmployeeAnnouncement",
      icon: BsMegaphone,
    },
  ];

  return (
    <div className="employee-dashboard-page">
      <section className="employee-dashboard-hero">
        <div className="dashboard-hero-copy">
          <span className="dashboard-kicker">Employee workspace</span>
          <h1>
            {greeting}, {actionName}
          </h1>
          <p>
            Keep a clean view of your attendance, task flow, leave requests,
            and company updates from one place.
          </p>

          <div className="dashboard-highlight-row">
            <span>
              <BsGraphUpArrow />
              {loading ? "..." : `${attendanceRate}% attendance pace`}
            </span>
            <span>
              <BsBriefcase />
              {loading ? "..." : `${activeTasks.length} active tasks`}
            </span>
            <span>
              <BsBell />
              {loading ? "..." : `${announcements.length} active updates`}
            </span>
          </div>

          <div className="dashboard-hero-actions">
            <button
              type="button"
              className="hero-action primary"
              onClick={() => navigate("/employee/attendance")}
            >
              Open Attendance
            </button>
            <button
              type="button"
              className="hero-action secondary"
              onClick={() => navigate("/employee/profile")}
            >
              View Profile
            </button>
          </div>
        </div>

        <div className="dashboard-hero-panel">
          <span className="dashboard-kicker">Today</span>
          <h2>
            {now.toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </h2>
          <div className="dashboard-hero-time">{formatTime(now)}</div>

          <div className={`hero-status-card ${attendanceMeta.tone}`}>
            <span>Attendance status</span>
            <strong>{loading ? "Syncing..." : attendanceMeta.label}</strong>
            <p>{loading ? "Please wait a moment." : attendanceMeta.helper}</p>
          </div>

          <div className="hero-mini-list">
            <div>
              <span>Next task</span>
              <strong>{loading ? "Loading..." : nextTask?.title || "No pending task"}</strong>
            </div>
            <div>
              <span>Upcoming holiday</span>
              <strong>
                {loading
                  ? "Loading..."
                  : upcomingHolidays[0]
                    ? `${upcomingHolidays[0].name} - ${formatDate(upcomingHolidays[0].date, {
                        day: "numeric",
                        month: "short",
                      })}`
                    : "No upcoming holidays"}
              </strong>
            </div>
          </div>
        </div>
      </section>

      {notice && <div className="dashboard-notice">{notice}</div>}

      <section className="employee-summary-grid">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.title}
              className={`employee-summary-card ${card.tone}`}
            >
              <div className="employee-summary-top">
                <div>
                  <span>{card.title}</span>
                  <h3>{card.value}</h3>
                </div>
                <div className="employee-summary-icon">
                  <Icon />
                </div>
              </div>
              <p>{card.note}</p>
            </article>
          );
        })}
      </section>

      <section className="employee-dashboard-main-grid">
        <article className="employee-dashboard-panel">
          <div className="employee-panel-header">
            <div>
              <span className="dashboard-kicker">Monthly momentum</span>
              <h3>Attendance performance</h3>
            </div>
            <span className="employee-panel-pill">
              {loading ? "..." : `${attendanceRate}%`}
            </span>
          </div>

          <div className="attendance-progress-block">
            <div className="attendance-progress-copy">
              <strong>{loading ? "..." : `${attendanceRate}%`}</strong>
              <p>
                {loading
                  ? "Refreshing this month's activity."
                  : `${presentDays + lateDays + halfDays} attendance records tracked this month.`}
              </p>
            </div>

            <div className="attendance-progress-track">
              <div
                className="attendance-progress-fill"
                style={{ width: `${loading ? 15 : attendanceRate}%` }}
              ></div>
            </div>
          </div>

          <div className="attendance-metric-grid">
            <div className="attendance-metric">
              <span>Present</span>
              <strong>{loading ? "..." : presentDays}</strong>
            </div>
            <div className="attendance-metric">
              <span>Late</span>
              <strong>{loading ? "..." : lateDays}</strong>
            </div>
            <div className="attendance-metric">
              <span>Half Day</span>
              <strong>{loading ? "..." : halfDays}</strong>
            </div>
            <div className="attendance-metric">
              <span>Absent</span>
              <strong>{loading ? "..." : absentDays}</strong>
            </div>
          </div>
        </article>

        <article className="employee-dashboard-panel">
          <div className="employee-panel-header">
            <div>
              <span className="dashboard-kicker">Quick actions</span>
              <h3>Jump into your workday</h3>
            </div>
            <BsStars className="employee-panel-icon" />
          </div>

          <div className="employee-action-grid">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <button
                  key={action.title}
                  type="button"
                  className="employee-action-card"
                  onClick={() => navigate(action.to)}
                >
                  <div className="employee-action-icon">
                    <Icon />
                  </div>
                  <div>
                    <h4>{action.title}</h4>
                    <p>{action.description}</p>
                  </div>
                  <span className="employee-action-link">
                    Open
                    <BsArrowRight />
                  </span>
                </button>
              );
            })}
          </div>
        </article>
      </section>

      <section className="employee-dashboard-detail-grid">
        <article className="employee-dashboard-panel">
          <div className="employee-panel-header">
            <div>
              <span className="dashboard-kicker">Task focus</span>
              <h3>What needs attention</h3>
            </div>
            <span className="employee-panel-pill">
              {loading ? "..." : `${taskCompletionRate}% done`}
            </span>
          </div>

          <div className="employee-list-stack">
            {loading ? (
              <p className="employee-empty-state">Loading your tasks...</p>
            ) : activeTasks.length ? (
              activeTasks.slice(0, 4).map((task) => (
                <div key={task._id} className="employee-list-card">
                  <div>
                    <small className={`priority-pill ${getPriorityTone(task.priority)}`}>
                      {task.priority || "Normal"}
                    </small>
                    <strong>{task.title}</strong>
                    <p>{task.status || "Pending"}</p>
                  </div>
                  <span>
                    {formatDate(task.deadline, {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              ))
            ) : (
              <p className="employee-empty-state">
                No active tasks are assigned right now.
              </p>
            )}
          </div>

          <div className="employee-footnote">
            {loading
              ? "Syncing task deadlines."
              : urgentTasks
                ? `${urgentTasks} high-priority task${urgentTasks === 1 ? "" : "s"} need attention.`
                : "No high-priority tasks at the moment."}
          </div>
        </article>

        <article className="employee-dashboard-panel">
          <div className="employee-panel-header">
            <div>
              <span className="dashboard-kicker">Company updates</span>
              <h3>Recent announcements</h3>
            </div>
            <BsMegaphone className="employee-panel-icon" />
          </div>

          {highlightAnnouncement && !loading && (
            <div className="announcement-highlight">
              <small>{highlightAnnouncement.priority || "Normal"} priority</small>
              <strong>{highlightAnnouncement.title}</strong>
              <p>{highlightAnnouncement.message}</p>
            </div>
          )}

          <div className="employee-list-stack">
            {loading ? (
              <p className="employee-empty-state">Loading announcements...</p>
            ) : announcements.length ? (
              announcements.slice(0, 3).map((item) => (
                <div key={item._id} className="employee-list-card">
                  <div>
                    <small>{item.department || "All teams"}</small>
                    <strong>{item.title}</strong>
                    <p>{formatDate(item.createdAt)}</p>
                  </div>
                  <span>{item.priority || "Normal"}</span>
                </div>
              ))
            ) : (
              <p className="employee-empty-state">
                There are no active announcements right now.
              </p>
            )}
          </div>
        </article>

        <article className="employee-dashboard-panel">
          <div className="employee-panel-header">
            <div>
              <span className="dashboard-kicker">Leave and holidays</span>
              <h3>Plan ahead</h3>
            </div>
            <BsCalendar3 className="employee-panel-icon" />
          </div>

          <div className="dashboard-mini-stats">
            <div>
              <span>Pending requests</span>
              <strong>{loading ? "..." : pendingLeaves.length}</strong>
            </div>
            <div>
              <span>Approved</span>
              <strong>{loading ? "..." : approvedLeaves.length}</strong>
            </div>
          </div>

          <div className="employee-list-stack">
            {loading ? (
              <p className="employee-empty-state">Loading holiday planner...</p>
            ) : upcomingHolidays.length ? (
              upcomingHolidays.map((holiday) => (
                <div key={holiday._id} className="employee-list-card">
                  <div>
                    <small>{holiday.type || "Holiday"}</small>
                    <strong>{holiday.name}</strong>
                    <p>{formatDate(holiday.date)}</p>
                  </div>
                  <span>
                    {getDaysUntil(holiday.date, today) === 0
                      ? "Today"
                      : `${getDaysUntil(holiday.date, today)}d`}
                  </span>
                </div>
              ))
            ) : (
              <p className="employee-empty-state">No upcoming holidays listed yet.</p>
            )}
          </div>

          <div className="employee-footnote">
            {loading
              ? "Checking leave status."
              : nextApprovedLeave
                ? `Next approved leave starts on ${formatDate(nextApprovedLeave.fromDate)}.`
                : "No approved leave is scheduled yet."}
          </div>
        </article>

        <article className="employee-dashboard-panel">
          <div className="employee-panel-header">
            <div>
              <span className="dashboard-kicker">Celebrate your people</span>
              <h3>Birthdays and anniversaries</h3>
            </div>
            <BsStars className="employee-panel-icon" />
          </div>

          <div className="celebration-block">
            <div>
              <h4>Upcoming birthdays</h4>
              <div className="employee-list-stack compact">
                {loading ? (
                  <p className="employee-empty-state">Loading birthdays...</p>
                ) : upcomingBirthdays.length ? (
                  upcomingBirthdays.map((employee) => (
                    <div key={employee.id} className="employee-list-card compact">
                      <div>
                        <small>{employee.department}</small>
                        <strong>{employee.name}</strong>
                      </div>
                      <span>{employee.daysUntil}d</span>
                    </div>
                  ))
                ) : (
                  <p className="employee-empty-state">
                    No birthdays in the next 30 days.
                  </p>
                )}
              </div>
            </div>

            <div>
              <h4>Work anniversaries</h4>
              <div className="employee-list-stack compact">
                {loading ? (
                  <p className="employee-empty-state">Loading anniversaries...</p>
                ) : anniversaries.length ? (
                  anniversaries.map((employee) => (
                    <div key={employee.id} className="employee-list-card compact">
                      <div>
                        <small>{employee.department}</small>
                        <strong>{employee.name}</strong>
                      </div>
                      <span>{employee.daysUntil}d</span>
                    </div>
                  ))
                ) : (
                  <p className="employee-empty-state">
                    No anniversaries in the next 30 days.
                  </p>
                )}
              </div>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
};

export default Dashboard;
