const express = require("express");
const { verifyOTP, loginWithPhone } = require("../controllers/AuthController");
const router = express.Router();

router.post("/login", loginWithPhone);
router.post("/verify", verifyOTP);

module.exports = router;
