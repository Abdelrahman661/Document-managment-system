const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const app = express();
require("dotenv").config();

// Connect to MongoDB
connectDB();

// Import routes
const userRoutes = require("./routes/userRoutes");
const workspaceRoutes = require("./routes/workspaceRoutes");
const documentRoutes = require("./routes/documentRoutes");

const corsOptions = {
  origin: "http://localhost:3000", // The frontend origin you want to allow
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};

// Middleware
app.use(express.json());
app.use(cors(corsOptions));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "An internal server error occurred.",
    error:
      process.env.NODE_ENV === "development" ? err.message : "Server error",
  });
});

app.use("/api/users", userRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/documents", documentRoutes);

process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  process.exit(1);
});

app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
