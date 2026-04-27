import "../../assets/styles/dashboard.css";
import TodayBirthdayCard from "../../components/TodayBirthdayCard";
import useDashboard from "../../hooks/useDashboard";
import { useAuth } from "../../context/AuthContext";

const Dashboard = () => {
  const { data, loading } = useDashboard();
  const { user } = useAuth();

  const employees = data.employees || [];
  const attendance = data.attendance || [];
  const leaves = data.leaves || [];
  const holidays = data.holidays || [];

  console.log("EMPLOYEES:", employees);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ✅ DATE FORMATTER
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
    });

  // 🔥 ✅ FIXED BIRTHDAYS (MATCH ADMIN LOGIC)
  const upcomingBirthdays = employees
    .filter((emp) => emp.dob)
    .slice(0, 5)
    .map((emp) => ({
      ...emp,
      nextBirthday: new Date(emp.dob),
    }));

  // ✅ ANNIVERSARY (FIXED FIELD)
  const anniversaries = employees.filter((emp) => {
    if (!emp.joinDate) return false;

    const join = new Date(emp.joinDate);

    return (
      join.getDate() === today.getDate() &&
      join.getMonth() === today.getMonth()
    );
  });

  // ✅ HOLIDAYS
  const upcomingHolidays = holidays.filter(
    (holiday) => new Date(holiday.date) >= today
  );

  if (loading) {
    return <div className="container-fluid">Loading...</div>;
  }

  return (
    <div className="dashboard-page container-fluid">
      <div className="dashboard-card d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
        <div className="welcome-section">
          <h2 className="mb-1">
            Welcome {user?.firstName} {user?.lastName}
          </h2>
          <p className="mb-0 text-muted">Let's Make Today Productive</p>
        </div>

        <div className="time-section text-md-end">
          <p className="mb-1">
            {today.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <h2 className="mb-0">
            {today.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </h2>
        </div>
      </div>

      <div className="row g-4 mt-2">
        {/* Birthdays */}
        <div className="col-12 col-sm-6 col-lg-4">
          <div className="card dashboard-inner-card h-100">
            <h3>🎂 Birthdays</h3>
            <div className="card-body-list">
              {upcomingBirthdays.length > 0 ? (
                upcomingBirthdays.map((emp) => (
                  <div key={emp._id} className="list-item">
                    <span>
                      {emp.firstName} {emp.lastName}
                    </span>
                    <span>{formatDate(emp.nextBirthday)}</span>
                  </div>
                ))
              ) : (
                <p>No birthdays</p>
              )}
            </div>
          </div>
        </div>

        {/* Anniversary */}
        <div className="col-12 col-sm-6 col-lg-4">
          <div className="card dashboard-inner-card h-100">
            <h3>🏆 Work Anniversary</h3>
            <div className="card-body-list">
              {anniversaries.length > 0 ? (
                anniversaries.map((emp) => (
                  <div key={emp._id} className="list-item">
                    <span>
                      {emp.firstName} {emp.lastName}
                    </span>
                    <span>{formatDate(emp.joinDate)}</span>
                  </div>
                ))
              ) : (
                <p>No anniversaries today</p>
              )}
            </div>
          </div>
        </div>

        {/* Today Birthday */}
        <div className="col-12 col-sm-6 col-lg-4">
          <div className="h-100">
            <TodayBirthdayCard employees={employees} />
          </div>
        </div>

        {/* Holidays */}
        <div className="col-12 col-sm-6 col-lg-4">
          <div className="card dashboard-inner-card h-100">
            <h3>🎉 Upcoming Holidays</h3>
            <div className="card-body-list">
              {upcomingHolidays.length > 0 ? (
                upcomingHolidays.map((holiday, index) => (
                  <div key={index} className="list-item">
                    <span>{holiday.name}</span>
                    <span>{formatDate(holiday.date)}</span>
                  </div>
                ))
              ) : (
                <p>No upcoming holidays</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;