import React from "react";
import Workspace from "./workspace";
import './style/dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>
      <div className="workspace-section">
        <Workspace />
      </div>
    </div>
  );
};

export default Dashboard;
