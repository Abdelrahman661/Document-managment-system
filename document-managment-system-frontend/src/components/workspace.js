import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useWorkspace } from "../context/workspaceContext";
import "./style/workspace.css";
import "./style/modal.css"; 
import { Modal, Button, Form } from "react-bootstrap";

// CreateWorkspace Component
const CreateWorkspace = () => {
  const [workspaceData, setWorkspaceData] = useState({
    name: "",
    structure: {},
  });
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const { createWorkspace, loading } = useWorkspace();

  const handleChange = (e) => {
    setWorkspaceData({ ...workspaceData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createWorkspace(workspaceData);
      setError("");
      setShowModal(false);
    } catch (err) {
      console.error("Error creating workspace:", err);
      setError("Error creating workspace. Please try again.");
    }
  };

  return (
    <div>
      <div className="create-workspace-button-container">
        <Button
          variant="primary"
          onClick={() => setShowModal(true)}
          className="create-workspace-button"
        >
          Create Workspace
        </Button>
      </div>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        dialogClassName="modal-content"
      >
        <Modal.Header closeButton>
          <Modal.Title>Create New Workspace</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <p className="error-message">{error}</p>}
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formWorkspaceName">
              <Form.Label>Workspace Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                placeholder="Enter workspace name"
                value={workspaceData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              disabled={loading}
              className="submit-button"
            >
              {loading ? "Creating..." : "Create Workspace"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

// WorkspaceList Component
const WorkspaceList = () => {
  const { workspaces, deleteWorkspace, loading, error } = useWorkspace();

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this workspace?")) {
      await deleteWorkspace(id);
    }
  };

  return (
    <div>
      <h2 className="workspace-list-title">Workspaces</h2>
      {error && <p className="error-message">{error}</p>}
      {loading ? (
        <p>Loading workspaces...</p>
      ) : (
        <ul className="workspace-list">
          {workspaces.map((workspace) => (
            <li key={workspace._id} className="workspace-item">
              <Link
                to={`/workspaces/${workspace._id}/documents`}
                className="workspace-link"
              >
                {workspace.name}
              </Link>
              <div className="workspace-actions">
                <Button
                  variant="danger"
                  onClick={() => handleDeleteClick(workspace._id)}
                  className="delete-button"
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Main Workspace Component
const Workspace = () => {
  return (
    <div className="workspace-container">
      <CreateWorkspace />
      <WorkspaceList />
    </div>
  );
};

export default Workspace;
