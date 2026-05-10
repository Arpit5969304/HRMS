import { useState } from "react";
import {
  BsArrowRight,
  BsEnvelope,
  BsEye,
  BsEyeSlash,
  BsKey,
  BsPatchCheck,
  BsShieldLock,
  BsStars,
  BsXLg,
} from "react-icons/bs";
import { Navigate, useNavigate } from "react-router-dom";
import logo from "../../assets/logoKashi.png";
import { useAuth } from "../../context/AuthContext";
import API from "../../utils/axios";
import "../../assets/styles/Login.css";

const initialResetState = {
  email: "",
  recoveryCode: "",
  newPassword: "",
  confirmPassword: "",
};

const Login = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pageNotice, setPageNotice] = useState({ type: "", message: "" });
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetData, setResetData] = useState(initialResetState);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetErrors, setResetErrors] = useState({});
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);

  if (user?.role === "Admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user?.role === "Employee") {
    return <Navigate to="/employee/dashboard" replace />;
  }

  const closeResetModal = () => {
    setIsResetOpen(false);
    setResetLoading(false);
    setResetErrors({});
    setShowResetPassword(false);
    setShowResetConfirmPassword(false);
    setResetData((current) => ({
      ...initialResetState,
      email: current.email || email,
    }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!email.trim() || !password) {
      setPageNotice({
        type: "error",
        message: "Please enter both email and password.",
      });
      return;
    }

    try {
      setLoading(true);
      setPageNotice({ type: "", message: "" });

      const response = await login(email.trim(), password);
      const role = response?.user?.role;

      if (role === "Admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/employee/dashboard", { replace: true });
      }
    } catch (error) {
      setPageNotice({
        type: "error",
        message: error.response?.data?.message || "Login failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetChange = (event) => {
    const { name, value } = event.target;

    setResetData((current) => ({
      ...current,
      [name]: value,
    }));

    setResetErrors((current) => ({
      ...current,
      [name]: "",
      api: "",
    }));
  };

  const handleResetSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = {};

    if (!resetData.email.trim()) {
      nextErrors.email = "Email is required.";
    }

    if (!resetData.recoveryCode.trim()) {
      nextErrors.recoveryCode = "Recovery code is required.";
    }

    if (!resetData.newPassword) {
      nextErrors.newPassword = "New password is required.";
    } else if (resetData.newPassword.length < 6) {
      nextErrors.newPassword = "Password must be at least 6 characters.";
    }

    if (resetData.newPassword !== resetData.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(nextErrors).length) {
      setResetErrors(nextErrors);
      return;
    }

    try {
      setResetLoading(true);
      setResetErrors({});

      const response = await API.post("/auth/reset-password-with-code", {
        email: resetData.email.trim(),
        recoveryCode: resetData.recoveryCode.trim(),
        newPassword: resetData.newPassword,
      });

      setEmail(resetData.email.trim());
      setPassword("");
      setPageNotice({
        type: "success",
        message:
          response.data?.message ||
          "Password reset successful. Please log in with your new password.",
      });
      closeResetModal();
    } catch (error) {
      setResetErrors({
        api:
          error.response?.data?.message ||
          "Password reset failed. Please verify your recovery code.",
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="login-page">
      <section className="login-shell">
        <div className="login-brand-panel">
          <div className="login-brand-top">
            <img src={logo} alt="HRMS Logo" className="login-logo" />
            <span className="login-kicker">Kashi HRMS</span>
          </div>

          <div className="login-brand-copy">
            <h1>Workday access that feels modern, secure, and clear.</h1>
            <p>
              Sign in to manage attendance, profile, salary records, and daily
              work updates from one polished workspace.
            </p>
          </div>

          <div className="login-brand-highlights">
            <div className="login-highlight-card">
              <BsPatchCheck />
              <div>
                <strong>Professional access</strong>
                <span>One clean login for employees and admins.</span>
              </div>
            </div>
            <div className="login-highlight-card">
              <BsShieldLock />
              <div>
                <strong>Recovery code reset</strong>
                <span>Reset a forgotten password using the code you created.</span>
              </div>
            </div>
            <div className="login-highlight-card">
              <BsStars />
              <div>
                <strong>Simple daily flow</strong>
                <span>Attendance, tasks, leave, and payroll in one place.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="login-card">
          <div className="login-card-header">
            <span className="login-card-chip">Secure sign in</span>
            <h2>Welcome back</h2>
            <p>Use your work email and password to access the HRMS dashboard.</p>
          </div>

          {pageNotice.message && (
            <div className={`login-notice is-${pageNotice.type}`}>
              {pageNotice.message}
            </div>
          )}

          <form onSubmit={handleLogin} className="login-form">
            <label className="login-field">
              <span>Email Address</span>
              <div className="login-input-wrap">
                <BsEnvelope className="login-input-icon" />
                <input
                  type="email"
                  placeholder="Enter your work email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
            </label>

            <label className="login-field">
              <span>Password</span>
              <div className="login-input-wrap">
                <BsShieldLock className="login-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <BsEyeSlash /> : <BsEye />}
                </button>
              </div>
            </label>

            <div className="login-form-actions">
              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? "Signing in..." : "Login"}
                {!loading && <BsArrowRight />}
              </button>

              <button
                type="button"
                className="forgot-password-btn"
                onClick={() => {
                  setResetData((current) => ({
                    ...initialResetState,
                    email: email.trim(),
                  }));
                  setResetErrors({});
                  setIsResetOpen(true);
                }}
              >
                Forgot password?
              </button>
            </div>
          </form>

          <div className="login-help-note">
            Recovery code reset works after a recovery code has been saved for
            your account.
          </div>
        </div>
      </section>

      {isResetOpen && (
        <div className="login-modal-overlay">
          <div className="login-modal">
            <div className="login-modal-header">
              <div>
                <span className="login-card-chip">Password recovery</span>
                <h3>Reset with your recovery code</h3>
                <p>
                  Use the recovery code saved for your account to set a new
                  password.
                </p>
              </div>

              <button
                type="button"
                className="login-modal-close"
                onClick={closeResetModal}
              >
                <BsXLg />
              </button>
            </div>

            <form onSubmit={handleResetSubmit} className="login-modal-body">
              {resetErrors.api && (
                <div className="login-notice is-error">{resetErrors.api}</div>
              )}

              <label className="login-field">
                <span>Email Address</span>
                <div className="login-input-wrap">
                  <BsEnvelope className="login-input-icon" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your work email"
                    value={resetData.email}
                    onChange={handleResetChange}
                  />
                </div>
                {resetErrors.email && (
                  <small className="login-error">{resetErrors.email}</small>
                )}
              </label>

              <label className="login-field">
                <span>Recovery Code</span>
                <div className="login-input-wrap">
                  <BsKey className="login-input-icon" />
                  <input
                    type="password"
                    name="recoveryCode"
                    placeholder="Enter your saved recovery code"
                    value={resetData.recoveryCode}
                    onChange={handleResetChange}
                  />
                </div>
                {resetErrors.recoveryCode && (
                  <small className="login-error">{resetErrors.recoveryCode}</small>
                )}
              </label>

              <div className="login-modal-grid">
                <label className="login-field">
                  <span>New Password</span>
                  <div className="login-input-wrap">
                    <BsShieldLock className="login-input-icon" />
                    <input
                      type={showResetPassword ? "text" : "password"}
                      name="newPassword"
                      placeholder="Create a new password"
                      value={resetData.newPassword}
                      onChange={handleResetChange}
                    />
                    <button
                      type="button"
                      className="login-password-toggle"
                      onClick={() =>
                        setShowResetPassword((current) => !current)
                      }
                    >
                      {showResetPassword ? <BsEyeSlash /> : <BsEye />}
                    </button>
                  </div>
                  {resetErrors.newPassword && (
                    <small className="login-error">{resetErrors.newPassword}</small>
                  )}
                </label>

                <label className="login-field">
                  <span>Confirm Password</span>
                  <div className="login-input-wrap">
                    <BsShieldLock className="login-input-icon" />
                    <input
                      type={showResetConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm the new password"
                      value={resetData.confirmPassword}
                      onChange={handleResetChange}
                    />
                    <button
                      type="button"
                      className="login-password-toggle"
                      onClick={() =>
                        setShowResetConfirmPassword((current) => !current)
                      }
                    >
                      {showResetConfirmPassword ? <BsEyeSlash /> : <BsEye />}
                    </button>
                  </div>
                  {resetErrors.confirmPassword && (
                    <small className="login-error">
                      {resetErrors.confirmPassword}
                    </small>
                  )}
                </label>
              </div>

              <div className="login-modal-footer">
                <button
                  type="button"
                  className="login-secondary-btn"
                  onClick={closeResetModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="login-primary-btn"
                  disabled={resetLoading}
                >
                  {resetLoading ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
