import React from "react";
import "./style/dashboard.css";
import "./style/home.css";

const Home = () => {
  return (
    <div className="home-container">
      <div className="home-box">
        <h1 className="home-title">
          Welcome to the Workspace Management System
        </h1>
        <p className="home-description">
          Manage your workspaces and documents with ease.
        </p>
      </div>
    </div>
  );
};

export default Home;
