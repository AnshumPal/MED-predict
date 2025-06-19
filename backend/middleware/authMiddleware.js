const jwt = require("jsonwebtoken");

const verifyToken = (token) => {
  try {
    if (!token) {
      throw new Error("Unauthorized - No token provided");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { user: decoded };
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return { error: "Token expired, please log in again" };
    }
    return { error: "Invalid token" };
  }
};

module.exports = verifyToken;
