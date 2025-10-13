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
  deactiveUser,
  reactiveUser,
  updateProfile,
} = require("../controllers/UserController");
const { jwtMiddleware } = require("../middleware/JwtMiddlware");
const { User } = require("../models/User");
const e = require("express");

// PROFILE ROUTER
router.get("/profile", jwtMiddleware, profile);

router.get("/all-user", jwtMiddleware, allUser);

// create a user by admin
router.post("/user", jwtMiddleware, createUser);

router.patch("/deactivate-user/:id", jwtMiddleware, deactiveUser);

router.patch("/reactive-user/:id", jwtMiddleware, reactiveUser);

router.put("/update-profile", jwtMiddleware, updateProfile);

module.exports = router;
