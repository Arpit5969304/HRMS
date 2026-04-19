import React, { useState } from "react";

const ManageHoliday = () => {
  const [holidays, setHolidays] = useState([
    {
      id: 1,
      name: "Republic Day",
      date: "2025-01-26",
      description: "National Holiday",
      isNational: true,
      approved: true,
    },
    {
      id: 2,
      name: "Independence Day",
      date: "2025-08-15",
      description: "National Holiday",
      isNational: true,
      approved: true,
    },
    {
      id: 3,
      name: "Diwali",
      date: "2025-10-20",
      description: "Festival of Lights",
      isNational: false,
      approved: false,
    },
  ]);

  const [formData, setFormData] = useState({
    id: null,
    name: "",
    date: "",
    description: "",
    isNational: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSave = () => {
    if (!formData.name || !formData.date) {
      alert("Please fill required fields");
      return;
    }

    if (formData.id) {
      setHolidays(
        holidays.map((h) => (h.id === formData.id ? { ...h, ...formData } : h)),
      );
    } else {
      const newHoliday = {
        ...formData,
        id: Date.now(),
        approved: false,
      };
      setHolidays([...holidays, newHoliday]);
    }

    handleClear();
  };

  const handleEdit = (holiday) => {
    setFormData(holiday);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure to delete?")) {
      setHolidays(holidays.filter((h) => h.id !== id));
    }
  };

  const handleApproveToggle = (id) => {
    setHolidays(
      holidays.map((h) => (h.id === id ? { ...h, approved: !h.approved } : h)),
    );
  };

  const handleClear = () => {
    setFormData({
      id: null,
      name: "",
      date: "",
      description: "",
      isNational: false,
    });
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-GB");
  };

  return (
    <div className="container-fluid p-3 p-md-4 bg-light">
      {/* Add / Edit Holiday */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-primary text-white fw-semibold">
          Add / Edit Holiday
        </div>

        <div className="card-body">
          <div className="row g-3">
            <div className="col-12 col-sm-6 col-lg-4">
              <label className="form-label">Holiday Name</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter holiday name"
              />
            </div>

            <div className="col-12 col-sm-6 col-lg-4">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-control"
                name="date"
                value={formData.date}
                onChange={handleChange}
              />
            </div>

            <div className="col-12 col-sm-6 col-lg-4 d-flex align-items-center">
              <div className="form-check mt-2 mt-md-0">
                <input
                  type="checkbox"
                  className="form-check-input"
                  name="isNational"
                  checked={formData.isNational}
                  onChange={handleChange}
                />
                <label className="form-check-label">Is National Holiday?</label>
              </div>
            </div>

            <div className="col-12">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows="2"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter description"
              ></textarea>
            </div>

            <div className="col-12 d-flex flex-column flex-sm-row justify-content-end gap-2">
              <button
                className="btn btn-success  w-sm-auto"
                onClick={handleSave}
              >
                {formData.id ? "Update Holiday" : "Save Holiday"}
              </button>

              <button
                className="btn btn-secondary  w-sm-auto"
                onClick={handleClear}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Manage Holiday Table */}
      <div className="card shadow-sm">
        <div className="card-header bg-info text-white fw-semibold">
          Manage Holiday
        </div>

        <div className="card-body p-0 table-responsive">
          <table className="table table-bordered table-hover mb-0 text-nowrap">
            <thead className="table-light">
              <tr>
                <th>Holiday Name</th>
                <th>Date</th>
                <th>Description</th>
                <th className="text-center">National?</th>
                <th className="text-center">Approved?</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {holidays.map((holiday) => (
                <tr key={holiday.id}>
                  <td>{holiday.name}</td>
                  <td>{formatDate(holiday.date)}</td>
                  <td>{holiday.description}</td>

                  <td className="text-center">
                    {holiday.isNational ? (
                      <span className="text-success fw-bold">✔</span>
                    ) : (
                      <span className="text-danger fw-bold">✖</span>
                    )}
                  </td>

                  <td className="text-center">
                    <input
                      type="checkbox"
                      checked={holiday.approved}
                      onChange={() => handleApproveToggle(holiday.id)}
                    />
                  </td>
                  <td className="text-center">
                    <div className="d-flex justify-content-center flex-nowrap gap-1">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleEdit(holiday)}
                      >
                        ✏
                      </button>

                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(holiday.id)}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {holidays.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-3">
                    No holidays found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageHoliday;
