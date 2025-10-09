const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("./config");

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, businessId: user.businessId, role: user.role },
    JWT_SECRET,
    JWT_EXPIRES_IN
  );
};

module.exports = { generateToken };
