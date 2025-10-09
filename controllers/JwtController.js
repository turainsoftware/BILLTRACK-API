
const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config/config");

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, businessId: user.businessId, role: user.role },
    JWT_SECRET,
    JWT_EXPIRES_IN 
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
};

module.exports = { generateToken, verifyToken };
