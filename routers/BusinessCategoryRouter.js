const express = require("express");
const { BusinessCategory } = require("../models/BusinessCategory");
const {
  createBusinessCategory,
  getAllBusinessCategory,
  findById,
  updateById,
  deleteById,
  reactiveById,
} = require("../controllers/BusinessCategoryController");
const router = express.Router();

// CREATE
router.post("/", createBusinessCategory);

// GET ALL BY STATUS
router.get("/status", async (req, res) => {
  try {
    const { status } = req.query;
    if (typeof (status === "true" || status === "false") !== "boolean") {
      return res.json({ message: "Status must be boolean", status: false });
    }
    const data = await BusinessCategory.findAll({
      where: {
        status: status === "true",
      },
    });
    return res.json({ data, status: true });
  } catch (error) {
    return res.json({ message: "Something went wrong", status: false });
  }
});

// GET ALL
router.get("/", getAllBusinessCategory);

// GET BY ID
router.get("/:id", findById);

// UPDATE BY ID
router.put("/:id", updateById);

// DELETE BY ID
router.delete("/:id", deleteById);

router.put("/reactive/:id", reactiveById);

module.exports = router;
