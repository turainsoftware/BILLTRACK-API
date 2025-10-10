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
router.post("/", jwtMiddleware, upload.single("logo"), async (req, res) => {
  try {
    // Basic validation
    const userId = req.user.id;
    const {
      name,
      gstNumber,
      street,
      city,
      state,
      pincode,
      email,
      phone,
      businessCategoryId,
    } = req.body || {};

    // Logo is required
    if (!req.file) {
      return res.status(400).json({
        message: "Business logo is required",
        status: false,
      });
    }

    // Validate required fields
    if (!name || !businessCategoryId) {
      deleteUploadedFileSafely(req.file);
      return res.status(400).json({
        message: "Business name and category are required",
        status: false,
      });
    }

    // Validate category id is a number (if your PK is numeric)
    const categoryIdNum = Number(businessCategoryId);
    if (!Number.isFinite(categoryIdNum) || categoryIdNum <= 0) {
      deleteUploadedFileSafely(req.file);
      return res.status(400).json({
        message: "Invalid business category",
        status: false,
      });
    }

    if (!gstNumber || typeof gstNumber !== "string" || !gstNumber.trim()) {
      deleteUploadedFileSafely(req.file);
      return res.status(400).json({
        message: "GST number is required",
        status: false,
      });
    }

    // Normalize inputs
    const normalizedGst = gstNumber.trim().toUpperCase();
    const normalizedName = String(name).trim();
    const normalizedEmail = typeof email === "string" ? email.trim() : email;
    const normalizedPhone = typeof phone === "string" ? phone.trim() : phone;
    const normalizedPin =
      typeof pincode === "string" ? pincode.trim() : pincode;

    // Ensure category exists
    const category = await BusinessCategory.findByPk(categoryIdNum);
    if (!category) {
      deleteUploadedFileSafely(req.file);
      return res.status(400).json({
        message: "Invalid business category",
        status: false,
      });
    }

    // Uniqueness check (GST)
    const existingBusiness = await Business.findOne({
      where: { gstNumber: normalizedGst },
    });
    if (existingBusiness) {
      deleteUploadedFileSafely(req.file);
      return res.status(400).json({
        message: "GST number already exists",
        status: false,
      });
    }

    // Persist business
    const newBusiness = await Business.create({
      name: normalizedName,
      gstNumber: normalizedGst,
      street: street ?? null,
      city: city ?? null,
      state: state ?? null,
      pinCode: normalizedPin ?? null,
      email: normalizedEmail ?? null,
      phone: normalizedPhone ?? null,
      businessCategoryId: categoryIdNum,
      logoUrl: req.file.filename,
    });

    await User.update(
      { businessId: newBusiness.id },
      { where: { id: userId } }
    );

    return res.status(201).json({
      message: "Business created successfully",
      status: true,
      data: newBusiness,
    });
  } catch (error) {
    if (req.file) {
      deleteUploadedFileSafely(req.file);
    }

    // Multer-specific errors (e.g., file too large, invalid mime)
    if (error instanceof multer.MulterError) {
      return res.status(400).json({
        message: error.message,
        status: false,
      });
    }

    console.error("Error creating business:", error);
    return res.status(500).json({
      message: "Something went wrong",
      status: false,
      error: process.env.NODE_ENV !== "production" ? error.message : undefined,
    });
  }
});

// GET BUSINESS DETAILS BY USER
router.get("/", jwtMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findOne({
      where: {
        id: userId,
      },
      attributes: ["businessId"],
    });
    console.info(user);
    const business = await Business.findOne({
      where: {
        id: user.businessId,
      },
    });
    return res.json({ data: business, status: true });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong", status: false });
  }
});

// update address
router.put("/address", jwtMiddleware, async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "ADMIN") {
      return res.json({ message: "You are not authorized", status: false });
    }
    const { street, city, state, pincode } = req.body;

    if (!street || !city || !state || !pincode) {
      return res.json({ message: "All fields are required", status: false });
    }

    await Business.update(
      { street, city, state, pincode },
      { where: { id: user.businessId } }
    );
    return res
      .json({ message: "Successfully updated", status: true })
      .status(200);
  } catch (error) {
    return res.json({ message: "Something went wrong", status: false });
  }
});

module.exports = router;
