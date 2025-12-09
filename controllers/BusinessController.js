const fs = require("fs");
const multer = require("multer");
const { BusinessCategory } = require("../models/BusinessCategory");
const { Business } = require("../models/Business");
const { User } = require("../models/User");
const { Device } = require("../models/Devices");
const Subscription = require("./../models/Subscription");

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

const addBusiness = async (req, res) => {
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

    // GST is optional — validate only if provided
    if (gstNumber !== undefined && gstNumber !== null && gstNumber !== "") {
      if (typeof gstNumber !== "string" || !gstNumber.trim()) {
        deleteUploadedFileSafely(req.file);
        return res.status(400).json({
          message: "Invalid GST number",
          status: false,
        });
      }
    }

    // Normalize inputs
    const normalizedGst = gstNumber && gstNumber.trim().toUpperCase();
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
    let existingBusiness = null;

    if (normalizedGst) {
      existingBusiness = await Business.findOne({
        where: { gstNumber: normalizedGst },
      });

      if (existingBusiness) {
        deleteUploadedFileSafely(req.file);
        return res.status(400).json({
          message: "GST number already exists",
          status: false,
        });
      }
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

    await Subscription.create({
      businessId: newBusiness.id,
    });

    if (newBusiness?.id) {
      const { fcmToken, deviceType, deviceModel, deviceName, deviceUniqueKey } =
        req.body;
      await Device.create({
        fcmToken,
        deviceType,
        deviceModel,
        deviceName,
        deviceUniqueKey,
        businessId: newBusiness.id,
      });
    }

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

    return res.status(500).json({
      message: "Something went wrong",
      status: false,
      error: process.env.NODE_ENV !== "production" ? error.message : undefined,
    });
  }
};

const getBusiness = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findOne({
      where: {
        id: userId,
      },
      attributes: ["businessId"],
    });
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
};

const updateAddress = async (req, res) => {
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
};

module.exports = { addBusiness, getBusiness, updateAddress };
