const express = require("express");
const router = express.Router();
const {
  loginWithPhone,
  verifyOTP,
  getAllUsers,
  findById,
  updateById,
  profile,
  allUser,
  createUser,
} = require("../controllers/UserController");
const { jwtMiddleware } = require("../middleware/JwtMiddlware");
const { User } = require("../models/User");
const e = require("express");

// PROFILE ROUTER
router.get("/profile", jwtMiddleware, profile);

router.get("/all-user", jwtMiddleware, allUser);

// create a user by admin
router.post("/user", jwtMiddleware, createUser);

router.patch("/deactivate-user/:id", jwtMiddleware, async (req, res) => {
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
});

router.patch("/reactive-user/:id", jwtMiddleware, async (req, res) => {
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
});

router.put("/update-profile", jwtMiddleware, async (req, res) => {
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
    return res.json({ message: "Something went wrong", status: false });
  }
});

module.exports = router;
