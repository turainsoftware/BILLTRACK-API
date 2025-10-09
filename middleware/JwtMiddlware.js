const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/config");

const jwtMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
          throw new Error("Invalid Token");
        }
        req.user = decoded;
        next();
      });
    } else {
      throw new Error("Invalid Token");
    }
  } catch (error) {
    return res.json({ message: "Invalid Token", status: false });
  }
};

module.exports = { jwtMiddleware };
