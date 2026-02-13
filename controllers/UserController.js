const { User } = require("../models/User");

const profile = async (req, res) => {
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
};

const allUser = async (req, res) => {
  try {
    const user = req.user;
    if (user?.role !== "ADMIN") {
      return res.json({ message: "You are not authorized", status: false });
    }

    const users = await User.findAll({
      where: { businessId: user.businessId },
    });

    return res.json({ data: users, status: true }).status(200);
  } catch (error) {
    return res.json({ message: "Something went wrong", status: false });
  }
};

const createUser = async (req, res) => {
  try {
    const user = req.user;
    if (user?.role !== "ADMIN") {
      return res.json({ message: "You are not authorized", status: false });
    }

    const { name, phone, role = "EMPLOYEE", email } = req.body;

    if (!phone) {
      return res.json({ message: "Please enter phone number", status: false });
    }
    const userExist = await User.findOne({
      where: { phone },
      attributes: ["id"],
    });
    if (userExist) {
      return res.json({ message: "User already exist", status: false });
    }
    const otp = Math.floor(1000 + Math.random() * 9000);

    await User.create({
      name,
      email,
      phone,
      role,
      // businessId: user.businessId,
      otp,
    });
    return res
      .json({
        message: "Otp sent successfully",
        data: newUser,
        status: true,
      })
      .status(200);
  } catch (error) {
    return res.json({ message: "Something went wrong", status: false, error });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "ADMIN") {
      return res.json({ message: "You are not authorized", status: false });
    }

    const { phone, otp } = req.body;
    const userExist = await User.findOne({
      where: { phone },
      attributes: ["id"],
    });
    if (!userExist) {
      return res.json({ message: "User not found", status: false });
    }
    if (userExist.otp !== otp) {
      return res.json({ message: "Invalid otp", status: false });
    }
    await User.update({ businessId: user.businessId }, { where: { phone } });
    return res
      .json({
        message: "Login successful",
        status: true,
        token,
        data: userExist,
      })
      .status(200);
  } catch (error) {}
};

const deactiveUser=async (req, res) => {
  try {
    const user = req.user;
    if (user?.role !== "ADMIN") {
      return res.json({ message: "You are not authorized", status: false });
    }
    const { id } = req.params;

    const updateUser = await User.update(
      { isActive: false },
      { where: { id } }
    );
    return res
      .json({ message: "Successfully updated", status: true })
      .status(200);
  } catch (error) {
    return res.json({ message: "Something went wrong", status: false });
  }
}

const reactiveUser=async (req, res) => {
  try {
    const user = req.user;
    if (user?.role !== "ADMIN") {
      return res.json({ message: "You are not authorized", status: false });
    }
    const { id } = req.params;

    const updateUser = await User.update({ isActive: true }, { where: { id } });
    return res
      .json({ message: "Successfully updated", status: true })
      .status(200);
  } catch (error) {
    return res.json({ message: "Something went wrong", status: false });
  }
}

const updateProfile=async (req, res) => {
  try {
    const user = req.user;
    const { name, email } = req.body;
    const updateUser = await User.update(
      { name, email },
      { where: { id: user.id } }
    );
    return res
      .json({ message: "Successfully updated", status: true })
      .status(200);
  } catch (error) {
    console.log(error);
    return res.json({ message: "Something went wrong", status: false });
  }
}

module.exports = {
  profile,
  allUser,
  createUser,
  deactiveUser,
  reactiveUser,
  updateProfile
};
