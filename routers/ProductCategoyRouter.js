const express = require("express");
const { Hsn } = require("../models/Hsn");
const { BusinessCategory } = require("../models/BusinessCategory");
const { ProductCategory } = require("../models/ProductCategory");
const { create } = require("../controllers/ProductCategoryController");
const router = express.Router();


// CREATE
router.post("/", create);

module.exports = router;
