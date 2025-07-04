// middleware/verifyToken.js
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1]; // Bearer <token>

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json("Token is invalid");
      req.user = user; // Decoded JWT payload
      next();
    });
  } else {
    return res.status(401).json("Auth token not found");
  }
};

module.exports = verifyToken;
