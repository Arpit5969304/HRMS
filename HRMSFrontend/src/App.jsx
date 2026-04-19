import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Attendance from "./pages/employees/Attendance";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Dashboard from "./pages/employees/Dashboard";
import Leave from "./pages/employees/Leave";
import Login from "./pages/login/Login";
import ProfilePage from "./pages/employees/ProfilePage";
import ManageEmployees from "./pages/admin/ManageEmployees";
import EmployeeProfile from "./pages/admin/EmployeeProfile";
import ManageSalary from "./pages/admin/ManageSalary";
import ManageAttendance from "./pages/admin/ManageAttendance";
import ManageHoliday from "./pages/admin/ManageHoliday";
import ManageLeaves from "./pages/admin/ManageLeaves";
import ProfileUpdate from "./pages/admin/ProfileUpdate";
import EmployeeSalaryInfo from "./pages/employees/EmployeeSalaryInfo";
import EmployeeDocumentInfo from "./pages/employees/EmployeeDocumentInfo";
import CompanyAnnouncement from "./pages/admin/CompanyAnnouncement";
import CompanyAnnouncementsEmp from "./pages/employees/CompanyAnnouncementsEmp";
import ManageTasks from "./pages/admin/ManageTasks";
import MyTasks from "./pages/employees/MyTasks";
import DocumentVerify from "./pages/admin/DocumentVerify";
import EmployeeRemarkAdminSide from "./pages/admin/EmployeeRemarkAdminSide";
import EmployeeRemarkside from "./pages/employees/EmployeeRemarkside";

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Login */}
      <Route path="/login" element={<Login />} />

      {/* ================= EMPLOYEE ROUTES ================= */}
      <Route
        path="/employee"
        element={
          <ProtectedRoute role="Employee">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="leave" element={<Leave />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="salaryInfo" element={<EmployeeSalaryInfo />} />
        <Route path="documents" element={<EmployeeDocumentInfo />} />
        <Route
          path="EmployeeAnnouncement"
          element={<CompanyAnnouncementsEmp />}
        />
        <Route path="MyTasks" element={<MyTasks />} />
        <Route path="EmployeeRemarks" element={<EmployeeRemarkside />} />
      </Route>

      {/* ================= ADMIN ROUTES ================= */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="Admin">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="manage" element={<ManageEmployees />} />
        <Route path="employeeProfile" element={<EmployeeProfile />} />
        <Route path="manageSalary" element={<ManageSalary />} />
        <Route path="manageAttendance" element={<ManageAttendance />} />
        <Route path="manageHoliday" element={<ManageHoliday />} />
        <Route path="manageLeave" element={<ManageLeaves />} />
        <Route path="employeeRemark" element={<EmployeeRemarkAdminSide />} />
        <Route path="profileUpdate" element={<ProfileUpdate />} />
        <Route path="companyAnnouncement" element={<CompanyAnnouncement />} />
        <Route path="manageTasks" element={<ManageTasks />} />
        <Route path="DocumentVerify" element={<DocumentVerify />} />
      </Route>

      {/* Default Redirect */}
      <Route
        path="/"
        element={
          user?.role === "Admin" ? (
            <Navigate to="/admin/dashboard" />
          ) : user?.role === "Employee" ? (
            <Navigate to="/employee/dashboard" />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* Catch All */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;