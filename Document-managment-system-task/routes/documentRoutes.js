const express = require("express");
const router = express.Router();
const documentController = require("../controllers/documentController");
const { verifyToken } = require("../middleware/verifyToken"); // Ensure correct import
const multer = require("multer");
const { check, param } = require("express-validator");
const upload = multer({ dest: "uploads/" });

// Upload Document with validation
router.post(
  "/upload",
  verifyToken,
  upload.single("document"),
  [
    check("name").notEmpty().withMessage("Document name is required"),
    check("type").notEmpty().withMessage("Document type is required"),
    check("workspaceId")
      .optional()
      .isMongoId()
      .withMessage("Invalid workspace ID"),
  ],
  documentController.uploadDocument
);

// Download Document
router.get(
  "/download/:id",
  verifyToken,
  param("id").isMongoId().withMessage("Invalid document ID"),
  documentController.downloadDocument
);

// Soft Delete Document
router.patch(
  "/delete/:id",
  verifyToken,
  param("id").isMongoId().withMessage("Invalid document ID"),
  documentController.softDeleteDocument
);

// Preview Document
router.get(
  "/preview/:id",
  verifyToken,
  param("id").isMongoId().withMessage("Invalid document ID"),
  documentController.previewDocument
);

// List Documents for a Workspace (optional workspaceId)
router.get(
  "/list/:workspaceId?",
  verifyToken,
  param("workspaceId")
    .optional()
    .isMongoId()
    .withMessage("Invalid workspace ID"),
  documentController.listDocuments
);

// List Documents by Profile (NID)
router.get("/list/NID", verifyToken, documentController.listDocumentsByProfile);

// Update Document Metadata
router.put(
  "/metadata/:id",
  verifyToken,
  [
    param("id").isMongoId().withMessage("Invalid document ID"),
    check("name")
      .optional()
      .notEmpty()
      .withMessage("Document name cannot be empty"),
    check("type")
      .optional()
      .notEmpty()
      .withMessage("Document type cannot be empty"),
    check("tags")
      .optional()
      .isString()
      .withMessage("Tags must be a comma-separated string"),
  ],
  documentController.updateDocumentMetadata
);

// Get Document Metadata
router.get(
  "/metadata/:id",
  verifyToken,
  param("id").isMongoId().withMessage("Invalid document ID"),
  documentController.getDocumentMetadata
);

// Search Documents
router.get(
  "/search",
  verifyToken,
  check("query").notEmpty().withMessage("Search query cannot be empty"),
  documentController.searchDocuments
);

module.exports = router;
