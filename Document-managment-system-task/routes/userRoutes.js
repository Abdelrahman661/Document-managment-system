const express = require("express");
const { check } = require("express-validator");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken, checkAuth } = require("../middleware/verifyToken");
const workspaceController = require("../controllers/workspaceController");

// Protected Route Example
router.get("/protected-route", verifyToken, checkAuth, (req, res) => {
  res
    .status(200)
    .json({ message: "You are authenticated and can access this route." });
});

// Get Workspaces by User ID
router.get(
  "/workspaces/user/:id",
  verifyToken,
  checkAuth,
  workspaceController.getWorkspacesByUserId
);

// User Signup
router.post(
  "/signup",
  [
    check("email").isEmail().withMessage("Invalid email format"),
    check("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    check("username").notEmpty().withMessage("Username is required"),
    check("NID").notEmpty().withMessage("NID is required"),
  ],
  userController.signup
);

// User Login
router.post(
  "/login",
  [
    check("email").isEmail().withMessage("Invalid email format"),
    check("password").notEmpty().withMessage("Password is required"),
  ],
  userController.login
);

// User Logout
router.post("/logout", userController.logout);

module.exports = router;
