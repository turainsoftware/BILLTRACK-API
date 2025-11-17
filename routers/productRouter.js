const express = require("express");
const { route } = require("./BusinessRoute");
const { jwtMiddleware } = require("../middleware/JwtMiddlware");
const multer = require("multer");
const router = express.Router();
const fs = require("fs");
const { PRODUCT_DIR } = require("../config/config");
const { randomUUID } = require("crypto");
const path = require("path");
const { ProductCategory } = require("../models/ProductCategory");
const { Hsn } = require("../models/Hsn");
const { Product } = require("../models/Product");
const { image } = require("pdfkit");
const {
  create,
  getAll,
  updateImage,
  updateProduct,
  getById,
  deleteById,
  updateHsn,
} = require("../controllers/ProductController");
const { Business } = require("../models/Business");
const { User } = require("../models/User");

if (!fs.existsSync(PRODUCT_DIR)) {
  fs.mkdirSync(PRODUCT_DIR, { recursive: true });
}

// Allowed image mime types for logos
const ALLOWED_MIME = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, PRODUCT_DIR),
  filename: (req, file, cb) => {
    const ext = ALLOWED_MIME[file.mimetype];
    const safeExt = ext
      ? `.${ext}`
      : path.extname(file.originalname).toLowerCase();
    const fileName = `${randomUUID()}${safeExt}`;
    cb(null, fileName);
  },
});

const filter = (req, file, cb) => {
  if (!ALLOWED_MIME[file.mimetype]) {
    return new Error(
      "Only PNG, JPG, and WEBP image types are allowed for the logo"
    );
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter: filter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

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

// router.post("/", jwtMiddleware, upload.single("logo"), create);

router.post("/", upload.single("logo"), jwtMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const business = await User.findByPk(user.id, {
      attributes: ["businessId"],
    });
    const { businessId } = business?.dataValues || {};

    const { name, hsnId, unitType, price } = req.body;

    if (!name) {
      return res.json({ message: "Product name is required", status: false });
    } else if (!hsnId) {
      return res.json({ message: "HSN is required", status: false });
    } else if (!unitType) {
      return res.json({ message: "Unit type is required", status: false });
    } else if (!price) {
      return res.json({ message: "Price is required", status: false });
    }

    const existHsn = await Hsn.findOne({ where: { id: hsnId } });
    if (!existHsn) {
      return res.json({ message: "Invalid HSN", status: false });
    }

    const fileName = req.file ? req.file.filename : null;

    const product = await Product.create({
      name,
      hsnId,
      unitType,
      price,
      businessId,
    });

    if (fileName) {
      product.logo = fileName;
    }

    const createdProduct = await product.save();

    return res.json({
      message: "Product added successfully",
      status: true,
      data: createdProduct,
    });
  } catch (error) {
    return res.json({ error, message: "Something went wrong", status: false });
  }
});

router.post("/bulk", jwtMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const business = await User.findByPk(user.id, {
      attributes: ["businessId"],
    });
    const { businessId } = business?.dataValues || {};
    console.log("businessId", businessId);

    const { products } = req.body;

    if (!Array.isArray(products)) {
      return res.json({ message: "Invalid data format", status: false });
    }

    const finalSaveData = [];
    let unSavedData = 0;

    products.forEach((item) => {
      if (!item.name || !item.hsnId || !item.unitType) {
        unSavedData += 1;
        return;
      }
      finalSaveData.push({ ...item, businessId: businessId });
    });

    await Product.bulkCreate(finalSaveData);

    return res.json({ message: "Product added successfully", status: true });
  } catch (error) {
    return res.json({ error, message: "Something went wrong", status: false });
  }
});

router.get("/all", jwtMiddleware, getAll);

router.patch(
  "/update-image/:id",
  jwtMiddleware,
  upload.single("logo"),
  updateImage
);

// upate
router.put("/:id", jwtMiddleware, updateProduct);

router.put(
  "/update/product",
  upload.single("logo"),
  jwtMiddleware,
  async (req, res) => {
    try {
      const fileName = req.file ? req.file.filename : null;

      const { id, name, price, unitType } = req.body;

      if (!id) {
        return res.json({ message: "Product id is required", status: false });
      }

      const product = await Product.findByPk(id);

      if (!product) {
        return res.json({ message: "Product not found", status: false });
      }

      const updateData = {
        name,
        price,
        unitType,
      };

      if (fileName) {
        updateData.logo = fileName;
      }

      await Product.update(updateData, {
        where: { id },
      });
      const updatedProduct = await Product.findByPk(id);
      return res.json({
        message: "Product updated successfully",
        status: true,
        data: updatedProduct,
      });
    } catch (error) {
      return res.json({
        message: "Something went wrong",
        status: false,
      });
    }
  }
);

router.get("/:id", jwtMiddleware, getById);

router.delete("/:id", jwtMiddleware, deleteById);

router.patch("/upadate-hsn/:id/hsn/:hsnId", jwtMiddleware, updateHsn);

module.exports = router;
