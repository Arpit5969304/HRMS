import React, { useState, useEffect } from "react";
import API from "../../utils/axios";

const ManageHoliday = () => {
  const [holidays, setHolidays] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    id: null,
    name: "",
    date: "",
    description: "",
    isNational: false,
  });

  /* ==============================
     🔥 FETCH HOLIDAYS
  ============================== */
  const fetchHolidays = async () => {
    try {
      setLoading(true);

      const res = await API.get("/holidays"); // ✅ FIXED

      
      console.log(res);

      setHolidays(res.data.data || []);
    } catch (error) {
      console.error("FETCH ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  /* ==============================
     🔥 VALIDATION
  ============================== */
  const validate = () => {
    let newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Holiday name is required";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    return newErrors;
  };

  /* ==============================
     🔥 HANDLE CHANGE
  ============================== */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    setErrors({
      ...errors,
      [name]: "",
    });
  };

  /* ==============================
     🔥 CREATE / UPDATE
  ============================== */
  const handleSave = async () => {
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      if (formData.id) {
        // UPDATE
        await API.put(`/holidays/${formData.id}`, formData);
      } else {
        // CREATE
        await API.post("/holidays", formData);
      }

      fetchHolidays();
      handleClear();
    } catch (error) {
      console.error("SAVE ERROR:", error);
      alert(error.response?.data?.message || "Error saving holiday");
    }
  };

  /* ==============================
     🔥 EDIT
  ============================== */
  const handleEdit = (holiday) => {
    setFormData({
      id: holiday._id,
      name: holiday.name,
      date: holiday.date?.slice(0, 10),
      description: holiday.description || "",
      isNational: holiday.isNational,
    });
  };

  /* ==============================
     🔥 DELETE
  ============================== */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete?")) return;

    try {
      await API.delete(`/holidays/${id}`); // ✅ FIXED
      fetchHolidays();
    } catch (error) {
      console.error("DELETE ERROR:", error);
    }
  };

  /* ==============================
     🔥 APPROVE TOGGLE
  ============================== */
  const handleApproveToggle = async (id) => {
    try {
      await API.patch(`/holidays/${id}/approve`); // ✅ FIXED
      fetchHolidays();
    } catch (error) {
      console.error("APPROVE ERROR:", error);
    }
  };

  /* ==============================
     🔥 CLEAR FORM
  ============================== */
  const handleClear = () => {
    setFormData({
      id: null,
      name: "",
      date: "",
      description: "",
      isNational: false,
    });
    setErrors({});
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB");
  };

  return (
    <div className="container-fluid p-3 bg-light">
      {/* FORM */}
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          Add / Edit Holiday
        </div>

        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <input
                type="text"
                className={`form-control ${errors.name ? "is-invalid" : ""}`}
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Holiday Name"
              />
              {errors.name && (
                <div className="invalid-feedback">{errors.name}</div>
              )}
            </div>

            <div className="col-md-4">
              <input
                type="date"
                className={`form-control ${errors.date ? "is-invalid" : ""}`}
                name="date"
                value={formData.date}
                onChange={handleChange}
              />
              {errors.date && (
                <div className="invalid-feedback">{errors.date}</div>
              )}
            </div>

            <div className="col-md-4 d-flex align-items-center">
              <input
                type="checkbox"
                name="isNational"
                checked={formData.isNational}
                onChange={handleChange}
              />
              <span className="ms-2">National Holiday</span>
            </div>

            <div className="col-12">
              <textarea
                className="form-control"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description"
              />
            </div>

            <div className="col-12 text-end">
              <button className="btn btn-success me-2" onClick={handleSave}>
                {formData.id ? "Update" : "Save"}
              </button>
              <button className="btn btn-secondary" onClick={handleClear}>
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="card">
        <div className="card-header bg-info text-white">
          Manage Holidays
        </div>

        <div className="card-body">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th>National</th>
                  <th>Approved</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {holidays.map((h) => (
                  <tr key={h._id}>
                    <td>{h.name}</td>
                    <td>{formatDate(h.date)}</td>
                    <td>{h.description}</td>

                    <td>{h.isNational ? "✔" : "✖"}</td>

                    <td>
                      <input
                        type="checkbox"
                        checked={h.approved}
                        onChange={() => handleApproveToggle(h._id)}
                      />
                    </td>

                    <td>
                      <button
                        className="btn btn-sm btn-primary me-2"
                        onClick={() => handleEdit(h)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(h._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageHoliday;