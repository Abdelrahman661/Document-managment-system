const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const workspaceSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  ownerNID: {
    type: String,
    required: true,
  },
  structure: {
    type: Map,
    of: Schema.Types.Mixed,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

workspaceSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Check if the model already exists
const Workspace =
  mongoose.models.Workspace || mongoose.model("Workspace", workspaceSchema);

module.exports = Workspace;
