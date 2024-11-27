import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Navigate } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Workspace from "./components/workspace";
import Home from "./components/home";
import Document from "./components/document";
import "bootstrap/dist/css/bootstrap.min.css";
import { DocumentProvider } from "./context/documentContext";
import NavBar from "./components/navbar";
import UpdateWorkspace from "./components/workspace"; // Adjust path if needed
import AuthProvider from "./context/AuthContext"; // Import AuthProvider

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <DocumentProvider>
        <Router>
          <Routes>
            {/* Auth Routes */}
            <Route
              path="/"
              element={
                <>
                  <NavBar />
                  <Home />
                </>
              }
            />{" "}
            {/* Home route */}
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            {/* Dashboard Route */}
            <Route
              path="/dashboard/"
              element={
                <PrivateRoute>
                  <NavBar />
                  <Dashboard />
                </PrivateRoute>
              }
            />
            {/* Workspace Routes */}
            <Route
              path="/workspaces"
              element={
                <PrivateRoute>
                  <NavBar />
                  <Workspace />
                </PrivateRoute>
              }
            />
            <Route
              path="/workspaces/update/:id"
              element={<UpdateWorkspace />}
            />
            <Route
              path="/workspaces/:workspaceId/documents"
              element={<Document />}
            />
            <Route
              path="/documents/:id"
              element={
                <PrivateRoute>
                  <Document />
                </PrivateRoute>
              }
            />
          </Routes>
        </Router>
      </DocumentProvider>
    </AuthProvider>
  );
}

export default App;
