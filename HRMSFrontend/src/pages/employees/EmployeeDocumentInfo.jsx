import React, { useState } from "react";
import "../../assets/styles/EmployeDocuments.css"
import "bootstrap/dist/css/bootstrap.min.css";

const EmployeeDocumentInfo = () => {

  const [documents, setDocuments] = useState([
    {
    
      name: "Aadhar Card",
      fileName: "aadhar.pdf",
      uploadDate: "12 Feb 2026",
      status: "Verified"
    },
    {
    
      name: "PAN Card",
      fileName: "pan.pdf",
      uploadDate: "15 Feb 2026",
      status: "Pending"
    }
  ]);

  const [docName, setDocName] = useState("");
  const [file, setFile] = useState(null);

  const handleUpload = (e) => {
    e.preventDefault();

    if (!docName || !file) {
      alert("Please select document name and file");
      return;
    }

    const newDoc = {
      name: docName,
      fileName: file.name,
      uploadDate: new Date().toLocaleDateString(),
      status: "Pending"
    };

    setDocuments([...documents, newDoc]);

    setDocName("");
    setFile(null);
  };

  const handleDelete = (id) => {
    const filtered = documents.filter((doc) => doc.id !== id);
    setDocuments(filtered);
  };

  const handleDownload = (fileName) => {
    alert(`Downloading ${fileName}`);
  };

  return (
    <div className="container py-4">

      <div className="card shadow-sm">

        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0 text-primary fw-bold"> Documents</h5>
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
              <button className="btn btn-primary w-100">
                Upload Document
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
                  <th style={{width:"200px"}}>Actions</th>
                </tr>
              </thead>

              <tbody>

                {documents.length > 0 ? (
                  documents.map((doc, index) => (
                    <tr key={doc.id}>


                      <td>{doc.name}</td>

                      <td>{doc.fileName}</td>

                      <td>{doc.uploadDate}</td>

                      <td>
                        <span
                          className={`badge ${
                            doc.status === "Verified"
                              ? "bg-success"
                              : "bg-warning text-dark"
                          }`}
                        >
                          {doc.status}
                        </span>
                      </td>

                      <td className="d-flex gap-2">

                        <button
                          className="btn btn-sm btn-info"
                          onClick={() => handleDownload(doc.fileName)}
                        >
                          Download
                        </button>

                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(doc.id)}
                        >
                          Delete
                        </button>

                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">
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