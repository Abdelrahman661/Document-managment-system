const express = require("express");
const router = express.Router();
const workspaceController = require("../controllers/workspaceController");
const { verifyToken, checkAuth } = require("../middleware/verifyToken");

router.use(verifyToken);

router.get("/", checkAuth, workspaceController.getAllWorkspaces);

router.get("/:id", checkAuth, workspaceController.getWorkspaceById);

router.post("/", checkAuth, workspaceController.createWorkspace);

router.put("/:id", checkAuth, workspaceController.updateWorkspace);

router.delete("/:id", checkAuth, workspaceController.deleteWorkspace);

module.exports = router;
