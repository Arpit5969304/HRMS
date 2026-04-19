import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../assets/styles/DocumentVarify.css";


const DocumentVerify = () => {

  const [documents, setDocuments] = useState([
    {
      id: 1,
      employeeName: "Kritika Sharma",
      name: "Aadhar Card",
      fileName: "aadhar.pdf",
      uploadDate: "12 Feb 2026",
      status: "Pending",
    },
    {
      id: 2,
      employeeName: "Rahul Verma",
      name: "PAN Card",
      fileName: "pan.pdf",
      uploadDate: "15 Feb 2026",
      status: "Verified",
    },
     {
      id: 3,
      employeeName: "Kritika Sharma",
      name: "PAN Card",
      fileName: "aadhar.pdf",
      uploadDate: "12 Feb 2026",
      status: "Pending",
    },
  ]);

  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const handleStatus = (id, status) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id ? { ...doc, status } : doc
      )
    );
  };

  const handleDownload = (fileName) => {
    alert(`Downloading ${fileName}`);
  };

  /* ===== FILTER LOGIC ===== */
  const filteredDocs = documents.filter((doc) => {
    const matchStatus = statusFilter
      ? doc.status === statusFilter
      : true;

    const matchSearch = doc.employeeName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchStatus && matchSearch;
  });

  return (
    <div className="container py-4">

      <div className="card shadow-sm">

        {/* Header */}
        <div className="card-header bg-white d-flex flex-wrap gap-2 justify-content-between align-items-center">

          <h5 className="mb-0 text-primary fw-bold">
            Employee Document Verification
          </h5>

          {/* 🔥 FILTER + SEARCH */}
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
                  <th style={{ width: "220px" }}>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredDocs.length > 0 ? (
                  filteredDocs.map((doc) => (
                    <tr key={doc.id}>

                      <td className="fw-semibold">
                        {doc.employeeName}
                      </td>

                      <td>{doc.name}</td>

                      <td>{doc.fileName}</td>

                      <td>{doc.uploadDate}</td>

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

                      <td className="d-flex">

                        <button
                          className="btn btn-sm btn-info"
                          onClick={() => handleDownload(doc.fileName)}
                        >
                          Download
                        </button>

                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleStatus(doc.id, "Verified")}
                        >
                          Approve
                        </button>

                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleStatus(doc.id, "Rejected")}
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