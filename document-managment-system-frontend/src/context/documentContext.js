import React, { createContext, useState } from "react";
import axios from "axios";

// Create DocumentContext
const DocumentContext = createContext();

// DocumentProvider component to manage state and actions
const DocumentProvider = ({ children }) => {
  const [documents, setDocuments] = useState([]);
  const [fileData, setFileData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch documents for a given workspaceId
  const fetchDocuments = async (workspaceId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/documents/list/${workspaceId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setDocuments(response.data);
    } catch (error) {
      setError("Error fetching documents");
      console.error("Error fetching documents", error);
    } finally {
      setLoading(false);
    }
  };

  // Soft delete document
  const deleteDocument = async (id, navigate) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/documents/delete/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      alert("Document soft deleted successfully");
      navigate("/documents");
    } catch (error) {
      setError("Error deleting document");
      console.error("Error deleting document", error);
    }
  };

  // Fetch document preview
  const fetchDocumentPreview = async (id) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/documents/preview/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const { fileType, base64 } = response.data;
      setFileData({ fileType, base64 });
    } catch (error) {
      setError("Error fetching document preview");
      console.error("Error fetching document preview", error);
    }
  };

  // Upload document
  const uploadDocument = async (file, formData) => {
    const form = new FormData();
    form.append("document", file);
    Object.keys(formData).forEach((key) => {
      form.append(key, formData[key]);
    });

    try {
      const response = await axios.post(
        "http://localhost:5000/api/documents/upload",
        form,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(response.data);
      alert("Document uploaded successfully");
    } catch (error) {
      setError("Error uploading document");
      console.error("Error uploading document", error);
    }
  };

  // Download document
  const downloadDocument = async (documentId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/documents/download/${documentId}`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Create a URL for the file and trigger the download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Extract filename from the response headers
      const contentDisposition = response.headers["content-disposition"];
      let fileName = "downloadedDocument";
      if (contentDisposition && contentDisposition.includes("filename=")) {
        fileName = contentDisposition.split("filename=")[1].trim();
      }

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      setError("Error downloading document");
      console.error("Error downloading document", error);
    }
  };

  // Provide state and actions to the context consumers
  return (
    <DocumentContext.Provider
      value={{
        documents,
        fileData,
        error,
        loading,
        fetchDocuments,
        deleteDocument,
        fetchDocumentPreview,
        uploadDocument,
        downloadDocument,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
};

export { DocumentContext, DocumentProvider };
