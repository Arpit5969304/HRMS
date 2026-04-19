import "../assets/styles/topbar.css";
import { BsSearch, BsBell, BsList, BsChevronDown } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext"; // 🔥 ADD THIS

function Topbar({ toggleSidebar }) {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const { user, logout } = useAuth(); // 🔥 USE CONTEXT

  const handleLogout = () => {
    logout(); // 🔥 context logout
    navigate("/login", { replace: true });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="topbar">
      <div className="menu-icon" onClick={toggleSidebar}>
        <BsList />
      </div>

      {/* Left */}
      <div className="topbar-left">
        <div className="search-box search-icon-mobile d-md-none">
          <input type="text" placeholder="Search..." />
          <BsSearch className="search-icon" />
        </div>
      </div>

      {/* Right */}
      <div className="topbar-right">
        <div className="notification">
          <BsBell />
          <span className="badge">3</span>
        </div>

        {/* User */}
        <div
          className="user-info"
          ref={dropdownRef}
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <div className="user-text">
            <span className="user-name">
              {user?.firstName || "Guest"} {/* 🔥 SAFE */}
            </span>
            <small className="user-role">
              {user?.role || "Employee"}
            </small>
          </div>

          <img
            src="https://i.pravatar.cc/150?img=3"
            alt="user"
            className="user-avatar"
          />

          <BsChevronDown className="dropdown-icon" />

          {showDropdown && (
            <div className="user-dropdown-card">
              <button onClick={() => navigate("/profile")}>
                My Profile
              </button>

              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>

              <button onClick={() => navigate("/profileUpdate")}>
                ProfileUpdate
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Topbar;