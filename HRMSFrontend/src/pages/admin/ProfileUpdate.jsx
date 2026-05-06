import { useEffect, useRef, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import { useAuth } from "../../context/AuthContext";
import API from "../../utils/axios";

const initialFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  role: "",
  password: "",
  confirmPassword: "",
};

function ProfileUpdate() {
  const { refreshUser } = useAuth();
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState("https://i.pravatar.cc/120?img=3");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const objectUrlRef = useRef(null);

  const syncFormFromUser = (userData) => {
    setFormData({
      firstName: userData?.firstName || "",
      lastName: userData?.lastName || "",
      email: userData?.email || "",
      phone: userData?.phone || "",
      role: userData?.role || "Admin",
      password: "",
      confirmPassword: "",
    });

    setEmployeeId(userData?.employeeId || "");
    setPreview(userData?.profileImage || "https://i.pravatar.cc/120?img=3");
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await API.get("/employees/me");
        syncFormFromUser(res.data);
      } catch (err) {
        setErrors({
          api: err.response?.data?.message || "Failed to load profile",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
      api: "",
    }));
    setSuccess("");
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrors((current) => ({
        ...current,
        image: "Only image files are allowed",
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((current) => ({
        ...current,
        image: "Image size must be less than 5MB",
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
      image: "",
      api: "",
    }));
    setSuccess("");
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = "Phone must be 10 digits";
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const data = new FormData();
    data.append("firstName", formData.firstName.trim());
    data.append("lastName", formData.lastName.trim());
    data.append("email", formData.email.trim());
    data.append("phone", formData.phone.trim());

    if (formData.password) {
      data.append("password", formData.password);
    }

    if (selectedFile) {
      data.append("profileImage", selectedFile);
    }

    try {
      setSaving(true);
      setErrors({});
      const res = await API.put("/employees/me", data);
      const updatedUser = res.data?.user;

      if (updatedUser) {
        syncFormFromUser(updatedUser);
      }

      setSelectedFile(null);
      await refreshUser();
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setErrors({
        api: err.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="container py-4">Loading profile...</div>;
  }

  return (
    <div className="container py-3 py-md-4">
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <div>
            <h4 className="fw-bold text-primary mb-0">Admin Profile Update</h4>
            <small className="text-muted">
              Keep your account details and password up to date.
            </small>
          </div>

          {employeeId && (
            <span className="badge text-bg-light border">ID: {employeeId}</span>
          )}
        </div>

        <div className="card-body">
          {success && <div className="alert alert-success">{success}</div>}
          {errors.api && <div className="alert alert-danger">{errors.api}</div>}

          <div className="row g-3">
            <div className="col-12 col-md-4 col-lg-3 text-center border-end border-md-end">
              <img
                src={preview}
                alt="profile"
                className="rounded-circle mb-3 shadow object-fit-cover"
                width="120"
                height="120"
              />

              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={handleImage}
              />

              {errors.image && (
                <small className="text-danger">{errors.image}</small>
              )}

              <p className="text-muted mt-2 mb-0">Upload profile photo</p>
            </div>

            <div className="col-12 col-md-8 col-lg-9">
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-12 col-sm-6">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                    {errors.firstName && (
                      <small className="text-danger">{errors.firstName}</small>
                    )}
                  </div>

                  <div className="col-12 col-sm-6">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                    {errors.lastName && (
                      <small className="text-danger">{errors.lastName}</small>
                    )}
                  </div>

                  <div className="col-12 col-sm-6">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && (
                      <small className="text-danger">{errors.email}</small>
                    )}
                  </div>

                  <div className="col-12 col-sm-6">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      className="form-control"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                    {errors.phone && (
                      <small className="text-danger">{errors.phone}</small>
                    )}
                  </div>

                  <div className="col-12 col-sm-6">
                    <label className="form-label">Role</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.role}
                      disabled
                    />
                  </div>

                  <div className="col-12">
                    <hr className="my-2" />
                    <h6 className="fw-semibold mb-0">Change Password</h6>
                  </div>

                  <div className="col-12 col-sm-6">
                    <label className="form-label">New Password</label>
                    <div className="position-relative w-100">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control pe-5"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        className="position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent px-3"
                        style={{ zIndex: 2 }}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>

                    {errors.password && (
                      <small className="text-danger">{errors.password}</small>
                    )}
                  </div>

                  <div className="col-12 col-sm-6">
                    <label className="form-label">Confirm Password</label>
                    <div className="position-relative w-100">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className="form-control pe-5"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword((current) => !current)
                        }
                        className="position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent px-3"
                        style={{ zIndex: 2 }}
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>

                    {errors.confirmPassword && (
                      <small className="text-danger">
                        {errors.confirmPassword}
                      </small>
                    )}
                  </div>
                </div>

                <div className="mt-4 d-flex flex-column flex-sm-row justify-content-end gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary px-4 w-100 w-sm-auto"
                    disabled={saving}
                  >
                    {saving ? "Updating..." : "Update Profile"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileUpdate;
