const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const { validationResult } = require("express-validator");
const JWT_SECRET = process.env.JWT_SECRET;

// Register User
exports.signup = async (req, res) => {
  const { username, email, NID, password } = req.body;
  console.log("signup");

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name: username,
      email,
      NID,
      password: hashedPassword,
    });

    await user.save();

    const token = jwt.sign({ NID: user.NID }, JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({ token, NID });
  } catch (error) {
    console.error("Error during user registration:", error);
    res
      .status(500)
      .json({ message: "Internal server error during registration." });
  }
};

// Login User
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Email not found. Please register first." });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Incorrect password." });
    }

    const token = jwt.sign({ NID: user.NID }, JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ token, NID: user.NID });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error during login." });
  }
};

// Logout User
exports.logout = (req, res) => {
  // Simply clear the token on the client-side (frontend will handle this)
  res.status(200).json({ message: "Logged out successfully!" });
};
