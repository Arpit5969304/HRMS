import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BsBell, BsChevronDown, BsList, BsSearch } from "react-icons/bs";
import { useAuth } from "../context/AuthContext";
import "../assets/styles/topbar.css";

function Topbar({ toggleSidebar }) {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const { user, logout } = useAuth();

  const profileRoute =
    user?.role === "Admin" ? "/admin/profileUpdate" : "/employee/profile";
  const dashboardRoute =
    user?.role === "Admin" ? "/admin/dashboard" : "/employee/dashboard";
  const displayName =
    user?.firstName || user?.fullName || user?.name || "Guest";
  const avatarSrc = user?.profileImage || "https://i.pravatar.cc/150?img=3";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

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

      <div className="topbar-left">
        <div className="search-box search-icon-mobile d-md-none">
          <input type="text" placeholder="Search..." />
          <BsSearch className="search-icon" />
        </div>
      </div>

      <div className="topbar-right">
        <div className="notification">
          <BsBell />
          <span className="badge">3</span>
        </div>

        <div
          className="user-info"
          ref={dropdownRef}
          onClick={() => setShowDropdown((current) => !current)}
        >
          <div className="user-text">
            <span className="user-name">{displayName}</span>
            <small className="user-role">{user?.role || "Employee"}</small>
          </div>

          <img src={avatarSrc} alt="user" className="user-avatar" />

          <BsChevronDown className="dropdown-icon" />

          {showDropdown && (
            <div className="user-dropdown-card">
              <button onClick={() => navigate(profileRoute)}>My Profile</button>

              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>

              <button onClick={() => navigate(dashboardRoute)}>
                Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Topbar;
