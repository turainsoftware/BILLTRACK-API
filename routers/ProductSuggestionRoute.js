const express = require("express");
const { route } = require("./InvoiceRouter");
const { jwtMiddleware } = require("./../middleware/JwtMiddlware");
const { Business } = require("../models/Business");
const { BusinessCategory } = require("../models/BusinessCategory");
const { ProductCategory } = require("../models/ProductCategory");
const { Op } = require("sequelize");
const { ProductSuggesion } = require("./../models/ProductSuggestion.js");
const router = express.Router();

router.post("/bulk", async(req, res) => {
  try {
    const { data = [] } = req.body;
    if (!data || !Array.isArray(data) || !data.length > 0) {
      return res.json({ message: "Invalid data format", status: false });
    }

    const rejectedObject = [];

    const filteredData = data.filter((item) => {
      let returnObject = {};

      if ((item.name && item.productCategoryId && item.hsnId, item.unitType)) {
        returnObject = {
          name: item.name,
          productCategoryId: item.productCategoryId,
          hsnId: item.hsnId,
          unitType: item.unitType,
          logo: "logo"
        };
      } else {
        rejectedObject.push(item);
      }
      return returnObject;
    });

    await ProductSuggesion.bulkCreate(filteredData);
    return res.json({
      totalCreated: filteredData.length,
      totalRegected: rejectedObject.length,
      regecteditem: rejectedObject,
      message: "Successfully created",
      status: true,
    });
  } catch (error) {
    return res.json({ message: "Something went wrong",error, status: false });
  }
});

// GET ALL THE PRODUCTS
router.get("/", jwtMiddleware, async (req, res) => {
  try {
    const { businessId } = req.user;

    // Fetch business data
    const businessData = await Business.findByPk(businessId, {
      attributes: ["businessCategoryId"],
    });

    const { businessCategoryId } = businessData?.dataValues || {};

    if (!businessCategoryId) {
      return res.json({
        message: "Invalid Business Category",
        status: false,
      });
    }

    // Fetch product categories for this business category
    const productCategories = await ProductCategory.findAll({
      where: {
        [Op.and]: [
          { isActive: true },
          { businessCategory: businessCategoryId },
        ],
      },
      attributes: ["id", "name"],
    });

    // For each category, get its product suggestions
    const result = await Promise.all(
      productCategories.map(async (item) => {
        const products = await ProductSuggesion.findAll({
          where: { productCategoryId: item.id },
        });

        return {
          name: item.name,
          products,
        };
      })
    );

    // Send successful response
    return res.json({
      data: result,
      status: true,
    });
  } catch (error) {
    console.error("Error fetching product categories:", error);
    return res.json({
      message: "Something went wrong",
      error: error.message,
      status: false,
    });
  }
});

module.exports = router;
