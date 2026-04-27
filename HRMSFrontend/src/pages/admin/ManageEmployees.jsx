import React, { useState } from "react";
import "../../assets/styles/manageEmployees.css";
import useEmployees from "../../hooks/useEmployees";

const ManageEmployees = () => {
  const { employees, createEmployee, deleteEmployee, updateEmployee } =
    useEmployees();

  const initialState = {
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    joinDate: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    role: "",
    department: "",
    designation: "",
    manager: "",
    employmentType: "",
    status: "active",
    agree: false,
  };

  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchEmployee, setSearchEmployee] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  // ✅ generate department list dynamically
  const departments = [
    ...new Set(employees.map((emp) => emp.department).filter(Boolean)),
  ];

  // ✅ FIXED handleChange (checkbox support + clear error)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,

      // 🔥 CLEAR MANAGER IF ADMIN
      ...(name === "role" && value === "Admin" && { manager: "" }),
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // ✅ VALIDATION FIXED
  const validate = () => {
    let newErrors = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";

    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";

    if (!formData.dob.trim()) newErrors.dob = "Date of Birth is Required";

    if (!formData.joinDate.trim()) newErrors.joinDate = "Join Date is Required";

    if (!formData.gender.trim()) newErrors.gender = "Gender is require";

    if (!formData.department.trim())
      newErrors.department = "Department is required";

    if (!formData.designation.trim())
      newErrors.designation = "Designation is required";

    if (!formData.address.trim()) newErrors.address = "Address is required";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = "Invalid email format";

    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^[0-9]{10}$/.test(formData.phone))
      newErrors.phone = "Phone must be 10 digits";

    if (!formData.password.trim()) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (!formData.role) newErrors.role = "Role is required";

    if (!formData.agree) newErrors.agree = "You must accept terms";

    if (!formData.employmentType)
      newErrors.employmentType = "Employment type is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ SUBMIT FIXED
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const data = new FormData();

      // 🔥 append all fields
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      // 🔥 append image (IMPORTANT)
      if (selectedFile) {
        data.append("profileImage", selectedFile);
      }

      await createEmployee(data);

      alert("✅ Employee Created");
      setFormData(initialState);
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  /* ==============================
     🔥 DELETE
  ============================== */
  const handleDeleteEmployees = async () => {
    if (!window.confirm("Are you sure?")) return;

    await Promise.all(selectedIds.map((id) => deleteEmployee(id)));
    setSelectedIds([]);
  };

  /* ==============================
     🔥 UPDATE
  ============================== */
  const handleUpdateEmployee = async () => {
    try {
      await updateEmployee(selectedEmployee._id, selectedEmployee);
      alert("Updated successfully");
      setShowModal(false);
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  const handleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(employees.map((emp) => emp._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleActiveEmployees = () => setFilter("active");
  const handleTerminatedEmployees = () => setFilter("terminated");
  const handleAllEmployees = () => setFilter("all");

  const filteredEmployees = employees.filter((emp) => {
    const matchesDepartment =
      selectedDepartment === "" ||
      emp.department?.toLowerCase() === selectedDepartment.toLowerCase();

    const search = searchEmployee.toLowerCase().trim();
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();

    const matchesSearch =
      fullName.includes(search) ||
      (emp.email || "").toLowerCase().includes(search) ||
      (emp.phone || "").includes(search);

    const matchesStatus = filter === "all" || emp.status === filter;

    return matchesDepartment && matchesSearch && matchesStatus;
  });

  return (
    <>
      <div className="manage-container">
        <div className="register-wrapper">
          <div className="register-header">
            <h3 className="card-title">Create Employee</h3>
          </div>

          <div className="register-card">
            <div className="form-grid">
              {/* First Name */}
              <div className="field-wrapper">
                <div className="input-group-m">
                  <span className="input-addon">First Name</span>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
                {errors.firstName && (
                  <small className="error">{errors.firstName}</small>
                )}
              </div>

              {/* Last Name */}
              <div className="field-wrapper">
                <div className="input-group-m">
                  <span className="input-addon">Last Name</span>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
                {errors.lastName && (
                  <small className="error">{errors.lastName}</small>
                )}
              </div>

              {/* DOB */}
              <div className="field-wrapper">
                <div className="input-group-m">
                  <span className="input-addon">Date of Birth</span>
                  <input
                    type="date"
                    max={new Date().toISOString().split("T")[0]}
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                  />
                </div>
                {errors.dob && <small className="error">{errors.dob}</small>}
              </div>

              {/* Gender */}
              <div className="field-wrapper">
                <div className="input-group-m">
                  <span className="input-addon">Gender</span>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="">Choose...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                {errors.gender && (
                  <small className="error">{errors.gender}</small>
                )}
              </div>

              {/* Join Date */}
              <div className="field-wrapper">
                <div className="input-group-m">
                  <span className="input-addon">Join Date</span>
                  <input
                    type="date"
                    max={new Date().toISOString().split("T")[0]}
                    name="joinDate"
                    value={formData.joinDate}
                    onChange={handleChange}
                  />
                </div>
                {errors.joinDate && (
                  <small className="error">{errors.joinDate}</small>
                )}
              </div>

              {/* Email */}
              <div className="field-wrapper">
                <div className="input-group-m">
                  <span className="input-addon">Email</span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                {errors.email && (
                  <small className="error">{errors.email}</small>
                )}
              </div>

              {/* Password */}
              <div className="field-wrapper">
                <div className="input-group-m">
                  <span className="input-addon">Password</span>

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                  />

                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>

                {errors.password && (
                  <small className="error">{errors.password}</small>
                )}
              </div>

              {/* Phone */}
              <div className="field-wrapper">
                <div className="input-group-m">
                  <span className="input-addon">Phone</span>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                {errors.phone && (
                  <small className="error">{errors.phone}</small>
                )}
              </div>

              {/* Address */}
              <div className="field-wrapper">
                <div className="input-group-m">
                  <span className="input-addon">Address</span>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
                {errors.address && (
                  <small className="error">{errors.address}</small>
                )}
              </div>

              {/* Role */}
              <div className="field-wrapper">
                <div className="input-group-m">
                  <span className="input-addon">Select Role</span>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="">-- Select Role --</option>
                    <option value="Admin">Admin</option>
                    <option value="Employee">Employee</option>
                  </select>
                </div>
                {errors.role && <small className="error">{errors.role}</small>}
              </div>

              {/* Department */}
              <div className="field-wrapper">
                <div className="input-group-m">
                  <span className="input-addon">Department</span>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                  >
                    <option value="">-- Select Department --</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="HR">HR</option>
                    <option value="IT">IT</option>
                  </select>
                </div>
                {errors.department && (
                  <small className="error">{errors.department}</small>
                )}
              </div>

              {/* Designation */}
              <div className="field-wrapper">
                <div className="input-group-m">
                  <span className="input-addon">Designation</span>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                  />
                </div>
                {errors.designation && (
                  <small className="error">{errors.designation}</small>
                )}
              </div>

              {/* Manager */}

              {formData.role !== "Admin" && (
                <div className="field-wrapper">
                  <div className="input-group-m">
                    <span className="input-addon">Manager</span>

                    <select
                      name="manager"
                      value={formData.manager}
                      onChange={handleChange}
                    >
                      <option value="">Select Manager</option>

                      {employees
                        .filter((emp) => emp.role && emp.role !== "Admin")
                        .map((emp) => (
                          <option key={emp._id} value={emp._id}>
                            {emp.firstName} {emp.lastName}
                          </option>
                        ))}
                    </select>
                  </div>

                  {errors.manager && (
                    <small className="error">{errors.manager}</small>
                  )}
                </div>
              )}

              {/* Employment Type */}
              <div className="field-wrapper">
                <div className="input-group-m">
                  <span className="input-addon">Employment Type</span>
                  <select
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleChange}
                  >
                    <option value="">-- Select Type --</option>
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Intern">Intern</option>
                  </select>
                </div>
                {errors.employmentType && (
                  <small className="error">{errors.employmentType}</small>
                )}
              </div>

              {/* Status */}
              <div className="field-wrapper">
                <div className="input-group-m">
                  <span className="input-addon">Status</span>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="field-wrapper">
                <div className="input-group-m">
                  <span className="input-addon">profile Image</span>

                  <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                  />
                </div>
                {errors.image && (
                  <small className="error">{errors.image}</small>
                )}
              </div>
            </div>

            {/* Checkbox FIXED */}
            <div className="checkbox-row">
              <input
                type="checkbox"
                name="agree"
                checked={formData.agree}
                onChange={handleChange}
              />
              <span>Agree to terms and conditions</span>
              {errors.agree && <p className="error">{errors.agree}</p>}
            </div>
          </div>

          {/* Button (unchanged structure) */}
          <div className="register-button">
            <button className="primary-btn" onClick={handleSubmit}>
              Register
            </button>
          </div>
        </div>

        {/* ===== Manage Employee Table (UNCHANGED) ===== */}
        <div className="left-section">
          <h4 className="mb-0 text-primary">Manage Employee</h4>
        </div>

        <div className="manageTable-head ">
          <div className="right-section w-100">
            <div className="d-flex flex-column flex-lg-row flex-nowrap gap-2 align-items-stretch align-items-lg-center">
              {/* Department Filter */}
              <select
                className="form-select form-select-sm w-100 w-lg-auto"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map((dept, index) => (
                  <option key={index} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>

              {/* Search */}
              <input
                type="text"
                placeholder="Search employee..."
                className="form-control form-control-sm w-100 w-lg-auto"
                value={searchEmployee}
                onChange={(e) => setSearchEmployee(e.target.value)}
              />

              {/* File */}
              <input
                type="file"
                className="form-control form-control-sm w-100 w-lg-auto"
              />

              {/* Buttons */}
              <button
                className="btn btn-secondary btn-sm w-100 w-lg-auto"
                onClick={handleAllEmployees}
              >
                All Employees
              </button>

              <button
                className="btn btn-danger btn-sm w-100 w-lg-auto"
                onClick={handleDeleteEmployees}
              >
                Delete Employees
              </button>

              <button
                className="btn btn-success btn-sm w-100 w-lg-auto"
                onClick={handleActiveEmployees}
              >
                Active Employees
              </button>

              <button
                className="btn btn-warning btn-sm w-100 w-lg-auto"
                onClick={handleTerminatedEmployees}
              >
                Terminated Employees
              </button>
            </div>
          </div>
        </div>
        <div className="card-d">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" onChange={handleSelectAll} />
                  </th>
                  <th>#</th>
                  <th>Employee Name</th>
                  <th>Gender</th>
                  <th>Phone</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Join Date</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp._id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(emp._id)}
                        onChange={() => handleSelect(emp._id)}
                      />
                    </td>
                    <td>{emp._id}</td>
                    <td>
                      {emp.firstName} {emp.lastName}
                    </td>
                    <td>{emp.gender}</td>
                    <td>{emp.phone}</td>
                    <td>{emp.department}</td>
                    <td>{emp.designation}</td>
                    <td>
                      {emp.joinDate
                        ? new Date(emp.joinDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => {
                          setSelectedEmployee(emp);
                          setShowModal(true);
                        }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && selectedEmployee && (
        <>
          <div className="modal fade show custom-modal d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-fullscreen-sm-down">
              <div className="modal-content border-0 shadow-lg rounded-4 custom-modal-content">
                {/* Header */}
                <div className="modal-header gradient-header text-white flex-wrap gap-2">
                  <h5 className="modal-title fw-semibold">Edit Employee</h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>

                {/* Body */}
                <div className="modal-body p-3 p-md-4">
                  <div className="row g-3">
                    {/* Employee ID (readonly) */}
                    <div className="col-md-4">
                      <label className="form-label">Employee ID</label>
                      <input
                        type="text"
                        className="form-control"
                        value={selectedEmployee.employeeId || ""}
                        disabled
                      />
                    </div>

                    {/* First Name */}
                    <div className="col-md-4">
                      <label className="form-label">First Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={selectedEmployee.firstName || ""}
                        onChange={(e) =>
                          setSelectedEmployee({
                            ...selectedEmployee,
                            firstName: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Last Name */}
                    <div className="col-md-4">
                      <label className="form-label">Last Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={selectedEmployee.lastName || ""}
                        onChange={(e) =>
                          setSelectedEmployee({
                            ...selectedEmployee,
                            lastName: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Email */}
                    <div className="col-md-4">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={selectedEmployee.email || ""}
                        onChange={(e) =>
                          setSelectedEmployee({
                            ...selectedEmployee,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Phone */}
                    <div className="col-md-4">
                      <label className="form-label">Phone</label>
                      <input
                        type="text"
                        className="form-control"
                        value={selectedEmployee.phone || ""}
                        onChange={(e) =>
                          setSelectedEmployee({
                            ...selectedEmployee,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* DOB */}
                    <div className="col-md-4">
                      <label className="form-label">Date of Birth</label>
                      <input
                        type="date"
                        className="form-control"
                        value={selectedEmployee.dob || ""}
                        onChange={(e) =>
                          setSelectedEmployee({
                            ...selectedEmployee,
                            dob: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Gender */}
                    <div className="col-md-4">
                      <label className="form-label">Gender</label>
                      <select
                        className="form-control"
                        value={selectedEmployee.gender || ""}
                        onChange={(e) =>
                          setSelectedEmployee({
                            ...selectedEmployee,
                            gender: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>

                    {/* Join Date */}
                    <div className="col-md-4">
                      <label className="form-label">Join Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={selectedEmployee.joinDate || ""}
                        onChange={(e) =>
                          setSelectedEmployee({
                            ...selectedEmployee,
                            joinDate: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Address */}
                    <div className="col-md-4">
                      <label className="form-label">Address</label>
                      <input
                        type="text"
                        className="form-control"
                        value={selectedEmployee.address || ""}
                        onChange={(e) =>
                          setSelectedEmployee({
                            ...selectedEmployee,
                            address: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Role */}
                    <div className="col-md-4">
                      <label className="form-label">Role</label>
                      <select
                        className="form-control"
                        value={selectedEmployee.role || ""}
                        onChange={(e) =>
                          setSelectedEmployee({
                            ...selectedEmployee,
                            role: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Role</option>
                        <option value="Admin">Admin</option>
                        <option value="Employee">Employee</option>
                      </select>
                    </div>

                    {/* Department */}
                    <div className="col-md-4">
                      <label className="form-label">Department</label>
                      <input
                        type="text"
                        className="form-control"
                        value={selectedEmployee.department || ""}
                        onChange={(e) =>
                          setSelectedEmployee({
                            ...selectedEmployee,
                            department: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Designation */}
                    <div className="col-md-4">
                      <label className="form-label">Designation</label>
                      <input
                        type="text"
                        className="form-control"
                        value={selectedEmployee.designation || ""}
                        onChange={(e) =>
                          setSelectedEmployee({
                            ...selectedEmployee,
                            designation: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Manager */}

                    {selectedEmployee.role !== "Admin" && (
                      <div className="col-md-4">
                        <label className="form-label">Manager</label>

                        <select
                          className="form-control"
                          value={
                            selectedEmployee.manager?._id ||
                            selectedEmployee.manager ||
                            ""
                          }
                          onChange={(e) =>
                            setSelectedEmployee({
                              ...selectedEmployee,
                              manager: e.target.value,
                            })
                          }
                        >
                          <option value="">Select Manager</option>

                          {employees
                            .filter((emp) => emp.role !== "Admin")
                            .map((emp) => (
                              <option key={emp._id} value={emp._id}>
                                {emp.firstName} {emp.lastName}
                              </option>
                            ))}
                        </select>
                      </div>
                    )}

                    {/* Salary */}

                    {/* Employment Type */}
                    <div className="col-md-4">
                      <label className="form-label">Employment Type</label>
                      <select
                        className="form-control"
                        value={selectedEmployee.employmentType || ""}
                        onChange={(e) =>
                          setSelectedEmployee({
                            ...selectedEmployee,
                            employmentType: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Type</option>
                        <option value="Full-Time">Full-Time</option>
                        <option value="Part-Time">Part-Time</option>
                        <option value="Intern">Intern</option>
                      </select>
                    </div>

                    {/* Status */}
                    <div className="col-md-4">
                      <label className="form-label">Status</label>
                      <select
                        className="form-control"
                        value={selectedEmployee.status || ""}
                        onChange={(e) =>
                          setSelectedEmployee({
                            ...selectedEmployee,
                            status: e.target.value,
                          })
                        }
                      >
                        <option value="active">Active</option>
                        <option value="terminated">Terminated</option>
                      </select>
                    </div>

                    {/* Profile Image */}
                    <div className="col-md-4">
                      <label className="form-label">Profile Image</label>
                      <input
                        type="file"
                        className="form-control"
                        onChange={(e) =>
                          setSelectedEmployee({
                            ...selectedEmployee,
                            profile: e.target.files[0],
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="modal-footer border-0 px-3 px-md-4 pb-3 pb-md-4 d-flex flex-column flex-sm-row gap-2">
                  <button
                    className="btn btn-outline-secondary w-100 w-sm-auto"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>

                  {/* ✅ FIXED VALIDATION */}
                  <button
                    className="btn btn-primary px-4 w-100 w-sm-auto"
                    disabled={
                      !selectedEmployee.firstName ||
                      !selectedEmployee.phone ||
                      !selectedEmployee.department
                    }
                    onClick={handleUpdateEmployee}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            className="modal-backdrop fade show"
            onClick={() => setShowModal(false)}
          ></div>
        </>
      )}
    </>
  );
};

export default ManageEmployees;
