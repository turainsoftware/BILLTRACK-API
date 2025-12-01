const express = require("express");
const router = express.Router();

const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { randomUUID } = require("crypto");
const { Op } = require("sequelize");

const { LOGO_DIR } = require("../config/config");
const { Business } = require("../models/Business");
const { BusinessCategory } = require("../models/BusinessCategory");
const { jwtMiddleware } = require("../middleware/JwtMiddlware");
const { User } = require("../models/User");
const {
  addBusiness,
  getBusiness,
  updateAddress,
} = require("../controllers/BusinessController");

// Ensure logo directory exists
if (!fs.existsSync(LOGO_DIR)) {
  fs.mkdirSync(LOGO_DIR, { recursive: true });
}

// Allowed image mime types for logos
const ALLOWED_MIME = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
};

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, LOGO_DIR),
  filename: (req, file, cb) => {
    const ext = ALLOWED_MIME[file.mimetype];
    const safeExt = ext
      ? `.${ext}`
      : path.extname(file.originalname).toLowerCase();
    const fileName = `${randomUUID()}${safeExt}`;
    cb(null, fileName);
  },
});

// Multer file filter
function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME[file.mimetype]) {
    return cb(
      new Error("Only PNG, JPG, and WEBP image types are allowed for the logo")
    );
  }
  cb(null, true);
}

// 5 MB size limit for logos
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Utility to delete an uploaded file (best-effort)
function deleteUploadedFileSafely(file) {
  if (!file?.path && file?.filename) {
    try {
      fs.unlinkSync(path.join(LOGO_DIR, file.filename));
    } catch (_) {
      // ignore
    }
    return;
  }
  if (file?.path) {
    try {
      fs.unlinkSync(file.path);
    } catch (_) {
      // ignore
    }
  }
}

// Create a new business
router.post("/", jwtMiddleware, upload.single("logo"), addBusiness);

// GET BUSINESS DETAILS BY USER
router.get("/", jwtMiddleware, getBusiness);

router.put("/update", jwtMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const userBusiness = await User.findByPk(user.id, {
      attributes: ["businessId"],
    });
    if (!userBusiness) {
      return res.status(404).json({
        success: false,
        message: "Invalid business Details",
      });
    }
    const { businessId } = userBusiness.dataValues;

    const { gstNumber, street, city, state, pinCode, email, phone } = req.body;

    const payload = {};
    if (gstNumber) {
      payload.gstNumber = gstNumber;
    }
    if (street) {
      payload.street = street;
    }
    if (city) {
      payload.city = city;
    }
    if (state) {
      payload.state = state;
    }
    if (pinCode) {
      payload.pinCode = pinCode;
    }
    if (email) {
      payload.email = email;
    }
    if (phone) {
      payload.phone = phone;
    }

    await Business.update(payload, {
      where: { id: businessId },
    });
    const updatedBusiness = await Business.findByPk(businessId);
    return res.json({
      status: true,
      message: "Business updated successfully",
      business: updatedBusiness,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      message: "Something went wrong",
    });
  }
});

// update address
router.put("/address", jwtMiddleware, updateAddress);

module.exports = router;
