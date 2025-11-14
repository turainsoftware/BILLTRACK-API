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

router.post("/", jwtMiddleware, upload.single("logo"), create);

router.post("/bulk", jwtMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const { products } = req.body;

    if (!Array.isArray(products)) {
      return res.json({ message: "Invalid data format", status: false });
    }

    const finalSaveData = [];
    let unSavedData = 0;

    products.forEach((item) => {
      if (
        !item.name ||
        !item.productCategoryId ||
        !item.hsnId ||
        !item.unitType
      ) {
        unSavedData += 1;
        return;
      }
      finalSaveData.push({ ...item, businessId: user.businessId });
    });

    await Product.bulkCreate(finalSaveData);

    return res.json({ message: "Product added successfully", status: true });
  } catch (error) {
    return res.json({ message: "Something went wrong", status: false });
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

router.get("/:id", jwtMiddleware, getById);

router.delete("/:id", jwtMiddleware, deleteById);

router.patch("/upadate-hsn/:id/hsn/:hsnId", jwtMiddleware, updateHsn);

module.exports = router;
