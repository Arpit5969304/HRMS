import React, { useEffect, useState } from "react";
import API from "../../utils/axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../assets/styles/DocumentVarify.css";

const DocumentVerify = () => {
  const [documents, setDocuments] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  /* ==============================
     🔥 FETCH ALL DOCUMENTS (ADMIN)
  ============================== */
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await API.get("/documents/all");
      setDocuments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  /* ==============================
     🔥 UPDATE STATUS
  ============================== */
  const handleStatus = async (id, status) => {
    try {
      let rejectionReason = "";

      if (status === "Rejected") {
        rejectionReason = prompt("Enter rejection reason:");
        if (!rejectionReason) return;
      }

      await API.put(`/documents/status/${id}`, {
        status,
        rejectionReason,
      });

      fetchDocuments();

    } catch (err) {
      alert("Status update failed");
    }
  };

  /* ==============================
     🔥 DOWNLOAD FILE
  ============================== */
  const handleDownload = (filePath) => {
    window.open(filePath, "_blank"); // cloudinary url direct
  };

  /* ==============================
     🔥 FILTER LOGIC
  ============================== */
  const filteredDocs = documents.filter((doc) => {
    const matchStatus = statusFilter
      ? doc.status === statusFilter
      : true;

    const matchSearch = `${doc.employee?.firstName || ""} ${doc.employee?.lastName || ""}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchStatus && matchSearch;
  });

  return (
    <div className="container py-4 admin-document-verify-page">
      <div className="card shadow-sm">

        {/* Header */}
        <div className="card-header bg-white d-flex flex-wrap gap-2 justify-content-between align-items-center">

          <h5 className="mb-0 text-primary fw-bold">
            Employee Document Verification
          </h5>

          {/* FILTER + SEARCH */}
          <div className="d-flex flex-column flex-md-row gap-2 w-100 w-md-auto">

            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Verified">Verified</option>
              <option value="Rejected">Rejected</option>
            </select>

            <input
              type="text"
              placeholder="Search employee..."
              className="form-control"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

          </div>
        </div>

        <div className="card-body">

          {/* Table */}
          <div className="table-responsive admin-doc-scroll">

            <table className="table table-bordered table-hover">

              <thead className="table-light">
                <tr>
                  <th>Employee</th>
                  <th>Document Name</th>
                  <th>File</th>
                  <th>Upload Date</th>
                  <th>Status</th>
                  <th style={{ width: "240px" }}>Actions</th>
                </tr>
              </thead>

              <tbody>

                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center">Loading...</td>
                  </tr>
                ) : filteredDocs.length > 0 ? (
                  filteredDocs.map((doc) => (
                    <tr key={doc._id}>

                      <td className="fw-semibold">
                        {doc.employee?.firstName} {doc.employee?.lastName}
                      </td>

                      <td>{doc.documentName}</td>

                      <td>{doc.fileName}</td>

                      <td>
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            doc.status === "Verified"
                              ? "bg-success"
                              : doc.status === "Rejected"
                              ? "bg-danger"
                              : "bg-warning text-dark"
                          }`}
                        >
                          {doc.status}
                        </span>
                      </td>

                      <td className="d-flex gap-2">

                        <button
                          className="btn btn-sm btn-info"
                          onClick={() => handleDownload(doc.filePath)}
                        >
                          View
                        </button>

                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleStatus(doc._id, "Verified")}
                        >
                          Approve
                        </button>

                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleStatus(doc._id, "Rejected")}
                        >
                          Reject
                        </button>

                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">
                      No matching records found
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

export default DocumentVerify;