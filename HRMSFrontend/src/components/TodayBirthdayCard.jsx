import { useState } from "react";
import "../assets/styles/TodayBirthday.css";

function TodayBirthdayCard({ employees = [] }) {
  const [blessings, setBlessings] = useState({});

  const today = new Date();

  // ✅ FIX: timezone-safe compare
  const todayBirthdays = employees.filter((emp) => {
    if (!emp.dob) return false;

    const dob = new Date(emp.dob);

    const todayStr = new Date().toDateString();
    const dobThisYear = new Date(
      new Date().getFullYear(),
      dob.getMonth(),
      dob.getDate(),
    ).toDateString();

    return todayStr === dobThisYear;
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

      {todayBirthdays.length > 0 ? (
        <div className="birthday-list">
          {todayBirthdays.map((emp) => (
            <div className="birthday-item" key={emp._id}>
              <h3>
                {emp.firstName} {emp.lastName}
              </h3>
              <p>🎉 Wish them a happy birthday!</p>

              <input
                type="text"
                placeholder="Write your blessing..."
                value={blessings[emp._id] || ""}
                onChange={(e) => handleChange(emp._id, e.target.value)}
              />

              <button onClick={() => handleSend(emp._id, emp.firstName)}>
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
