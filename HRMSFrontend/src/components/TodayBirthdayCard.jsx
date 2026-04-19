import { useState } from "react";
import "../assets/styles/TodayBirthday.css";
import useDashboard from "../hooks/useDashboard";

function TodayBirthdayCard() {
  const { data, loading } = useDashboard(); // ✅ use hook
  const employees = data.employees || [];

  const [blessings, setBlessings] = useState({});

  const today = new Date();
  const todayDate = today.getDate();
  const todayMonth = today.getMonth();

  // 🔥 FILTER TODAY BIRTHDAYS
  const todayBirthdays = employees.filter((emp) => {
    if (!emp.dob) return false;

    const dob = new Date(emp.dob);
    return dob.getDate() === todayDate && dob.getMonth() === todayMonth;
  });

  const handleChange = (id, value) => {
    setBlessings((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSend = (id, name) => {
    const message = blessings[id];
    if (!message?.trim()) return;

    console.log(`🎉 Blessing for ${name}:`, message);

    setBlessings((prev) => ({
      ...prev,
      [id]: "",
    }));
  };

  return (
    <div className="birthcard">
      <h2>🎂 Today's Birthday</h2>

      {loading ? (
        <p className="no-data">Loading...</p>
      ) : todayBirthdays.length > 0 ? (
        <div className="birthday-list">
          {todayBirthdays.map((emp) => (
            <div className="birthday-item" key={emp._id}>
              <h3>{emp.firstName} {emp.lastName}</h3>
              <p>🎉 Wish them a happy birthday!</p>

              <input
                type="text"
                placeholder="Write your blessing..."
                value={blessings[emp._id] || ""}
                onChange={(e) =>
                  handleChange(emp._id, e.target.value)
                }
              />

              <button
                onClick={() =>
                  handleSend(emp._id, emp.firstName)
                }
              >
                Send
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-data">❌ No birthday today</p>
      )}
    </div>
  );
}

export default TodayBirthdayCard;