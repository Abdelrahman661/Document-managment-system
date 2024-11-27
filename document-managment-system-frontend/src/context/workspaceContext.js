import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import axios from "axios";
import { toast } from "react-toastify";

const WorkspaceContext = createContext();

export const useWorkspace = () => useContext(WorkspaceContext);

export const WorkspaceProvider = ({ children }) => {
  const [workspaces, setWorkspaces] = useState([]);
  const [workspace, setWorkspace] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const fetchWorkspaces = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/workspaces", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      if (Array.isArray(response.data)) {
        setWorkspaces(response.data);
      } else {
        setWorkspaces([]);
      }
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      setError("Failed to fetch workspaces.");
      toast.error(
        `Failed to fetch workspaces: ${error.response?.data || error.message}`
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchWorkspaces();
    }
  }, [token]);

  const fetchWorkspace = async (id) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/workspaces/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setWorkspace(response.data);
    } catch (error) {
      console.error("Error fetching workspace details:", error);
      setError("Failed to fetch workspace details.");
      toast.error(
        `Error fetching workspace details: ${
          error.response?.data || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const createWorkspace = async (workspaceData) => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/workspaces",
        workspaceData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setWorkspaces([...workspaces, response.data]);
      toast.success("Workspace created successfully.");
    } catch (error) {
      console.error("Error creating workspace:", error);
      setError("Failed to create workspace.");
      toast.error(
        `Failed to create workspace: ${error.response?.data || error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const updateWorkspace = async (id, workspaceData) => {
    setLoading(true);
    try {
      const response = await axios.put(
        `http://localhost:5000/api/workspaces/${id}`,
        workspaceData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setWorkspaces(
        workspaces.map((ws) => (ws._id === id ? response.data : ws))
      );
      toast.success("Workspace updated successfully.");
    } catch (error) {
      console.error("Error updating workspace:", error);
      setError("Failed to update workspace.");
      toast.error(
        `Failed to update workspace: ${error.response?.data || error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteWorkspace = async (id) => {
    console.log(`Workspace ID to delete: ${id}`);

    setLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/workspaces/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWorkspaces(workspaces.filter((ws) => ws._id !== id));
      toast.success("Workspace deleted successfully.");
    } catch (error) {
      console.error("Error deleting workspace:", error);
      setError("Failed to delete workspace.");
      toast.error(
        `Failed to delete workspace: ${error.response?.data || error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        workspace,
        error,
        loading,
        fetchWorkspace,
        fetchWorkspaces,
        createWorkspace,
        updateWorkspace,
        deleteWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};
