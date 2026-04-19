import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const CompanyAnnouncement = () => {

  const initialState = {
    title: "",
    message: "",
    department: "All",
    priority: "Normal",
    expiryDate: ""
  };

  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);

  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: "Office Holiday",
      message: "Office will remain closed on 26 January.",
      department: "All",
      priority: "High",
      date: "20 Jan 2026",
      expiryDate: "2026-01-26"
    }
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });

    setErrors({
      ...errors,
      [name]: ""
    });
  };

  const validate = () => {

    let newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    if (!formData.expiryDate) {
      newErrors.expiryDate = "Expiry date is required";
    } else {
      const today = new Date().toISOString().split("T")[0];

      if (formData.expiryDate < today) {
        newErrors.expiryDate = "Expiry date cannot be in the past";
      }
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

    if (editId) {

      const updated = announcements.map((a) =>
        a.id === editId ? { ...a, ...formData } : a
      );

      setAnnouncements(updated);
      setEditId(null);

    } else {

      const newAnnouncement = {
        id: Date.now(),
        ...formData,
        date: new Date().toLocaleDateString()
      };

      setAnnouncements([...announcements, newAnnouncement]);
    }

    setFormData(initialState);
    setErrors({});
  };

  const handleDelete = (id) => {

    if (!window.confirm("Are you sure you want to delete this announcement?"))
      return;

    const filtered = announcements.filter((a) => a.id !== id);
    setAnnouncements(filtered);
  };

  const handleEdit = (item) => {
    setFormData(item);
    setEditId(item.id);
  };

  return (
    <div className="container py-4">

      <div className="card shadow-sm">

        <div className="card-header bg-white">
          <h5 className="mb-0 text-primary fw-bold">
            Company Announcements
          </h5>
        </div>

        <div className="card-body">

          {/* Form */}

          <form onSubmit={handleSubmit} className="row g-3 mb-4">

            {/* Title */}
            <div className="col-md-6">
              <label className="form-label">Title</label>

              <input
                type="text"
                className="form-control"
                name="title"
                value={formData.title}
                onChange={handleChange}
              />

              {errors.title && (
                <small className="text-danger">
                  {errors.title}
                </small>
              )}
            </div>

            {/* Department */}
            <div className="col-md-3">
              <label className="form-label">Department</label>

              <select
                className="form-select"
                name="department"
                value={formData.department}
                onChange={handleChange}
              >
                <option>All</option>
                <option>HR</option>
                <option>IT</option>
                <option>Finance</option>
              </select>
            </div>

            {/* Priority */}
            <div className="col-md-3">
              <label className="form-label">Priority</label>

              <select
                className="form-select"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option>Normal</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>

            {/* Message */}
            <div className="col-md-9">
              <label className="form-label">Message</label>

              <textarea
                className="form-control"
                rows="3"
                name="message"
                value={formData.message}
                onChange={handleChange}
              />

              {errors.message && (
                <small className="text-danger">
                  {errors.message}
                </small>
              )}
            </div>

            {/* Expiry */}
            <div className="col-md-3">
              <label className="form-label">Expiry Date</label>

              <input
                type="date"
                className="form-control"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
              />

              {errors.expiryDate && (
                <small className="text-danger">
                  {errors.expiryDate}
                </small>
              )}
            </div>

            {/* Button */}
            <div className="col-12 text-end">

              <button className="btn btn-primary">
                {editId ? "Update Announcement" : "Create Announcement"}
              </button>

            </div>

          </form>

          {/* Table */}

          <div className="table-responsive">

            <table className="table table-bordered table-hover">

              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Department</th>
                  <th>Priority</th>
                  <th>Date</th>
                  <th>Expiry</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {announcements.length > 0 ? (
                  announcements.map((item, index) => (
                    <tr key={item.id}>

                      <td>{index + 1}</td>

                      <td>{item.title}</td>

                      <td>{item.department}</td>

                      <td>
                        <span
                          className={`badge ${
                            item.priority === "High"
                              ? "bg-danger"
                              : item.priority === "Medium"
                              ? "bg-warning text-dark"
                              : "bg-secondary"
                          }`}
                        >
                          {item.priority}
                        </span>
                      </td>

                      <td>{item.date}</td>

                      <td>{item.expiryDate}</td>

                      <td className="d-flex gap-2">

                        <button
                          className="btn btn-sm btn-warning"
                          onClick={() => handleEdit(item)}
                        >
                          Edit
                        </button>

                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </button>

                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center text-muted">
                      No announcements available
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
};

export default CompanyAnnouncement;