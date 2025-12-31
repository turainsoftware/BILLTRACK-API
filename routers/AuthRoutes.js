const express = require("express");
const { verifyOTP, loginWithPhone } = require("../controllers/AuthController");
const { User } = require("../models/User");
const { generateToken } = require("../config/JwtConfig");
const { Device } = require("../models/Devices");
const { Business } = require("../models/Business");
const { default: axios } = require("axios");
const { SOCKET_API } = require("../config/config");
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

router.post("/remove-device-login", async (req, res) => {
  try {
    const {
      fcmToken,
      deviceType,
      deviceModel,
      deviceName,
      deviceUniqueKey,
      phone,
    } = req.body;
    const user = await User.findOne({ where: { phone } });
    if (!user)
      return res.status(404).json({ message: "User not found", status: false });

    const { businessId } = user.dataValues;

    const devices = await Device.findAll({
      where: {
        businessId: businessId,
      },
    });

    if (devices.length > 0) {
      await Device.destroy({
        where: {
          businessId: businessId,
        },
      });
      const response = await axios.post(SOCKET_API + "/logout", {
        roomId: businessId,
        devices: devices,
      });
      console.log("socket response",response.data);
    }

    await Device.create({
      fcmToken,
      deviceType,
      deviceModel,
      deviceName,
      deviceUniqueKey,
      businessId,
    });

    const business = await Business.findByPk(businessId);

    const token = generateToken(user);

    return res.json({
      message: "Login successful",
      status: true,
      token,
      business,
      user,
    });
  } catch (error) {
    return res.json({ message: "Something went wrong", status: false, error });
  }
});

module.exports = router;
