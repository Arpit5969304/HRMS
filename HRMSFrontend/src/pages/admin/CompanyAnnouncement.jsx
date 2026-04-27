import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import API from "../../utils/axios";

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
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ==============================
     🔥 FETCH DATA
  ============================== */
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await API.get("/announcements");
      setAnnouncements(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  /* ==============================
     🔥 HANDLE CHANGE
  ============================== */
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

  /* ==============================
     🔥 VALIDATION
  ============================== */
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

  /* ==============================
     🔥 SUBMIT (CREATE / UPDATE)
  ============================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      if (editId) {
        await API.put(`/announcements/${editId}`, formData);
      } else {
        await API.post("/announcements", formData);
      }

      fetchAnnouncements();
      setFormData(initialState);
      setEditId(null);
      setErrors({});
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Error saving announcement");
    }
  };

  /* ==============================
     🔥 DELETE
  ============================== */
  const handleDelete = async (id) => {

    if (!window.confirm("Delete this announcement?")) return;

    try {
      await API.delete(`/announcements/${id}`);
      fetchAnnouncements();
    } catch (error) {
      console.error(error);
      alert("Delete failed");
    }
  };

  /* ==============================
     🔥 EDIT
  ============================== */
  const handleEdit = (item) => {
    setFormData({
      title: item.title,
      message: item.message,
      department: item.department,
      priority: item.priority,
      expiryDate: item.expiryDate?.slice(0, 10),
    });

    setEditId(item._id);
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-CA");

  return (
    <div className="container py-4">

      <div className="card shadow-sm">

        <div className="card-header bg-white">
          <h5 className="mb-0 text-primary fw-bold">
            Company Announcements
          </h5>
        </div>

        <div className="card-body">

          {/* FORM */}
          <form onSubmit={handleSubmit} className="row g-3 mb-4">

            <div className="col-md-6">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-control"
                name="title"
                value={formData.title}
                onChange={handleChange}
              />
              {errors.title && <small className="text-danger">{errors.title}</small>}
            </div>

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

            <div className="col-md-9">
              <label className="form-label">Message</label>
              <textarea
                className="form-control"
                rows="3"
                name="message"
                value={formData.message}
                onChange={handleChange}
              />
              {errors.message && <small className="text-danger">{errors.message}</small>}
            </div>

            <div className="col-md-3">
              <label className="form-label">Expiry Date</label>
              <input
                type="date"
                className="form-control"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
              />
              {errors.expiryDate && <small className="text-danger">{errors.expiryDate}</small>}
            </div>

            <div className="col-12 text-end">
              <button className="btn btn-primary">
                {editId ? "Update Announcement" : "Create Announcement"}
              </button>
            </div>

          </form>

          {/* TABLE */}
          <div className="table-responsive">
            {loading ? (
              <p className="text-center">Loading...</p>
            ) : (
              <table className="table table-bordered table-hover">

                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Department</th>
                    <th>Priority</th>
                    <th>Created</th>
                    <th>Expiry</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {announcements.length > 0 ? (
                    announcements.map((item, index) => (
                      <tr key={item._id}>

                        <td>{index + 1}</td>
                        <td>{item.title}</td>
                        <td>{item.department}</td>

                        <td>
                          <span className={`badge ${
                            item.priority === "High"
                              ? "bg-danger"
                              : item.priority === "Medium"
                              ? "bg-warning text-dark"
                              : "bg-secondary"
                          }`}>
                            {item.priority}
                          </span>
                        </td>

                        <td>{formatDate(item.createdAt)}</td>
                        <td>{formatDate(item.expiryDate)}</td>

                        <td className="d-flex gap-2">

                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => handleEdit(item)}
                          >
                            Edit
                          </button>

                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(item._id)}
                          >
                            Delete
                          </button>

                        </td>

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center">
                        No announcements available
                      </td>
                    </tr>
                  )}
                </tbody>

              </table>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default CompanyAnnouncement;