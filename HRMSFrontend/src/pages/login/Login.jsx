import React, { useState } from "react";
import "../../assets/styles/Login.css";
import logo from "../../assets/logoKashi.png";
import { useNavigate, Navigate } from "react-router-dom";
import API from "../../utils/axios"; // ✅ axios instance

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  // 🔥 FIX ROLE (Admin / Employee)
  if (user?.role === "Admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user?.role === "Employee") {
    return <Navigate to="/employee/dashboard" replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      // 🔥 REAL API CALL
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      // ✅ SAVE DATA
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      const loggedUser = res.data.user;

      // 🔥 ROLE BASED REDIRECT
      if (loggedUser.role === "Admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/employee/dashboard", { replace: true });
      }
    } catch (err) {
      alert(err.response?.data?.message || "Login failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <img src={logo} alt="Logo" className="login-logo" />
        <h2>HRMS Login</h2>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;