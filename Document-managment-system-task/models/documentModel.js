const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String },
  content: { type: String, required: true },
  ownerNID: { type: String, required: true },
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace" },
  version: {
    type: String,
    unique: true,
    required: true,
  },
  tags: [String],
  accessControls: { type: Map, of: Boolean },
  deleted: { type: Boolean, default: false },
  uploadDate: { type: Date, default: Date.now },
});

const Document = mongoose.model("Document", DocumentSchema);

module.exports = Document;
