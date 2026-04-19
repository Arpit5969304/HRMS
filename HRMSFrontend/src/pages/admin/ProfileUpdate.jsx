import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function ProfileUpdate() {
  const [formData, setFormData] = useState({
    name: "Admin User",
    email: "admin@example.com",
    phone: "9876543210",
    role: "Administrator",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState("https://i.pravatar.cc/120");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors({ ...errors, image: "Only image files are allowed" });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrors({ ...errors, image: "Image size must be less than 2MB" });
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);

    setErrors({ ...errors, image: "" });
  };

  const validate = () => {
    let newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Full name is required";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format";

    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(formData.phone))
      newErrors.phone = "Phone must be 10 digits";

    if (formData.password) {
      if (formData.password.length < 6)
        newErrors.password = "Password must be at least 6 characters";

      if (!/[A-Z]/.test(formData.password))
        newErrors.password = "Password must contain one uppercase letter";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setSuccess("Profile updated successfully!");

    setTimeout(() => {
      setSuccess("");
    }, 1000);
  };

  return (
    <div className="container py-3 py-md-4">
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white">
          <h4 className="fw-bold text-primary mb-0">Admin Profile Update</h4>
        </div>

        <div className="card-body">
          {success && <div className="alert alert-success">{success}</div>}

          <div className="row g-3">
            {/* Profile Photo */}
            <div className="col-12 col-md-4 col-lg-3 text-center border-end border-md-end">
              <img
                src={preview}
                alt="profile"
                className="rounded-circle mb-3 shadow"
                width="120"
                height="120"
              />

              <input
                type="file"
                className="form-control"
                onChange={handleImage}
              />

              {errors.image && (
                <small className="text-danger">{errors.image}</small>
              )}

              <p className="text-muted mt-2">Upload profile photo</p>
            </div>

            {/* Form */}
            <div className="col-12 col-md-8 col-lg-9">
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  {/* Name */}
                  <div className="col-12 col-sm-6">
                    <label className="form-label">Full Name</label>

                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                    />

                    {errors.name && (
                      <small className="text-danger">{errors.name}</small>
                    )}
                  </div>

                  {/* Email */}
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

                  {/* Phone */}
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

                  {/* Role */}
                  <div className="col-12 col-sm-6">
                    <label className="form-label">Role</label>

                    <input
                      type="text"
                      className="form-control"
                      value={formData.role}
                      disabled
                    />
                  </div>

                  <hr className="my-3" />

                  <h6 className="fw-semibold">Change Password</h6>

                  {/* Password */}
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
                        onClick={() => setShowPassword(!showPassword)}
                        className="position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent px-3"
                        style={{ zIndex: 2 }}
                      >
                        👁
                      </button>
                    </div>

                    {errors.password && (
                      <small className="text-danger">{errors.password}</small>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="col-12 col-sm-6">
                    <label className="form-label">Confirm Password</label>

                    <input
                      type="password"
                      className="form-control"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />

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
                  >
                    Update Profile
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
