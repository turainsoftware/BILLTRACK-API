const express = require("express");
const router = express.Router();
const { loginWithPhone, verifyOTP, getAllUsers, findById, updateById } = require("../controllers/UserController");

router.post("/login", loginWithPhone);
router.post("/verify", verifyOTP);
router.get("/", getAllUsers);
router.get("/:id", findById);
router.put("/:id", updateById);

module.exports = router;
