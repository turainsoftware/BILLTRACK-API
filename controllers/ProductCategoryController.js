const { BusinessCategory } = require("../models/BusinessCategory");
const { Hsn } = require("../models/Hsn");
const { ProductCategory } = require("../models/ProductCategory");

const create = async (req, res) => {
  try {
    const { name, hsnId, businessCategoryId } = req.body;

    console.info(name, hsnId, businessCategoryId);

    const businessCategory = await BusinessCategory.findByPk(
      businessCategoryId
    );
    if (!businessCategory)
      return res
        .json({ message: "Invalid Business Category", status: false })
        .status(404);
    const hsn = await Hsn.findByPk(hsnId);
    if (!hsn)
      return res.json({ message: "Invalid HSN", status: false }).status(404);

    const data = await ProductCategory.create({
      name,
      hsnId,
      businessCategory: businessCategoryId,
    });
    return res.json({ data, message: "Successfully created", status: true });
  } catch (error) {
    return res
      .json({ message: "Something went wrong", status: false, error })
      .status(500);
  }
};

module.exports = {
  create,
};
