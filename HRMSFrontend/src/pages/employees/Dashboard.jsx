import "../../assets/styles/dashboard.css";
import TodayBirthdayCard from "../../components/TodayBirthdayCard";

const Dashboard = () => {
  const employees = [
    {
      id: 1,
      name: "Kritika Sharma",
      dob: "1998-03-16",
      joiningDate: "2020-03-16",
    },
    {
      id: 2,
      name: "Rahul Verma",
      dob: "1995-03-01",
      joiningDate: "2019-03-01",
    },
    {
      id: 3,
      name: "Anjali Mehta",
      dob: "1997-03-20",
      joiningDate: "2021-03-20",
    },
    {
      id: 4,
      name: "Rohit Singh",
      dob: "1996-04-10",
      joiningDate: "2018-04-10",
    },
    {
      id: 5,
      name: "Priya Kapoor",
      dob: "1999-04-22",
      joiningDate: "2022-04-22",
    },
    {
      id: 6,
      name: "Amit Shah",
      dob: "1994-03-10",
      joiningDate: "2017-03-10",
    },
    {
      id: 7,
      name: "Neha Gupta",
      dob: "1993-04-01",
      joiningDate: "2016-04-01",
    },
    {
      id: 8,
      name: "Vikas Yadav",
      dob: "1992-04-15",
      joiningDate: "2015-04-15",
    },
  ];
  const today = new Date();

  const upcomingBirthdays = employees
    .map((emp) => {
      const dob = new Date(emp.dob);
      let nextBirthday = new Date(
        today.getFullYear(),
        dob.getMonth(),
        dob.getDate(),
      );

      if (nextBirthday < today) {
        nextBirthday.setFullYear(today.getFullYear() + 1);
      }

      const diffDays = Math.ceil(
        (nextBirthday - today) / (1000 * 60 * 60 * 24),
      );

      return { ...emp, nextBirthday, daysLeft: diffDays };
    })
    .filter((emp) => emp.daysLeft <= 30)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const anniversaries = employees.filter((emp) => {
    const join = new Date(emp.joiningDate);
    return (
      join.getMonth() === today.getMonth() && join.getDate() === today.getDate()
    );
  });

  const holidays = [
    { name: "Holi", date: "2026-03-04" },
    { name: "Independence Day", date: "2026-08-15" },
  ];

  const upcomingHolidays = holidays.filter(
    (holiday) => new Date(holiday.date) >= today,
  );

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
    });

  return (
    <div className="dashboard-page container-fluid">
      {/* Welcome */}
      <div className="dashboard-card d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
        <div className="welcome-section">
          <h2 className="mb-1">Welcome Kritika Sharma</h2>
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

      {/* Cards */}
      <div className="row g-4 mt-2">
        {/* Birthdays */}
        <div className="col-12 col-sm-6 col-lg-4">
          <div className="card dashboard-inner-card h-100">
            <h3>🎂 Birthdays</h3>
            <div className="card-body-list">
              {upcomingBirthdays.length > 0 ? (
                upcomingBirthdays.map((emp) => (
                  <div key={emp.id} className="list-item">
                    <span>{emp.name}</span>
                    <span>{formatDate(emp.nextBirthday)}</span>
                  </div>
                ))
              ) : (
                <p>No upcoming birthdays</p>
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
                  <div key={emp.id} className="list-item">
                    <span>{emp.name}</span>
                    <span>{formatDate(emp.joiningDate)}</span>
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
