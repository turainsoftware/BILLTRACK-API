const Joi = require("joi");
const { User } = require("../models/User");
const { generateToken } = require("../config/JwtConfig.js");

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
      await user.save();
    } else {
      user = await User.create({
        phone,
        otp,
        businessId: null,
        name: null,
        email: null,
        role: "ADMIN",
      });
    }

    console.log(`OTP for ${phone}: ${otp}`);

    return res.status(200).json({
      message: "OTP sent successfully",
      status: true,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({
        message: "Something went wrong",
        status: false,
        error: err.message,
      });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { error } = verifySchema.validate(req.body);
    if (error)
      return res
        .status(400)
        .json({ message: error.details[0].message, status: false });

    const { phone, otp } = req.body;
    const user = await User.findOne({ where: { phone } });

    if (!user)
      return res.status(404).json({ message: "User not found", status: false });
    if (user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP", status: false });

    const token = generateToken(user);

    return res
      .status(200)
      .json({ message: "Login successful", status: true, token, data: user });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({
        message: "Something went wrong",
        status: false,
        error: err.message,
      });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ where: { isActive: true } });
    return res.json({ data: users, status: true });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Something went wrong", status: false, error: err });
  }
};

const findById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.json({ message: "No data found", status: false });
    return res.json({ data: user, status: true });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Something went wrong", status: false });
  }
};

const updateById = async (req, res) => {
  try {
    const { businessId, name, phone, email, otp, role, isActive } = req.body;
    await User.update(
      { businessId, name, phone, email, otp, role, isActive },
      { where: { id: req.params.id } }
    );
    return res.json({ message: "Successfully updated", status: true });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Something went wrong", status: false });
  }
};

module.exports = {
  loginWithPhone,
  verifyOTP,
  getAllUsers,
  findById,
  updateById,
};
