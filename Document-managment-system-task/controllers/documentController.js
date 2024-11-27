const fs = require("fs");
const path = require("path");
const Document = require("../models/documentModel");

// Upload Document
exports.uploadDocument = async (req, res) => {
  const { name, type, workspaceId, version, tags, accessControls } = req.body;
  const content = req.file?.path;
  const ownerNID = req.user.NID;

  if (!content) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const document = new Document({
      name,
      type,
      content,
      ownerNID,
      workspaceId,
      version,
      tags: tags ? tags.split(",") : [],
      accessControls: JSON.parse(accessControls || "{}"),
    });

    await document.save();
    res
      .status(201)
      .json({ message: "Document uploaded successfully.", document });
  } catch (error) {
    console.error("Error uploading document:", error);
    res.status(500).json({ message: "Error uploading document", error });
  }
};

// Download Document
exports.downloadDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      ownerNID: req.user.NID,
      deleted: false,
    });
    if (!document) {
      return res
        .status(404)
        .json({ message: "Document not found or access denied." });
    }

    res.download(document.content);
  } catch (error) {
    console.error("Error downloading document:", error);
    res.status(500).json({ message: "Error downloading document", error });
  }
};

// Soft Delete Document
exports.softDeleteDocument = async (req, res) => {
  try {
    const document = await Document.findOneAndUpdate(
      { _id: req.params.id, ownerNID: req.user.NID },
      { deleted: true },
      { new: true }
    );

    if (!document) {
      return res
        .status(404)
        .json({ message: "Document not found or access denied." });
    }

    res.status(200).json({ message: "Document soft deleted successfully." });
  } catch (error) {
    console.error("Error during document soft deletion:", error);
    res.status(500).json({ message: "Error during soft deletion", error });
  }
};
// Preview Document as Base64
exports.previewDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    // Check if document exists and is not deleted
    if (!document || document.deleted) {
      return res
        .status(404)
        .json({ message: "Document not found or has been deleted" });
    }

    // Ensure the user owns the document
    if (document.ownerNID.toString() !== req.user.NID) {
      return res.status(403).json({
        message: "You do not have permission to preview this document",
      });
    }

    // Ensure the file still exists on the server
    const filePath = document.content; // Assuming content is the file path
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found on server" });
    }

    const fileType = document.type;
    const fileName = document.name;

    // // Supported preview types
    // const supportedPreviewTypes = [
    //   "image/",
    //   "application/pdf",
    //   "video/",
    //   "audio/",
    //   "text/",
    //   "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    // ];

    // const isPreviewSupported = supportedPreviewTypes.some((type) =>
    //   fileType.startsWith(type)
    // );

    // if (!isPreviewSupported) {
    //   return res.status(200).json({
    //     message:
    //       "Preview not supported. Use the download link to view the document.",
    //     downloadUrl: `http://localhost:5000/api/documents/download/${req.params.id}`,
    //     isPreviewSupported: false,
    //   });
    // }

    // For previewable files, return base64 encoded data
    const base64Data = fs.readFileSync(filePath, { encoding: "base64" });

    return res.json({
      fileType,
      base64: base64Data,
      fileName,
      isPreviewSupported: true,
    });
  } catch (error) {
    console.error("Error previewing document:", error.message);
    return res
      .status(500)
      .json({ message: "Document preview failed", error: error.message });
  }
};

// List Documents for a Workspace
exports.listDocuments = async (req, res) => {
  const { workspaceId } = req.params;
  const filters = req.query;

  try {
    const query = { ownerNID: req.user.NID, deleted: false };

    if (workspaceId) {
      query.workspaceId = workspaceId;
    }

    if (filters.name) {
      query.name = { $regex: filters.name, $options: "i" };
    }
    if (filters.type) {
      query.type = filters.type;
    }

    const documents = await Document.find(query);
    res.status(200).json(documents);
  } catch (error) {
    console.error("Error listing documents:", error);
    res.status(500).json({ message: "Error listing documents", error });
  }
};

// List Documents by Profile (NID)
exports.listDocumentsByProfile = async (req, res) => {
  try {
    const documents = await Document.find({
      ownerNID: req.user.NID,
      deleted: false,
    });
    res.status(200).json(documents);
  } catch (error) {
    console.error("Error listing documents by profile:", error);
    res
      .status(500)
      .json({ message: "Error listing documents by profile", error });
  }
};

// Update Document Metadata
exports.updateDocumentMetadata = async (req, res) => {
  const { name, type, version, tags, accessControls } = req.body;

  try {
    const document = await Document.findOneAndUpdate(
      { _id: req.params.id, ownerNID: req.user.NID, deleted: false },
      {
        name,
        type,
        version,
        tags: tags ? tags.split(",") : [],
        accessControls: JSON.parse(accessControls || "{}"),
      },
      { new: true }
    );

    if (!document) {
      return res
        .status(404)
        .json({ message: "Document not found or access denied." });
    }

    res.status(200).json(document);
  } catch (error) {
    console.error("Error updating document metadata:", error);
    res.status(500).json({ message: "Error updating metadata", error });
  }
};

// Retrieve Document Metadata
exports.getDocumentMetadata = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      ownerNID: req.user.NID,
      deleted: false,
    });

    if (!document) {
      return res
        .status(404)
        .json({ message: "Document not found or access denied." });
    }

    res.status(200).json(document);
  } catch (error) {
    console.error("Error retrieving document metadata:", error);
    res.status(500).json({ message: "Error retrieving metadata", error });
  }
};

// Search Documents
exports.searchDocuments = async (req, res) => {
  const { query } = req.query;

  try {
    const documents = await Document.find({
      ownerNID: req.user.NID,
      deleted: false,
      $or: [
        { name: { $regex: query, $options: "i" } },
        { type: { $regex: query, $options: "i" } },
      ],
    });

    res.status(200).json(documents);
  } catch (error) {
    console.error("Error searching documents:", error);
    res.status(500).json({ message: "Error searching documents", error });
  }
};
