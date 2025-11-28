const Joi = require("joi");
const { User } = require("../models/User");
const { generateToken } = require("../config/JwtConfig");
const { default: axios } = require("axios");
const { Device } = require("../models/Devices");

const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

const loginSchema = Joi.object({
  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must be exactly 10 digits.",
      "string.empty": "Phone number is required.",
    }),
});

const verifySchema = Joi.object({
  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must be exactly 10 digits.",
      "string.empty": "Phone number is required.",
      "any.required": "Phone number is required.",
    }),
  otp: Joi.string()
    .length(4)
    .pattern(/^[0-9]{4}$/)
    .required()
    .messages({
      "string.length": "OTP must be exactly 4 digits.",
      "string.empty": "OTP is required.",
      "any.required": "OTP is required.",
      "string.pattern.base": "OTP must contain only digits.",
    }),
});

const loginWithPhone = async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error)
      return res
        .status(400)
        .json({ message: error.details[0].message, status: false });

    const { phone } = req.body;

    const otp = generateOTP();

    let user = await User.findOne({ where: { phone } });
    if (user) {
      user.otp = otp;
      user.otpExpiry = new Date(Date.now() + 3 * 60 * 1000);
      await user.save();
    } else {
      user = await User.create({
        phone,
        otpExpiry: new Date(Date.now() + 3 * 60 * 1000),
        otp,
        businessId: null,
        name: "User",
        email: null,
        role: "ADMIN",
      });
    }

    const data = {
      api_key: "ffc98cf3cf74d71941a9f5aefeb021af",
      msg: `${otp} is your one time password (OTP). Please do not share the OTP with others. Team BillTrack.`,
      senderid: "BLTRAK",
      templateID: "1707173287654318591",
      coding: "1",
      to: phone,
      callbackData: "cb",
    };

    const response = await axios.post(
      "https://smscannon.com/api/api.php",
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Key ffc98cf3cf74d71941a9f5aefeb021af",
        },
      }
    );

    return res.status(200).json({
      message: "OTP sent successfully",
      status: true,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Something went wrong",
      status: false,
      error: err.message,
    });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.json({ message: "Phone and OTP are required", status: false });
    }
    const user = await User.findOne({ where: { phone } });

    if (!user)
      return res.status(404).json({ message: "User not found", status: false });
    if (user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP", status: false });

    if (user.otpExpiry < new Date())
      return res.status(400).json({ message: "OTP expired", status: false });

    if (user?.businessId) {
      const { fcmToken, deviceType, deviceModel, deviceName, deviceUniqueKey } =
        req.body;
      const businessIddd = user?.businessId;
      console.log("business Id ", businessIddd);
      const count = await Device.count({ where: { businessId: businessIddd } });
      if (count >= 1) {
        return res.status(400).json({
          message: "Already Logged In in different devices",
          status: false,
        });
      }
      await Device.create({
        fcmToken: fcmToken,
        deviceType: deviceType,
        deviceModel: deviceModel,
        deviceName: deviceName,
        deviceUniqueKey: deviceUniqueKey,
        businessId: businessIddd,
      });
    }

    const token = generateToken(user);

    return res
      .status(200)
      .json({ message: "Login successful", status: true, token, data: user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Something went wrong",
      status: false,
      error: err.message,
    });
  }
};

module.exports = {
  loginWithPhone,
  verifyOTP,
};
