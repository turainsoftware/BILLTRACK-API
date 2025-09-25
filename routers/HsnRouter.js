const express = require("express");
const { Hsn } = require("../models/Hsn");
const {
  createHsn,
  createBulk,
  getAll,
  getById,
  getByHsnCode,
  search,
  count,
  deActiveById,
  updateById,
  deActiveByHsnCode,
  deActiveByIdInBulk,
  activeAll,
  activeById,
  exportData,
} = require("../controllers/HsnController");
const { Op, json } = require("sequelize");
const { Parser } = require("json2csv");
const router = express.Router();
const ExcelJS = require("exceljs");
const multer = require("multer");
const fs = require("fs");

const upload = multer({ dest: "upload/" });

// CREATE HSN CODE
router.post("/", createHsn);

// CREATE IN BULK
router.post("/bulk", createBulk);

// EXPORT TO EXCEL/CSV/JSON/PDF
router.get("/export/:format", exportData);

// GET ALL HSN CODE
router.get("/", getAll);

// SEARCH BY QUERY
router.get("/search", search);

// COUNT
router.get("/count", count);

// GET BY ID
router.get("/:id", getById);

// GET BY CODE
router.get("/code/:code", getByHsnCode);

// UPDATE BY ID
router.put("/:id", updateById);

// DELETE BY ID
router.delete("/:id", deActiveById);
router.delete("/hsn/:hsnCode", deActiveByHsnCode);

// DELETE IN BULK BY ID
router.delete("/bulk/id", deActiveByIdInBulk);

router.patch("/active/all", activeAll);

router.patch("/active/:id", activeById);


module.exports = router;
