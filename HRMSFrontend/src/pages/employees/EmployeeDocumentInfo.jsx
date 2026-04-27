import React, { useEffect, useState } from "react";
import API from "../../utils/axios";
import "../../assets/styles/EmployeDocuments.css";
import "bootstrap/dist/css/bootstrap.min.css";

const EmployeeDocumentInfo = () => {
  const [documents, setDocuments] = useState([]);
  const [docName, setDocName] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ==============================
     🔥 FETCH DOCUMENTS
  ============================== */
  const fetchDocuments = async () => {
    try {
      const res = await API.get("/documents/my-documents");
      setDocuments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  /* ==============================
     🔥 UPLOAD DOCUMENT
  ============================== */
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!docName || !file) {
      alert("Please select document name and file");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("documentName", docName);
      formData.append("document", file); // ⚠️ must match backend

      await API.post("/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("✅ Document uploaded");

      setDocName("");
      setFile(null);
      fetchDocuments();

    } catch (err) {
      alert(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  /* ==============================
     🔥 DELETE DOCUMENT
  ============================== */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this document?")) return;

    try {
      await API.delete(`/documents/delete/${id}`);
      fetchDocuments();
    } catch (err) {
      alert("Delete failed");
    }
  };

  /* ==============================
     🔥 DOWNLOAD DOCUMENT
  ============================== */
  const handleDownload = (filePath) => {
    window.open(`http://localhost:5000/${filePath}`, "_blank");
  };

  return (
    <div className="container py-4 employee-documents-page">
      <div className="card shadow-sm">

        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0 text-primary fw-bold">Documents</h5>
        </div>

        <div className="card-body">

          {/* Upload Form */}
          <form className="row g-3 mb-4" onSubmit={handleUpload}>

            <div className="col-md-4">
              <label className="form-label">Document Type</label>
              <select
                className="form-select"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
              >
                <option value="">Select Document</option>
                <option>Aadhar Card</option>
                <option>PAN Card</option>
                <option>Resume</option>
                <option>Offer Letter</option>
                <option>Experience Letter</option>
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label">Upload File</label>
              <input
                type="file"
                className="form-control"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>

            <div className="col-md-4 d-flex align-items-end">
              <button className="btn btn-primary w-100" disabled={loading}>
                {loading ? "Uploading..." : "Upload Document"}
              </button>
            </div>

          </form>

          {/* Document Table */}
          <div className="table-responsive">

            <table className="table table-bordered table-hover">

              <thead className="table-light">
                <tr>
                  <th>Document Name</th>
                  <th>File</th>
                  <th>Upload Date</th>
                  <th>Status</th>
                  <th style={{ width: "200px" }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {documents.length > 0 ? (
                  documents.map((doc) => (
                    <tr key={doc._id}>

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
                          Download
                        </button>

                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(doc._id)}
                        >
                          Delete
                        </button>

                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">
                      No documents uploaded
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

export default EmployeeDocumentInfo;
