const mongoose = require("mongoose"); // Import mongoose

const Workspace = require("../models/workspaceModel");

// Create Workspace
exports.createWorkspace = async (req, res) => {
  const { name, structure } = req.body;
  const ownerNID = req.user.NID;
  try {
    const workspace = new Workspace({ name, ownerNID, structure });
    await workspace.save();
    res.send("Workspace created successfully.");
  } catch (error) {
    console.error("Error creating workspace:", error);
    res.status(500).send("Error creating workspace.");
  }
};

// Fetch all workspaces for the authenticated user
exports.getAllWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find();

    if (workspaces.length === 0) {
      return res
        .status(404)
        .json({ message: "No workspaces found for this user" });
    }

    res.status(200).json(workspaces);
  } catch (error) {
    console.error("Failed to fetch workspaces:", error);
    res.status(500).json({ message: "Failed to fetch workspaces", error });
  }
};

// Fetch a specific workspace by its ID
exports.getWorkspaceById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid workspace ID");
  }

  try {
    const workspace = await Workspace.findById(id);
    return res.json(workspace);
  } catch (error) {
    console.error("Error retrieving workspace:", error);
    res.status(500).send("Error retrieving workspace.");
  }
};

// Update Workspace
exports.updateWorkspace = async (req, res) => {
  const { id } = req.params;

  const { name, structure } = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid workspace ID");
  }

  try {
    const workspace = await Workspace.findOneAndUpdate(
      { _id: id, ownerNID: req.user.NID },
      { name, structure },
      { new: true }
    );
    if (!workspace)
      return res
        .status(404)
        .send("Workspace not found or you don't have access.");
    res.json(workspace);
  } catch (error) {
    console.error("Error updating workspace:", error);
    res.status(500).send("Error updating workspace.");
  }
};

// Delete Workspace
exports.deleteWorkspace = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid workspace ID");
  }
  try {
    const workspace = await Workspace.findOneAndDelete({
      _id: id,
      ownerNID: req.user.NID,
    });
    if (!workspace)
      return res
        .status(404)
        .send("Workspace not found or you don't have access.");
    res.send("Workspace deleted successfully.");
  } catch (error) {
    console.error("Error deleting workspace:", error);
    res.status(500).send("Error deleting workspace.");
  }
};

// Example of workspaceController.js
exports.getWorkspacesByUserId = (req, res) => {
  const userId = req.params.id;

  // For demonstration purposes
  res.send(`Fetching workspaces for user ID: ${userId}`);
};
