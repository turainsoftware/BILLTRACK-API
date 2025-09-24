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
} = require("../controllers/HsnController");
const { Op } = require("sequelize");
const router = express.Router();

// CREATE HSN CODE
router.post("/", createHsn);

// CREATE IN BULK
router.post("/bulk", createBulk);

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
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { description, cGst, sGst, iGst } = req.body;

    const data = await Hsn.findOne({
      where: {
        id: id,
      },
    });
    if (!data)
      return res.json({ message: "No data found", status: false }).status(404);

    if (data.iGst) {
      await Hsn.update(
        { description: description, iGst: iGst },
        { where: { id: id } }
      );
    } else {
      await Hsn.update(
        { description: description, cGst: cGst, sGst: sGst },
        { where: { id: id } }
      );
    }

    return res.json({ message: "Successfully updated", status: true });
  } catch (error) {
    return res.json({ message: "Something went wrong", status: false });
  }
});

module.exports = router;
