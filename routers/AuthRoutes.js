const express = require("express");
const { verifyOTP, loginWithPhone } = require("../controllers/AuthController");
const { User } = require("../models/User");
const { generateToken } = require("../config/JwtConfig");
const router = express.Router();

router.post("/login", loginWithPhone);
router.post("/login-with-gogole", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    let token;
    if (user) {
      token = generateToken(user);
      return res.json({ message: "Login successful", status: true, token });
    }

    const createdUser = await User.create({ email, role: "ADMIN" });
    token = generateToken(createdUser);

    return res.json({ message: "Login successful", status: true, token });
  } catch (error) {
    return res.json({ message: "Something went wrong", status: false });
  }
});
router.post("/verify", verifyOTP);

module.exports = router;
