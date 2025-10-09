const express = require("express");
const router = express.Router();
const {
  loginWithPhone,
  verifyOTP,
  getAllUsers,
  findById,
  updateById,
} = require("../controllers/UserController");
const { jwtMiddleware } = require("../middleware/JwtMiddlware");
const { User } = require("../models/User");

router.post("/login", loginWithPhone);
router.post("/verify", verifyOTP);

// PROFILE ROUTER
router.get("/profile", jwtMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const data = await User.findByPk(user.id);

    if (!data) return res.json({ message: "No data found", status: false });

    // REMOE UNNESECESSARY FIELDS
    delete data.dataValues.otp;
    delete data.dataValues.otpExpiry;

    return res.json({ data, status: true }).status(200);
  } catch (error) {
    return res.json({ message: "Something went wrong", status: false });
  }
});

module.exports = router;
