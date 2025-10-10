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

router.post("/", jwtMiddleware, upload.single("logo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Product image is required",
        status: false,
      });
    }
    const businessId = req.user.businessId;

    const {
      name,
      hsnId,
      sku,
      description,
      price,
      stockQuantity,
      productCategoryId,
    } = req.body;

    if (
      !name ||
      !hsnId ||
      !description ||
      !price ||
      !stockQuantity ||
      !productCategoryId
    ) {
      deleteUploadedFileSafely(req.file);
      return res.status(400).json({
        message: "All fields are required",
        status: false,
      });
    }

    const cat = await ProductCategory.findOne({
      where: { id: productCategoryId },
      attributes: ["id"],
    });
    if (!cat) {
      return res.status(400).json({
        message: "Invalid product category",
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
      productCategoryId,
      logo: req.file.filename,
      businessId: businessId,
      logo: req.file.filename,
    });
    return res.json({ message: "Product created successfully", status: true });
  } catch (error) {
    deleteUploadedFileSafely(req.file);
    return res.json({ message: "Something went wrong", status: false, error });
  }
});

router.get("/all", jwtMiddleware, async (req, res) => {
  try {
    const user = req.user;

    const products = await Product.findAll({
      where: {
        businessId: user.businessId,
      },
    });
    return res.json({ data: products, status: true });
  } catch (error) {
    return res.json({ message: "Something went wrong", status: false });
  }
});

router.patch(
  "/update-image/:id",
  jwtMiddleware,
  upload.single("logo"),
  async (req, res) => {
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
      return res.json({ message: "Something went wrong", status: false });
    }
  }
);

// upate
router.put("/:id", jwtMiddleware, async (req, res) => {
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
});

router.get("/:id", jwtMiddleware, async (req, res) => {
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
    return res.json({ data: product, status: true });
  } catch (error) {
    return res.json({ message: "Something went wrong", status: false });
  }
});

router.delete("/:id", jwtMiddleware, async (req, res) => {
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
});

router.patch("/upadate-hsn/:id/hsn/:hsnId", jwtMiddleware, async (req, res) => {
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
});

module.exports = router;
