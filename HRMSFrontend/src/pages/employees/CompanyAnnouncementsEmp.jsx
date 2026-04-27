import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import API from "../../utils/axios";

const CompanyAnnouncementsEmp = () => {

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ==============================
     🔥 FETCH ANNOUNCEMENTS
  ============================== */
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await API.get("/announcements");
      setAnnouncements(res.data);
    } catch (error) {
      console.error("Error fetching announcements", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-CA");

  return (
    <div className="container py-4">

      <div className="card shadow-sm border-0">

        <div className="card-header bg-white">
          <h5 className="mb-0 fw-bold text-primary">
            Company Announcements
          </h5>
        </div>

        <div className="card-body">

          {loading ? (
            <p className="text-center">Loading...</p>
          ) : announcements.length > 0 ? (

            <div className="row g-3">

              {announcements.map((item) => (

                <div key={item._id} className="col-md-6">

                  <div className="card border-0 shadow-sm h-100">

                    <div className="card-body">

                      <div className="d-flex justify-content-between align-items-center mb-2">

                        <h6 className="fw-bold mb-0">
                          {item.title}
                        </h6>

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

                      </div>

                      <p className="text-muted mb-2">
                        {item.message}
                      </p>

                      <small className="text-secondary">
                        📅 {formatDate(item.createdAt)}
                      </small>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          ) : (

            <div className="text-center text-muted py-4">
              No announcements available
            </div>

          )}

        </div>

      </div>

    </div>
  );
};

export default CompanyAnnouncementsEmp;