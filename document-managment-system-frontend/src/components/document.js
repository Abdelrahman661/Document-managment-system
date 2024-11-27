import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { DocumentContext } from "../context/documentContext";
import { Modal, Button, Spinner } from "react-bootstrap";
import "./style/dashboard.css";
import "./style/document.css";
import { useWorkspace } from "../context/workspaceContext";

const Document = () => {
  const { id, workspaceId } = useParams();
  const navigate = useNavigate();

  const {
    documents = [],
    fileData,
    fetchDocuments,
    fetchDocumentPreview,
    deleteDocument,
    uploadDocument,
  } = useContext(DocumentContext);

  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    workspaceId: workspaceId || "",
    version: "",
    tags: "",
    accessControls: "",
  });
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [previewFileType, setPreviewFileType] = useState("");
  const [previewFile, setPreviewFile] = useState("");
  const [downloadFileName, setDownloadFileName] = useState("");
  const [mimeType, setMimeType] = useState("");
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const { fetchWorkspace, workspace } = useWorkspace();

  useEffect(() => {
    if (workspaceId) {
      fetchDocuments(workspaceId);
      fetchWorkspace(workspaceId);
    }
    if (id) {
      fetchDocumentPreview(id);
    }
  }, [workspaceId, id, uploading]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
      setNotification({
        type: "error",
        message: "File size exceeds the 5MB limit.",
      });
      setFile(null);
    } else {
      setFile(selectedFile);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setNotification({
        type: "error",
        message: "Please select a file to upload.",
      });
      return;
    }

    try {
      setUploading(true);
      await uploadDocument(file, formData);
      setNotification({
        type: "success",
        message: "Document uploaded successfully!",
      });

      setTimeout(() => {
        setNotification(null);
      }, 2000);
    } catch (error) {
      setNotification({ type: "error", message: "Document upload failed!" });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this document?"
    );
    if (!confirmDelete) return;

    try {
      setDeleting(true);
      await deleteDocument(documentId);
      setNotification({
        type: "success",
        message: "Document deleted successfully!",
      });

      fetchDocuments(workspaceId);
    } catch (error) {
      setNotification({ type: "error", message: "Document deletion failed!" });
    } finally {
      setDeleting(false);
    }
  };

  const handlePreviewDocument = async (documentId) => {
    setLoadingPreview(true);
    try {
      await fetchDocumentPreview(documentId);
      if (!fileData || !fileData.base64 || !fileData.fileType) {
        throw new Error("Invalid document preview data");
      }

      // Process the fileData as before
      if (fileData.fileType.includes("pdf")) {
        setPreviewFileType("pdf");
      } else if (
        ["image/jpg", "image/jpeg", "image/png"].includes(fileData.fileType)
      ) {
        setPreviewFileType(fileData.fileType);
      } else if (
        fileData.fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        setPreviewFileType("docx");
        setPreviewFile(fileData.html);
      } else if (fileData.fileType.includes("text")) {
        setPreviewFileType(fileData.fileType);
        setPreviewFile(fileData.base64);
        setDownloadFileName(fileData.fileName);
      } else {
        setPreviewFileType("unsupported");
      }

      setPreviewFile(fileData.base64);
      setMimeType(fileData.fileType);
      setShowPreviewModal(true);
    } catch (error) {
      console.error("Error previewing document:", error);
      setNotification({ type: "error", message: "Document preview failed!" });
    } finally {
      setLoadingPreview(false);
    }
  };

  return (
    <div className="document-container">
      <h2 className="document-title">Document Manager</h2>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="upload-section">
        <h3>Upload Document</h3>
        <form onSubmit={handleUpload}>
          <input
            type="text"
            name="name"
            placeholder="Document Name"
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="type"
            placeholder="Document Type"
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="version"
            placeholder="Version"
            onChange={handleInputChange}
          />
          <input type="file" onChange={handleFileChange} />
          <Button type="submit" disabled={uploading}>
            {uploading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              "Upload Document"
            )}
          </Button>
        </form>
      </div>

      {workspace && workspaceId && documents && documents.length > 0 ? (
        <div>
          <h3>Documents in Workspace {workspace.name}</h3>
          <ul className="document-list">
            {documents.map((doc) => (
              <li key={doc._id} className="document-item">
                <Link to={`/documents/${doc._id}`} className="document-link">
                  {doc.name}
                </Link>
                <div className="document-actions">
                  <Button
                    variant="primary"
                    onClick={() => handlePreviewDocument(doc._id)}
                  >
                    Preview
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(doc._id)}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No documents available in this workspace.</p>
      )}

      <Modal
        show={showPreviewModal}
        onHide={() => setShowPreviewModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Document Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingPreview ? (
            <div className="text-center">
              <Spinner animation="border" />
              <p>Loading document preview...</p>
            </div>
          ) : previewFile ? (
            previewFileType === "pdf" ? (
              <iframe
                src={`data:application/pdf;base64,${previewFile}`}
                title="PDF Preview"
                width="100%"
                height="500px"
              />
            ) : mimeType.includes("image") ? (
              <img
                src={`data:${mimeType};base64,${previewFile}`}
                alt="Document Preview"
                style={{ width: "100%", height: "auto" }}
              />
            ) : previewFileType === "docx" ? (
              <div>
                <img
                  src="/path/to/word-placeholder-image.png"
                  alt="Word Document Preview"
                  style={{ width: "100px", height: "100px" }}
                />
                <p>
                  This document cannot be previewed. Click the button below to
                  download.
                </p>
                <a
                  href={`data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${previewFile}`}
                  download={downloadFileName || "document.docx"}
                  className="btn btn-primary"
                >
                  Download Document
                </a>
              </div>
            ) : previewFileType === "text" ? (
              <pre>{atob(previewFile)}</pre>
            ) : (
              <p>Preview is not available for this document type.</p>
            )
          ) : (
            <p>No preview available</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowPreviewModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Document;

// main
