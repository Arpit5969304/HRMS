import { useEffect, useEffectEvent, useRef, useState } from "react";
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
import { FcGoogle } from "react-icons/fc";
import { Navigate, useNavigate } from "react-router-dom";
import logo from "../../assets/logoKashi.png";
import "../../assets/styles/Login.css";
import { useAuth } from "../../context/AuthContext";
import API from "../../utils/axios";

const initialResetState = {
  email: "",
  otp: "",
  newPassword: "",
  confirmPassword: "",
};

const initialPendingLogin = {
  email: "",
  password: "",
};

const Login = () => {
  const navigate = useNavigate();
  const { user, login, loginWithGoogle } = useAuth();
  const googleButtonRef = useRef(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pageNotice, setPageNotice] = useState({ type: "", message: "" });

  const [isLoginOtpOpen, setIsLoginOtpOpen] = useState(false);
  const [pendingLogin, setPendingLogin] = useState(initialPendingLogin);
  const [loginOtp, setLoginOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");

  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetData, setResetData] = useState(initialResetState);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetOtpSending, setResetOtpSending] = useState(false);
  const [resetOtpSent, setResetOtpSent] = useState(false);
  const [resetStatus, setResetStatus] = useState("");
  const [resetErrors, setResetErrors] = useState({});
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] =
    useState(false);

  const [googleReady, setGoogleReady] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  const navigateToDashboard = (nextUser) => {
    if (nextUser?.role === "Admin") {
      navigate("/admin/dashboard", { replace: true });
      return;
    }

    navigate("/employee/dashboard", { replace: true });
  };

  const handleGoogleCredential = useEffectEvent(async (response) => {
    if (!response?.credential) {
      setGoogleError("Google sign in did not return a valid credential.");
      return;
    }

    try {
      setGoogleLoading(true);
      setGoogleError("");
      setPageNotice({ type: "", message: "" });

      const result = await loginWithGoogle(response.credential);
      navigateToDashboard(result?.user);
    } catch (error) {
      setGoogleError(
        error.response?.data?.message ||
          "Google sign in failed. Please try again.",
      );
    } finally {
      setGoogleLoading(false);
    }
  });

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();

    if (!clientId) {
      setGoogleReady(false);
      setGoogleError(
        "Google sign in is unavailable until VITE_GOOGLE_CLIENT_ID is configured.",
      );
      return undefined;
    }

    let cancelled = false;
    let script = document.querySelector('script[data-google-identity="true"]');

    const renderGoogleButton = () => {
      if (
        cancelled ||
        !googleButtonRef.current ||
        !window.google?.accounts?.id
      ) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredential,
      });

      googleButtonRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "pill",
        width: Math.min(360, googleButtonRef.current.offsetWidth || 360),
      });

      setGoogleReady(true);
      setGoogleError("");
    };

    const handleScriptLoad = () => {
      renderGoogleButton();
    };

    const handleScriptError = () => {
      if (cancelled) {
        return;
      }

      setGoogleReady(false);
      setGoogleError("Google sign in script failed to load.");
    };

    if (window.google?.accounts?.id) {
      renderGoogleButton();
      return () => {
        cancelled = true;
      };
    }

    if (!script) {
      script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.dataset.googleIdentity = "true";
      document.body.appendChild(script);
    }

    script.addEventListener("load", handleScriptLoad);
    script.addEventListener("error", handleScriptError);

    return () => {
      cancelled = true;
      script?.removeEventListener("load", handleScriptLoad);
      script?.removeEventListener("error", handleScriptError);
    };
  }, [handleGoogleCredential]);

  if (user?.role === "Admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user?.role === "Employee") {
    return <Navigate to="/employee/dashboard" replace />;
  }

  const closeLoginOtpModal = () => {
    setIsLoginOtpOpen(false);
    setPendingLogin(initialPendingLogin);
    setLoginOtp("");
    setOtpLoading(false);
    setOtpError("");
  };

  const closeResetModal = () => {
    setIsResetOpen(false);
    setResetLoading(false);
    setResetOtpSending(false);
    setResetOtpSent(false);
    setResetStatus("");
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
      setOtpError("");

      const trimmedEmail = email.trim();
      const response = await login(trimmedEmail, password);

      if (response?.requiresOtp) {
        setPendingLogin({
          email: trimmedEmail,
          password,
        });
        setLoginOtp("");
        setIsLoginOtpOpen(true);
        setPageNotice({
          type: "success",
          message:
            response.message ||
            "Login OTP sent to your email. Enter it to continue.",
        });
        return;
      }

      navigateToDashboard(response?.user);
    } catch (error) {
      setPageNotice({
        type: "error",
        message:
          error.response?.data?.message || "Login failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoginOtpSubmit = async (event) => {
    event.preventDefault();

    if (!loginOtp.trim()) {
      setOtpError("OTP is required.");
      return;
    }

    if (!pendingLogin.email || !pendingLogin.password) {
      setOtpError("Start the login process again to request a fresh OTP.");
      return;
    }

    try {
      setOtpLoading(true);
      setOtpError("");

      const response = await login(
        pendingLogin.email,
        pendingLogin.password,
        loginOtp.trim(),
      );

      closeLoginOtpModal();
      navigateToDashboard(response?.user);
    } catch (error) {
      setOtpError(
        error.response?.data?.message ||
          "OTP verification failed. Please try again.",
      );
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendLoginOtp = async () => {
    if (!pendingLogin.email || !pendingLogin.password) {
      setOtpError("Start the login process again to request a fresh OTP.");
      return;
    }

    try {
      setOtpLoading(true);
      setOtpError("");

      const response = await login(pendingLogin.email, pendingLogin.password);
      setPageNotice({
        type: "success",
        message:
          response.message ||
          "A fresh login OTP has been sent to your email address.",
      });
    } catch (error) {
      setOtpError(
        error.response?.data?.message || "Unable to resend login OTP.",
      );
    } finally {
      setOtpLoading(false);
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

  const handleSendResetOtp = async () => {
    if (!resetData.email.trim()) {
      setResetErrors((current) => ({
        ...current,
        email: "Email is required.",
      }));
      return;
    }

    try {
      setResetOtpSending(true);
      setResetStatus("");
      setResetErrors((current) => ({
        ...current,
        email: "",
        api: "",
      }));

      const response = await API.post("/auth/request-password-reset-otp", {
        email: resetData.email.trim(),
      });

      setResetOtpSent(true);
      setResetStatus(
        response.data?.message ||
          "Password reset OTP sent. Check your email inbox.",
      );
    } catch (error) {
      setResetErrors((current) => ({
        ...current,
        api:
          error.response?.data?.message ||
          "Unable to send a password reset OTP.",
      }));
    } finally {
      setResetOtpSending(false);
    }
  };

  const handleResetSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = {};

    if (!resetData.email.trim()) {
      nextErrors.email = "Email is required.";
    }

    if (!resetData.otp.trim()) {
      nextErrors.otp = "OTP is required.";
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

      const response = await API.post("/auth/reset-password-with-otp", {
        email: resetData.email.trim(),
        otp: resetData.otp.trim(),
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
          "Password reset failed. Please verify your OTP.",
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

          <div className="login-brand-main">
            <div className="login-brand-copy">
              <span className="login-brand-badge">
                <BsStars />
                HR workspace
              </span>
              <h1>Everything your team needs, one clear sign in.</h1>
              <p>
                Manage attendance, leave, payroll, documents, and profile
                updates from one focused workspace built for your whole team.
              </p>
            </div>

            <div className="login-brand-metrics">
              <div className="login-metric-card">
                <strong>2-step login</strong>
                <span>Password check first, email OTP verification next.</span>
              </div>
              <div className="login-metric-card">
                <strong>Google signup ready</strong>
                <span>Continue with Google and create access faster.</span>
              </div>
            </div>
          </div>

          <div className="login-brand-highlights">
            <div className="login-highlight-card">
              <BsPatchCheck />
              <span>Role-based access for admins and employees</span>
            </div>
            <div className="login-highlight-card">
              <BsShieldLock />
              <span>Email OTP for login and forgot-password recovery</span>
            </div>
            <div className="login-highlight-card">
              <BsStars />
              <span>Clean dashboard for everyday HR work</span>
            </div>
          </div>
        </div>

        <div className="login-card">
          <div className="login-card-header">
            <span className="login-card-chip">2-step sign in</span>
            <h2>Welcome back</h2>
            <p>
              Sign in with your work account, confirm your OTP, and continue to
              the HRMS dashboard.
            </p>
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
                  autoComplete="username"
                  spellCheck={false}
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
                  autoComplete="current-password"
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
                {loading ? "Sending OTP..." : "Login with OTP"}
                {!loading && <BsArrowRight />}
              </button>

              <button
                type="button"
                className="forgot-password-btn"
                onClick={() => {
                  setResetData((current) => ({
                    ...initialResetState,
                    email: current.email || email.trim(),
                  }));
                  setResetOtpSent(false);
                  setResetStatus("");
                  setResetErrors({});
                  setIsResetOpen(true);
                }}
              >
                Forgot password?
              </button>
            </div>
          </form>

          <div className="login-divider">
            <span>or continue with</span>
          </div>

          <div className="google-signin-shell">
            <div className="google-signin-slot" ref={googleButtonRef} />
            {!googleReady && !googleError && (
              <div className="google-signin-placeholder">
                <FcGoogle />
                <span>Loading Google sign in...</span>
              </div>
            )}
            {googleLoading && (
              <small className="login-help-inline">
                Completing Google sign in...
              </small>
            )}
            {googleError && <small className="login-error">{googleError}</small>}
          </div>

          <div className="login-help-note">
            Login now uses email OTP verification, and forgot-password requests
            send an OTP to the same work email address.
          </div>
        </div>
      </section>

      {isLoginOtpOpen && (
        <div className="login-modal-overlay">
          <div className="login-modal">
            <div className="login-modal-header">
              <div>
                <span className="login-card-chip">Login OTP</span>
                <h3>Verify your sign in</h3>
                <p>
                  Enter the 6-digit OTP sent to <strong>{pendingLogin.email}</strong>{" "}
                  to complete login.
                </p>
              </div>

              <button
                type="button"
                className="login-modal-close"
                onClick={closeLoginOtpModal}
              >
                <BsXLg />
              </button>
            </div>

            <form onSubmit={handleLoginOtpSubmit} className="login-modal-body">
              {otpError && <div className="login-notice is-error">{otpError}</div>}

              <label className="login-field">
                <span>One-Time Password</span>
                <div className="login-input-wrap">
                  <BsKey className="login-input-icon" />
                  <input
                    type="text"
                    inputMode="numeric"
                    name="loginOtp"
                    maxLength={6}
                    placeholder="Enter the 6-digit OTP"
                    autoComplete="one-time-code"
                    value={loginOtp}
                    onChange={(event) => {
                      setLoginOtp(event.target.value.replace(/\D/g, ""));
                      setOtpError("");
                    }}
                  />
                </div>
              </label>

              <div className="login-help-note">
                OTPs expire quickly. If you did not receive one, resend a fresh
                code to your email.
              </div>

              <div className="login-modal-footer">
                <button
                  type="button"
                  className="login-secondary-btn"
                  onClick={handleResendLoginOtp}
                  disabled={otpLoading}
                >
                  {otpLoading ? "Sending..." : "Resend OTP"}
                </button>
                <button
                  type="submit"
                  className="login-primary-btn"
                  disabled={otpLoading}
                >
                  {otpLoading ? "Verifying..." : "Verify and Login"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isResetOpen && (
        <div className="login-modal-overlay">
          <div className="login-modal">
            <div className="login-modal-header">
              <div>
                <span className="login-card-chip">Password recovery</span>
                <h3>Reset with email OTP</h3>
                <p>
                  Request an OTP for your work email, then set a new password
                  securely.
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

              {resetStatus && (
                <div className="login-notice is-success">{resetStatus}</div>
              )}

              <label className="login-field">
                <span>Email Address</span>
                <div className="login-input-wrap">
                  <BsEnvelope className="login-input-icon" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your work email"
                    autoComplete="username"
                    spellCheck={false}
                    value={resetData.email}
                    onChange={handleResetChange}
                  />
                </div>
                {resetErrors.email && (
                  <small className="login-error">{resetErrors.email}</small>
                )}
              </label>

              <button
                type="button"
                className="login-secondary-btn login-inline-action"
                onClick={handleSendResetOtp}
                disabled={resetOtpSending}
              >
                {resetOtpSending
                  ? "Sending OTP..."
                  : resetOtpSent
                    ? "Send New OTP"
                    : "Send OTP"}
              </button>

              <label className="login-field">
                <span>Email OTP</span>
                <div className="login-input-wrap">
                  <BsKey className="login-input-icon" />
                  <input
                    type="text"
                    inputMode="numeric"
                    name="otp"
                    maxLength={6}
                    placeholder="Enter the OTP from your email"
                    autoComplete="one-time-code"
                    value={resetData.otp}
                    onChange={(event) => {
                      const nextValue = event.target.value.replace(/\D/g, "");
                      handleResetChange({
                        target: {
                          name: "otp",
                          value: nextValue,
                        },
                      });
                    }}
                  />
                </div>
                {resetErrors.otp && (
                  <small className="login-error">{resetErrors.otp}</small>
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
                      autoComplete="new-password"
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
                      autoComplete="new-password"
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
