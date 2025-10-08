const express = require("express");
const { Business } = require("../models/Business");
const router = express.Router();

// Create a new business
router.post("/", async (req, res) => {
  try {
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
      logoUrl,
    } = req.body;

    if (!name || !businessCategoryId) {
      return res
        .status(400)
        .json({ message: "Business name and category are required", status: false });
    }

    const category = await BusinessCategory.findByPk(businessCategoryId);
    if (!category) {
      return res.status(400).json({ message: "Invalid business category", status: false });
    }

    const existingBusiness = await Business.findOne({
      where: {
        [Business.sequelize.Op.or]: [{ email }, { gstNumber }],
      },
    });

    if (existingBusiness) {
      return res
        .status(400)
        .json({ message: "Email or GST number already exists", status: false });
    }

    const newBusiness = await Business.create({
      name,
      gstNumber,
      street,
      city,
      state,
      pinCode: pincode,
      email,
      phone,
      businessCategoryId,
      logoUrl,
    });

    return res.status(201).json({
      message: "Business created successfully",
      status: true,
      data: newBusiness,
    });
  } catch (error) {
    console.error("Error creating business:", error);
    return res
      .status(500)
      .json({ message: "Something went wrong", status: false, error: error.message });
  }
});

module.exports = router;