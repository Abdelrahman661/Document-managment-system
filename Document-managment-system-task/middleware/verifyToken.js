const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
  console.log("Verifying token");
  const authHeader = req.headers["authorization"];
  console.log("Authorization header:", authHeader);

  const token = authHeader && authHeader.split(" ")[1]?.replace(/^"|"$/g, "");

  if (!token) return res.status(401).send("Access Denied: No token provided");

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error("Token verification error:", err);
      return res.status(403).send("Access Denied: Invalid token");
    }

    req.user = user;
    next();
  });
};

const checkAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).send("Not authenticated: User not found");
  }
  next();
};

module.exports = {
  verifyToken,
  checkAuth,
};
