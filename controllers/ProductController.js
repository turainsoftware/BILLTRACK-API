const fs = require("fs");
const { ProductCategory } = require("../models/ProductCategory");
const { Hsn } = require("../models/Hsn");
const { Product } = require("../models/Product");
const { User } = require("../models/User");
const { Op } = require("sequelize");

const deleteUploadedFileSafely = (file) => {
  if (!file?.path && file?.filename) {
    try {
      fs.unlink(path.join(PRODUCT_DIR, file.filename));
    } catch (_) {}
    return;
  }

  if (file?.path) {
    try {
      fs.unlinkSync(file.path);
    } catch (_) {}
  }
};

const create = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Product image is required",
        status: false,
      });
    }
    const businessId = req.user.businessId;

    const { name, hsnId, sku, description, price, stockQuantity } = req.body;

    if (!name || !hsnId || !description || !price || !stockQuantity) {
      deleteUploadedFileSafely(req.file);
      return res.status(400).json({
        message: "All fields are required",
        status: false,
      });
    }

    const hsn = await Hsn.findOne({
      where: { id: hsnId },
      attributes: ["id"],
    });
    if (!hsn) {
      return res.status(400).json({
        message: "Invalid HSN",
        status: false,
      });
    }

    const product = await Product.create({
      name,
      hsnId,
      sku,
      description,
      price,
      stockQuantity,
      logo: req.file.filename,
      businessId: businessId,
      logo: req.file.filename,
    });
    return res.json({ message: "Product created successfully", status: true });
  } catch (error) {
    deleteUploadedFileSafely(req.file);
    return res.json({ message: "Something went wrong", status: false, error });
  }
};

const getAll = async (req, res) => {
  try {
    const user = req.user;

    const business = await User.findByPk(user.id, {
      attributes: ["businessId"],
    });

    const { businessId } = business?.dataValues || {};

    const products = await Product.findAll({
      where: {
        [Op.and]: [{ isActive: true }, { businessId: businessId }],
      },
      attributes: [
        "id",
        "name",
        "description",
        "hsnId",
        "price",
        "unitType",
        "logo"
      ],
      include: [
        {
          model: Hsn,
          as: "hsn",
          attributes: { exclude: ["isActive"] },
        },
      ],
    });

    return res.json({ data: products, status: true });
  } catch (error) {
    return res.json({ error, message: "Something went wrong", status: false });
  }
};

const updateImage = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const product = await Product.findOne({
      where: { id: id },
      attributes: ["logo", "businessId"],
    });
    if (!product) {
      return res.json({ message: "Product not found", status: false });
    }
    if (user.businessId !== product.businessId) {
      return res.json({ message: "You are not authorized", status: false });
    }
    await Product.update(
      {
        logo: req.file.filename,
      },
      {
        where: { id: id },
      }
    );
    if (fs.existsSync(path.join(PRODUCT_DIR, product.logo))) {
      fs.unlinkSync(path.join(PRODUCT_DIR, product.logo));
    }
    return res.json({
      message: "Product updated successfully",
      status: true,
    });
  } catch (error) {
    deleteUploadedFileSafely(req.file);
    return res.json({ message: "Something went wrong", error, status: false });
  }
};

const updateProduct = async (req, res) => {
  try {
    const user = req.user;
    const product = await Product.findOne({
      where: { id: req.params.id },
    });
    if (!product) {
      return res.json({ message: "Product not found", status: false });
    }
    if (user.businessId !== product.businessId) {
      return res.json({ message: "You are not authorized", status: false });
    }

    const { name, description, price, stockQuantity } = req.body;
    await Product.update(
      {
        name,
        description,
        price,
        stockQuantity,
      },
      {
        where: { id: req.params.id },
      }
    );

    return res.json({ message: "Product updated successfully", status: true });
  } catch (error) {
    return res.json({ message: "Something went wrong", status: false });
  }
};

const getById = async (req, res) => {
  try {
    const user = req.user;
    const business = await User.findByPk(user.id, {
      attributes: ["businessId"],
    });
    const { businessId } = business?.dataValues || {};
    const product = await Product.findOne({
      where: { id: req.params.id },
      attributes: [
        "id",
        "name",
        "description",
        "hsnId",
        "price",
        "unitType",
        "logo",
      ],
      include: {
        model: Hsn,
        as: "hsn",
        attributes: { exclude: ["isActive"] },
      },
    });
    if (!product) {
      return res.json({ message: "Product not found", status: false });
    }
    if (businessId !== product.businessId) {
      return res.json({ message: "You are not authorized", status: false });
    }
    return res.json({ data: product, status: true });
  } catch (error) {
    return res.json({ message: "Something went wrong", status: false });
  }
};

const deleteById = async (req, res) => {
  try {
    const user = req.user;
    const business = await User.findByPk(user.id, {
      attributes: ["businessId"],
    });
    const { businessId } = business?.dataValues || {};
    const product = await Product.findOne({
      where: { id: req.params.id },
    });
    if (!product) {
      return res.json({ message: "Product not found", status: false });
    }
    if (businessId !== product.businessId) {
      return res.json({ message: "You are not authorized", status: false });
    }
    await Product.update(
      {
        isActive: false,
      },
      {
        where: { id: req.params.id },
      }
    );
    return res.json({ message: "Product deleted successfully", status: true });
  } catch (error) {
    return res.json({ message: "Something went wrong", status: false });
  }
};

const updateHsn = async (req, res) => {
  try {
    const user = req.user;
    const product = await Product.findOne({
      where: { id: req.params.id },
    });
    if (!product) {
      return res.json({ message: "Product not found", status: false });
    }
    if (user.businessId !== product.businessId) {
      return res.json({ message: "You are not authorized", status: false });
    }
    await Product.update(
      {
        hsnId: req.params.hsnId,
      },
      {
        where: { id: req.params.id },
      }
    );
    return res.json({ message: "Product updated successfully", status: true });
  } catch (error) {
    return res.json({ message: "Something went wrong", status: false });
  }
};

module.exports = {
  create,
  getAll,
  updateImage,
  updateProduct,
  getById,
  deleteById,
  updateHsn,
};
