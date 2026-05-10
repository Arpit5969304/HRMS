import { useEffect, useRef, useState } from "react";
import {
  BsBank,
  BsBriefcase,
  BsCalendar3,
  BsCamera,
  BsCreditCard2Front,
  BsEnvelope,
  BsGeoAlt,
  BsPersonBadge,
  BsPhone,
  BsShieldLock,
  BsStars,
  BsXLg,
} from "react-icons/bs";
import API from "../../utils/axios";
import { useAuth } from "../../context/AuthContext";
import "../../assets/styles/ProfilePage.css";

const initialFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  gender: "",
  dob: "",
  address: "",
  recoveryCode: "",
  confirmRecoveryCode: "",
  password: "",
  confirmPassword: "",
};

const formatDisplayDate = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatInputDate = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
};

const getProfileName = (profile) =>
  [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") ||
  profile?.fullName ||
  "Employee";

const getInitials = (profile) => {
  const initials = [profile?.firstName?.[0], profile?.lastName?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase();

  return initials || "EM";
};

const getProfileCompletion = (profile) => {
  const checkpoints = [
    profile?.email,
    profile?.phone,
    profile?.gender,
    profile?.address,
    profile?.dob,
    profile?.profileImage,
  ];
  const completeCount = checkpoints.filter(Boolean).length;

  return Math.round((completeCount / checkpoints.length) * 100);
};

const getTenureLabel = (joinDate) => {
  if (!joinDate) return "Not available";

  const start = new Date(joinDate);
  const today = new Date();

  if (Number.isNaN(start.getTime()) || start > today) {
    return "Not available";
  }

  let years = today.getFullYear() - start.getFullYear();
  let months = today.getMonth() - start.getMonth();

  if (today.getDate() < start.getDate()) {
    months -= 1;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years <= 0 && months <= 0) {
    return "Less than a month";
  }

  if (years > 0 && months > 0) {
    return `${years}y ${months}m`;
  }

  if (years > 0) {
    return `${years} year${years === 1 ? "" : "s"}`;
  }

  return `${months} month${months === 1 ? "" : "s"}`;
};

const getStatusLabel = (status) => {
  if (!status) return "Unknown";

  return status.charAt(0).toUpperCase() + status.slice(1);
};

const ProfilePage = () => {
  const { refreshUser } = useAuth();
  const objectUrlRef = useRef(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState({ type: "", message: "" });

  const syncFormFromUser = (userData) => {
    setFormData({
      firstName: userData?.firstName || "",
      lastName: userData?.lastName || "",
      email: userData?.email || "",
      phone: userData?.phone || "",
      gender: userData?.gender || "",
      dob: formatInputDate(userData?.dob),
      address: userData?.address || "",
      recoveryCode: "",
      confirmRecoveryCode: "",
      password: "",
      confirmPassword: "",
    });

    setPreview(userData?.profileImage || "");
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setNotice({ type: "", message: "" });

      const [userResult, accountResult] = await Promise.allSettled([
        API.get("/employees/me"),
        API.get("/employee-account/my-account"),
      ]);

      if (userResult.status !== "fulfilled") {
        throw userResult.reason;
      }

      const userData = userResult.value.data;
      const accountData =
        accountResult.status === "fulfilled"
          ? accountResult.value.data?.data || accountResult.value.data || null
          : null;

      setUser(userData);
      setAccount(accountData);
      syncFormFromUser(userData);

      if (
        accountResult.status === "rejected" &&
        accountResult.reason?.response?.status !== 404
      ) {
        setNotice({
          type: "warning",
          message:
            "Profile loaded, but account details could not be retrieved right now.",
        });
      }
    } catch (error) {
      setNotice({
        type: "error",
        message:
          error.response?.data?.message ||
          "We could not load your profile right now.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
      api: "",
    }));
  };

  const handleImage = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrors((current) => ({
        ...current,
        profileImage: "Only image files are allowed.",
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((current) => ({
        ...current,
        profileImage: "Image size must be under 5MB.",
      }));
      return;
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const imageUrl = URL.createObjectURL(file);
    objectUrlRef.current = imageUrl;

    setSelectedFile(file);
    setPreview(imageUrl);
    setErrors((current) => ({
      ...current,
      profileImage: "",
      api: "",
    }));
  };

  const closeEditor = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    setSelectedFile(null);
    setErrors({});
    syncFormFromUser(user);
    setIsEditorOpen(false);
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.firstName.trim()) {
      nextErrors.firstName = "First name is required.";
    }

    if (!formData.lastName.trim()) {
      nextErrors.lastName = "Last name is required.";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (formData.phone.trim() && !/^\d{10}$/.test(formData.phone.trim())) {
      nextErrors.phone = "Phone must be 10 digits.";
    }

    if (formData.password && formData.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    if (formData.recoveryCode && formData.recoveryCode.length < 4) {
      nextErrors.recoveryCode = "Recovery code must be at least 4 characters.";
    }

    if (formData.recoveryCode !== formData.confirmRecoveryCode) {
      nextErrors.confirmRecoveryCode = "Recovery codes do not match.";
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    const payload = new FormData();
    payload.append("firstName", formData.firstName.trim());
    payload.append("lastName", formData.lastName.trim());
    payload.append("email", formData.email.trim());
    payload.append("phone", formData.phone.trim());
    payload.append("gender", formData.gender);
    payload.append("address", formData.address.trim());

    if (formData.dob) {
      payload.append("dob", formData.dob);
    }

    if (formData.password) {
      payload.append("password", formData.password);
    }

    if (formData.recoveryCode) {
      payload.append("recoveryCode", formData.recoveryCode);
    }

    if (selectedFile) {
      payload.append("profileImage", selectedFile);
    }

    try {
      setSaving(true);
      setErrors({});

      const response = await API.put("/employees/me", payload);
      const updatedUser = response.data?.user || response.data;

      setUser(updatedUser);
      syncFormFromUser(updatedUser);
      setSelectedFile(null);
      setIsEditorOpen(false);
      setNotice({
        type: "success",
        message: "Your profile has been updated successfully.",
      });

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }

      await refreshUser();
    } catch (error) {
      setErrors({
        api: error.response?.data?.message || "Failed to update profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="employee-profile-page">
        <div className="employee-profile-loader">Loading your profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="employee-profile-page">
        <div className="employee-profile-loader">
          Your profile could not be loaded.
        </div>
      </div>
    );
  }

  const fullName = getProfileName(user);
  const completionRate = getProfileCompletion(user);
  const tenureLabel = getTenureLabel(user.joinDate);
  const personalDetails = [
    {
      label: "Email Address",
      value: user.email || "Not available",
      icon: <BsEnvelope />,
    },
    {
      label: "Phone Number",
      value: user.phone || "Not available",
      icon: <BsPhone />,
    },
    {
      label: "Gender",
      value: user.gender || "Not available",
      icon: <BsPersonBadge />,
    },
    {
      label: "Date of Birth",
      value: formatDisplayDate(user.dob),
      icon: <BsCalendar3 />,
    },
    {
      label: "Address",
      value: user.address || "Not available",
      icon: <BsGeoAlt />,
      wide: true,
    },
  ];

  const workDetails = [
    {
      label: "Employee ID",
      value: user.employeeId || "Not available",
      icon: <BsPersonBadge />,
    },
    {
      label: "Department",
      value: user.department || "Not available",
      icon: <BsBriefcase />,
    },
    {
      label: "Designation",
      value: user.designation || "Not available",
      icon: <BsBriefcase />,
    },
    {
      label: "Employment Type",
      value: user.employmentType || "Not available",
      icon: <BsStars />,
    },
    {
      label: "Status",
      value: getStatusLabel(user.status),
      icon: <BsShieldLock />,
    },
    {
      label: "Join Date",
      value: formatDisplayDate(user.joinDate),
      icon: <BsCalendar3 />,
    },
  ];

  const bankingDetails = [
    {
      label: "Bank Name",
      value: account?.bankName || "Not available",
      icon: <BsBank />,
    },
    {
      label: "Account Number",
      value: account?.accountNumber || "Not available",
      icon: <BsCreditCard2Front />,
    },
    {
      label: "IFSC Code",
      value: account?.ifscCode || "Not available",
      icon: <BsBank />,
    },
    {
      label: "PAN Number",
      value: account?.panNumber || "Not available",
      icon: <BsShieldLock />,
    },
  ];

  const infoCards = [
    {
      label: "Profile Completion",
      value: `${completionRate}%`,
      helper: "Higher completion keeps HR records accurate.",
    },
    {
      label: "Time With Company",
      value: tenureLabel,
      helper: "Based on your recorded join date.",
    },
    {
      label: "Account Details",
      value: account ? "On File" : "Pending",
      helper: account
        ? "Payroll details are available in your profile."
        : "Bank details have not been added yet.",
    },
    {
      label: "Last Updated",
      value: formatDisplayDate(user.updatedAt),
      helper: "Most recent change saved in your employee record.",
    },
    {
      label: "Recovery Code",
      value: user.recoveryCodeUpdatedAt ? "Configured" : "Not Set",
      helper: user.recoveryCodeUpdatedAt
        ? `Updated on ${formatDisplayDate(user.recoveryCodeUpdatedAt)}.`
        : "Set one now so you can reset a forgotten password yourself.",
    },
  ];

  const renderDetailPanel = (title, subtitle, details, footer = null) => (
    <article className="employee-profile-panel">
      <div className="employee-profile-panel-header">
        <div>
          <span className="employee-profile-panel-kicker">{title}</span>
          <h3>{subtitle}</h3>
        </div>
      </div>

      <div className="employee-profile-detail-grid">
        {details.map((item) => (
          <div
            key={item.label}
            className={`employee-profile-detail-item ${item.wide ? "is-wide" : ""}`}
          >
            <div className="employee-profile-detail-icon">{item.icon}</div>
            <div>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          </div>
        ))}
      </div>

      {footer}
    </article>
  );

  return (
    <div className="employee-profile-page">
      <section className="employee-profile-hero">
        <div className="employee-profile-identity">
          {preview ? (
            <img
              src={preview}
              alt={fullName}
              className="employee-profile-avatar"
            />
          ) : (
            <div className="employee-profile-avatar employee-profile-avatar-fallback">
              {getInitials(user)}
            </div>
          )}

          <div className="employee-profile-title-block">
            <span className="employee-profile-kicker">Employee profile</span>
            <h1>{fullName}</h1>
            <p>
              {user.designation || "Employee"} {user.department ? `- ${user.department}` : ""}
            </p>

            <div className="employee-profile-badge-row">
              <span>{user.employeeId || "No ID"}</span>
              <span>{user.employmentType || "Team member"}</span>
              <span className={`employee-status-badge is-${user.status || "unknown"}`}>
                {getStatusLabel(user.status)}
              </span>
            </div>
          </div>
        </div>

        <div className="employee-profile-hero-panel">
          <div className="employee-profile-hero-grid">
            <div>
              <span>Work Email</span>
              <strong>{user.email || "Not available"}</strong>
            </div>
            <div>
              <span>Phone</span>
              <strong>{user.phone || "Not available"}</strong>
            </div>
            <div>
              <span>Member Since</span>
              <strong>{formatDisplayDate(user.joinDate)}</strong>
            </div>
            <div>
              <span>Profile Health</span>
              <strong>{completionRate}% complete</strong>
            </div>
          </div>

          <button
            type="button"
            className="employee-profile-edit-btn"
            onClick={() => setIsEditorOpen(true)}
          >
            Edit Profile
          </button>
        </div>
      </section>

      {notice.message && (
        <div className={`employee-profile-notice is-${notice.type}`}>
          {notice.message}
        </div>
      )}

      <section className="employee-profile-metrics">
        {infoCards.map((card) => (
          <article key={card.label} className="employee-profile-metric-card">
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <p>{card.helper}</p>
          </article>
        ))}
      </section>

      <section className="employee-profile-grid">
        {renderDetailPanel(
          "Personal details",
          "Contact and identity information",
          personalDetails,
        )}

        {renderDetailPanel(
          "Work details",
          "Role and employment information on file",
          workDetails,
        )}

        {renderDetailPanel(
          "Banking details",
          "Payroll details visible for confirmation",
          bankingDetails,
          <div className="employee-profile-panel-note">
            Bank account information is managed by HR or payroll support. Reach
            out to them if any of these details need to be updated.
          </div>,
        )}

        <article className="employee-profile-panel employee-profile-support-panel">
          <div className="employee-profile-panel-header">
            <div>
              <span className="employee-profile-panel-kicker">Profile health</span>
              <h3>Keep your record current</h3>
            </div>
          </div>

          <div className="employee-profile-support-list">
            <div>
              <span>What you can update</span>
              <strong>Name, contact details, address, date of birth, and password.</strong>
            </div>
            <div>
              <span>Recovery code</span>
              <strong>
                {user.recoveryCodeUpdatedAt
                  ? "A recovery code is already saved for forgot-password use."
                  : "Set a personal recovery code so you can reset your password from the login page."}
              </strong>
            </div>
            <div>
              <span>Payroll note</span>
              <strong>
                {account
                  ? "Your banking record is already on file."
                  : "Your banking record has not been added yet."}
              </strong>
            </div>
            <div>
              <span>Security tip</span>
              <strong>Use a strong password whenever you update your profile.</strong>
            </div>
            <div>
              <span>Profile image</span>
              <strong>
                {user.profileImage
                  ? "A profile photo is already attached."
                  : "Add a profile photo to make your record easier to identify."}
              </strong>
            </div>
          </div>
        </article>
      </section>

      {isEditorOpen && (
        <div className="employee-profile-modal-overlay">
          <div className="employee-profile-modal">
            <div className="employee-profile-modal-header">
              <div>
                <span className="employee-profile-panel-kicker">Edit profile</span>
                <h2>Update your personal record</h2>
              </div>

              <button
                type="button"
                className="employee-profile-close-btn"
                onClick={closeEditor}
              >
                <BsXLg />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="employee-profile-modal-body">
              <div className="employee-profile-image-card">
                {preview ? (
                  <img
                    src={preview}
                    alt={fullName}
                    className="employee-profile-avatar large"
                  />
                ) : (
                  <div className="employee-profile-avatar employee-profile-avatar-fallback large">
                    {getInitials(user)}
                  </div>
                )}

                <label className="employee-profile-upload-field">
                  <BsCamera />
                  <span>Upload Photo</span>
                  <input type="file" accept="image/*" onChange={handleImage} />
                </label>

                {errors.profileImage && (
                  <small className="employee-profile-error">
                    {errors.profileImage}
                  </small>
                )}

                <p>
                  Profile photo updates are optional. Supported image files only,
                  up to 5MB.
                </p>
              </div>

              <div className="employee-profile-form-area">
                {errors.api && (
                  <div className="employee-profile-notice is-error inline">
                    {errors.api}
                  </div>
                )}

                <div className="employee-profile-form-grid">
                  <label className="employee-profile-field">
                    <span>First Name</span>
                    <input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Enter first name"
                    />
                    {errors.firstName && (
                      <small className="employee-profile-error">
                        {errors.firstName}
                      </small>
                    )}
                  </label>

                  <label className="employee-profile-field">
                    <span>Last Name</span>
                    <input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Enter last name"
                    />
                    {errors.lastName && (
                      <small className="employee-profile-error">
                        {errors.lastName}
                      </small>
                    )}
                  </label>

                  <label className="employee-profile-field">
                    <span>Email Address</span>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email address"
                    />
                    {errors.email && (
                      <small className="employee-profile-error">
                        {errors.email}
                      </small>
                    )}
                  </label>

                  <label className="employee-profile-field">
                    <span>Phone Number</span>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                    />
                    {errors.phone && (
                      <small className="employee-profile-error">
                        {errors.phone}
                      </small>
                    )}
                  </label>

                  <label className="employee-profile-field">
                    <span>Gender</span>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </label>

                  <label className="employee-profile-field">
                    <span>Date of Birth</span>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                    />
                  </label>

                  <label className="employee-profile-field is-wide">
                    <span>Address</span>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Enter your address"
                    />
                  </label>

                  <label className="employee-profile-field">
                    <span>Recovery Code</span>
                    <input
                      type="password"
                      name="recoveryCode"
                      value={formData.recoveryCode}
                      onChange={handleChange}
                      placeholder="Choose your own recovery code"
                    />
                    {errors.recoveryCode && (
                      <small className="employee-profile-error">
                        {errors.recoveryCode}
                      </small>
                    )}
                  </label>

                  <label className="employee-profile-field">
                    <span>Confirm Recovery Code</span>
                    <input
                      type="password"
                      name="confirmRecoveryCode"
                      value={formData.confirmRecoveryCode}
                      onChange={handleChange}
                      placeholder="Re-enter the recovery code"
                    />
                    {errors.confirmRecoveryCode && (
                      <small className="employee-profile-error">
                        {errors.confirmRecoveryCode}
                      </small>
                    )}
                  </label>

                  <label className="employee-profile-field">
                    <span>New Password</span>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Leave blank to keep current password"
                    />
                    {errors.password && (
                      <small className="employee-profile-error">
                        {errors.password}
                      </small>
                    )}
                  </label>

                  <label className="employee-profile-field">
                    <span>Confirm Password</span>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter the new password"
                    />
                    {errors.confirmPassword && (
                      <small className="employee-profile-error">
                        {errors.confirmPassword}
                      </small>
                    )}
                  </label>
                </div>

                <div className="employee-profile-form-note">
                  Banking details are shown on your profile for reference and are
                  managed separately by HR or payroll support. Your recovery code
                  is only used for the forgot-password flow on the login page.
                </div>

                <div className="employee-profile-modal-footer">
                  <button
                    type="button"
                    className="employee-profile-secondary-btn"
                    onClick={closeEditor}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="employee-profile-primary-btn"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
