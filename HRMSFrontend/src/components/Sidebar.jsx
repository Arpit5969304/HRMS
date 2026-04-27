import { NavLink } from "react-router-dom";
import {
  BsHouseDoor,
  BsPeople,
  BsCalendarCheck,
  BsGear,
  BsPerson,
  BsBarChart,
} from "react-icons/bs";

import { useAuth } from "../context/AuthContext"; // 🔥 ADD THIS

import "../assets/styles/sidebar.css";
import logoKashi from "../assets/logoKashi.png";

function Sidebar({ sidebarOpen }) {
  const { user } = useAuth(); // ✅ USE CONTEXT

  return (
    <div className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
      {/* Brand */}
      <div className="brand">
        <img src={logoKashi} alt="HRMS Logo" className="brand-icon" />
        <span className="brand-text">HRMS</span>
      </div>

      {/* ================= EMPLOYEE MENU ================= */}
      {user?.role === "Employee" && (
        <>
          <NavLink to="/employee/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            <BsHouseDoor className="nav-icon" />
            <span className="link-text">Dashboard</span>
          </NavLink>

          <NavLink to="/employee/attendance" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            <BsCalendarCheck className="nav-icon" />
            <span className="link-text">Attendance</span>
          </NavLink>

          <NavLink to="/employee/leave" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            <BsCalendarCheck className="nav-icon" />
            <span className="link-text">Leave</span>
          </NavLink>

          <NavLink to="/employee/profile" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            <BsPerson className="nav-icon" />
            <span className="link-text">Profile</span>
          </NavLink>

          <NavLink to="/employee/salaryInfo" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            <BsPerson className="nav-icon" />
            <span className="link-text">Salary Detail</span>
          </NavLink>

          <NavLink to="/employee/documents" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            <BsPerson className="nav-icon" />
            <span className="link-text">Documents</span>
          </NavLink>

          <NavLink to="/employee/EmployeeAnnouncement" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            <BsPerson className="nav-icon" />
            <span className="link-text">Announcement</span>
          </NavLink>

          <NavLink to="/employee/MyTasks" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            <BsPerson className="nav-icon" />
            <span className="link-text">My Tasks</span>
          </NavLink>

          <NavLink to="/employee/EmployeeRemarks" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            <BsPerson className="nav-icon" />
            <span className="link-text">Remarks</span>
          </NavLink>
        </>
      )}

      {/* ================= ADMIN MENU ================= */}
      {user?.role === "Admin" && (
        <>
          <NavLink to="/admin/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            <BsHouseDoor className="nav-icon" />
            <span className="link-text">Dashboard</span>
          </NavLink>

          <NavLink to="/admin/manage" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            <BsPeople className="nav-icon" />
            <span className="link-text">Manage Employees</span>
          </NavLink>

          <NavLink to="/admin/employeeProfile" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            <BsBarChart className="nav-icon" />
            <span className="link-text">Employee Profile</span>
          </NavLink>

          <NavLink to="/admin/manageSalary" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            <BsGear className="nav-icon" />
            <span className="link-text">Manage Salary</span>
          </NavLink>

          <NavLink to="/admin/manageAttendance" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            <BsGear className="nav-icon" />
            <span className="link-text">Manage Attendance</span>
          </NavLink>

          <NavLink to="/admin/manageHoliday" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            <BsGear className="nav-icon" />
            <span className="link-text">Manage Holiday</span>
          </NavLink>

          <NavLink to="/admin/manageLeave" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            <BsGear className="nav-icon" />
            <span className="link-text">Manage Leave</span>
          </NavLink>

          <NavLink to="/admin/employeeRemark" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            <BsGear className="nav-icon" />
            <span className="link-text">Remarks</span>
          </NavLink>

          <NavLink to="/admin/profileUpdate" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            <BsGear className="nav-icon" />
            <span className="link-text">Profile Update</span>
          </NavLink>

          <NavLink to="/admin/companyAnnouncement" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            <BsGear className="nav-icon" />
            <span className="link-text">Announcement</span>
          </NavLink>

          <NavLink to="/admin/manageTasks" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            <BsGear className="nav-icon" />
            <span className="link-text">Manage Tasks</span>
          </NavLink>

          <NavLink to="/admin/DocumentVerify" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            <BsGear className="nav-icon" />
            <span className="link-text">Document Verify</span>
          </NavLink>

          <NavLink to="/admin/accountDetails" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            <BsGear className="nav-icon" />
            <span className="link-text">Account Details</span>
          </NavLink>
        </>
      )}
    </div>
  );
}

export default Sidebar;