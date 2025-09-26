// const express = require("express");
// const { Hsn } = require("../models/Hsn");
// const { BusinessCategory } = require("../models/BusinessCategory");
// const { ProductCategory } = require("../models/ProductCategory");
// const {
//   create,
//   getAll,
//   getById,
//   getByHsnId,
//   getByHsnCode,
//   getByBusinessCategory,
//   createInBulk,
//   deleteById,
//   updateById,
//   search,
//   getHsnDetails,
//   getBusinessCategoryDetails,
//   activeDeletedItem,
//   reactiveInBulk,
//   count,
//   countActiveInActive,
//   pagination,
//   deleteBulk,
// } = require("../controllers/ProductCategoryController");
// const { where, Op } = require("sequelize");
// const { off } = require("pdfkit");
// const router = express.Router();

// // CREATE
// router.post("/", create);
// router.post("/bulk", createInBulk);

// // GET ALL BY PAGINATION
// router.get("/pagination", pagination);

// // SEARCH
// router.get("/search", search);

// // TOTAL COUNT
// router.get("/count", count);

// // TOTAL ACTIVE COUNT
// router.get("/active-inactive/count", countActiveInActive);

// // GET BY BUSINESS CATEGORY
// router.get("/business/category/:id", getByBusinessCategory);

// // GET BY HSN CODE
// router.get("/hsn/code/:code", getByHsnCode);

// // GET BY HSN ID
// router.get("/hsn/:id", getByHsnId);

// // GET HSN DETAILS OF PRODUCT CATEGORY
// router.get("/:id/hsn", getHsnDetails);

// // GET BUSINESS CATEOGRY DETAILS BY ID
// router.get("/:id/business-category", getBusinessCategoryDetails);

// // GET BY ID
// router.get("/:id", getById);

// // GET ALL
// router.get("/", getAll);

// // DELETE IN BULK
// router.delete("/bulk", deleteBulk);

// // DELETE BY ID
// router.delete("/:id", deleteById);

// // REACTIVE BY IN BULK
// router.patch("/reactive", reactiveInBulk);

// // ACTIVE THE DELETED ITEM
// router.patch("/reactive/:id", activeDeletedItem);

// // UPDATE
// router.put("/:id", updateById);

// module.exports = router;




const express = require("express");
const { Hsn } = require("../models/Hsn");
const { BusinessCategory } = require("../models/BusinessCategory");
const { ProductCategory } = require("../models/ProductCategory");
const {
  create,
  getAll,
  getById,
  getByHsnId,
  getByHsnCode,
  getByBusinessCategory,
  createInBulk,
  deleteById,
  updateById,
  search,
  getHsnDetails,
  getBusinessCategoryDetails,
  activeDeletedItem,
  reactiveInBulk,
  count,
  countActiveInActive,
  pagination,
  deleteBulk,
} = require("../controllers/ProductCategoryController");
const { where, Op } = require("sequelize");
const { off } = require("pdfkit");
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ProductCategory:
 *       type: object
 *       required:
 *         - name
 *         - hsnId
 *         - businessCategoryId
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ID of the product category
 *         name:
 *           type: string
 *           description: Name of the product category
 *         hsnId:
 *           type: integer
 *           description: ID of the associated HSN
 *         businessCategory:
 *           type: integer
 *           description: ID of the associated business category
 *         isActive:
 *           type: boolean
 *           description: Active status of the product category
 *           default: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 * 
 *     ProductCategoryBulkCreate:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - name
 *               - hsnId
 *               - businessCategoryId
 *             properties:
 *               name:
 *                 type: string
 *               hsnId:
 *                 type: integer
 *               businessCategoryId:
 *                 type: integer
 * 
 *     ProductCategoryBulkOperation:
 *       type: object
 *       required:
 *         - data
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             type: integer
 *           description: Array of product category IDs
 * 
 *     PaginationResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProductCategory'
 *         status:
 *           type: boolean
 * 
 *     CountResponse:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *         status:
 *           type: boolean
 * 
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         status:
 *           type: boolean
 * 
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         status:
 *           type: boolean
 *         error:
 *           type: string
 */

/**
 * @swagger
 * tags:
 *   name: Product Categories
 *   description: Product category management API
 */

/**
 * @swagger
 * /product-category:
 *   post:
 *     summary: Create a new product category
 *     tags: [Product Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - hsnId
 *               - businessCategoryId
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Electronics"
 *               hsnId:
 *                 type: integer
 *                 example: 1
 *               businessCategoryId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Product category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/ProductCategory'
 *                 message:
 *                   type: string
 *                 status:
 *                   type: boolean
 *       404:
 *         description: Invalid business category or HSN
 *       500:
 *         description: Internal server error
 */
router.post("/", create);

/**
 * @swagger
 * /product-category/bulk:
 *   post:
 *     summary: Create multiple product categories in bulk
 *     tags: [Product Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductCategoryBulkCreate'
 *     responses:
 *       200:
 *         description: Product categories created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 status:
 *                   type: boolean
 *                 createdData:
 *                   type: array
 *                 rejectedData:
 *                   type: array
 *       404:
 *         description: Invalid data format
 *       500:
 *         description: Internal server error
 */
router.post("/bulk", createInBulk);

/**
 * @swagger
 * /product-category/pagination:
 *   get:
 *     summary: Get product categories with pagination
 *     tags: [Product Categories]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: orderby
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 *         description: Sort order by name
 *     responses:
 *       200:
 *         description: Paginated product categories
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginationResponse'
 *       500:
 *         description: Internal server error
 */
router.get("/pagination", pagination);

/**
 * @swagger
 * /product-category/search:
 *   get:
 *     summary: Search product categories by name
 *     tags: [Product Categories]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query for product category name
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginationResponse'
 *       500:
 *         description: Internal server error
 */
router.get("/search", search);

/**
 * @swagger
 * /product-category/count:
 *   get:
 *     summary: Get total count of product categories
 *     tags: [Product Categories]
 *     responses:
 *       200:
 *         description: Total count
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CountResponse'
 *       500:
 *         description: Internal server error
 */
router.get("/count", count);

/**
 * @swagger
 * /product-category/active-inactive/count:
 *   get:
 *     summary: Get count of active/inactive product categories
 *     tags: [Product Categories]
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: integer
 *           enum: [0, 1]
 *         description: Filter by active status (0 = inactive, 1 = active)
 *     responses:
 *       200:
 *         description: Active/inactive count
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CountResponse'
 *       500:
 *         description: Internal server error
 */
router.get("/active-inactive/count", countActiveInActive);

/**
 * @swagger
 * /product-category/business/category/{id}:
 *   get:
 *     summary: Get product categories by business category ID
 *     tags: [Product Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Business category ID
 *     responses:
 *       200:
 *         description: Product categories for the business category
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 productCategories:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProductCategory'
 *                 status:
 *                   type: boolean
 *       404:
 *         description: Invalid business category
 *       500:
 *         description: Internal server error
 */
router.get("/business/category/:id", getByBusinessCategory);

/**
 * @swagger
 * /product-category/hsn/code/{code}:
 *   get:
 *     summary: Get product categories by HSN code
 *     tags: [Product Categories]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: HSN code
 *     responses:
 *       200:
 *         description: Product categories for the HSN code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 productCategories:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProductCategory'
 *                 status:
 *                   type: boolean
 *       404:
 *         description: Invalid HSN code
 *       500:
 *         description: Internal server error
 */
router.get("/hsn/code/:code", getByHsnCode);

/**
 * @swagger
 * /product-category/hsn/{id}:
 *   get:
 *     summary: Get product categories by HSN ID
 *     tags: [Product Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: HSN ID
 *     responses:
 *       200:
 *         description: Product categories for the HSN ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginationResponse'
 *       500:
 *         description: Internal server error
 */
router.get("/hsn/:id", getByHsnId);

/**
 * @swagger
 * /product-category/{id}/hsn:
 *   get:
 *     summary: Get HSN details for a product category
 *     tags: [Product Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product category ID
 *     responses:
 *       200:
 *         description: HSN details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                 status:
 *                   type: boolean
 *       500:
 *         description: Internal server error
 */
router.get("/:id/hsn", getHsnDetails);

/**
 * @swagger
 * /product-category/{id}/business-category:
 *   get:
 *     summary: Get business category details for a product category
 *     tags: [Product Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product category ID
 *     responses:
 *       200:
 *         description: Business category details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                 status:
 *                   type: boolean
 *       404:
 *         description: Invalid business category
 *       500:
 *         description: Internal server error
 */
router.get("/:id/business-category", getBusinessCategoryDetails);

/**
 * @swagger
 * /product-category/{id}:
 *   get:
 *     summary: Get product category by ID
 *     tags: [Product Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product category ID
 *     responses:
 *       200:
 *         description: Product category details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/ProductCategory'
 *                 status:
 *                   type: boolean
 *       404:
 *         description: Product category not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", getById);

/**
 * @swagger
 * /product-category:
 *   get:
 *     summary: Get all active product categories
 *     tags: [Product Categories]
 *     responses:
 *       200:
 *         description: List of all active product categories
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginationResponse'
 *       500:
 *         description: Internal server error
 */
router.get("/", getAll);

/**
 * @swagger
 * /product-category/bulk:
 *   delete:
 *     summary: Delete multiple product categories in bulk
 *     tags: [Product Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductCategoryBulkOperation'
 *     responses:
 *       200:
 *         description: Product categories deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid data format
 *       500:
 *         description: Internal server error
 */
router.delete("/bulk", deleteBulk);

/**
 * @swagger
 * /product-category/{id}:
 *   delete:
 *     summary: Delete a product category by ID (soft delete)
 *     tags: [Product Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product category ID
 *     responses:
 *       200:
 *         description: Product category deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Product category not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", deleteById);

/**
 * @swagger
 * /product-category/reactive:
 *   patch:
 *     summary: Reactivate multiple product categories in bulk
 *     tags: [Product Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductCategoryBulkOperation'
 *     responses:
 *       200:
 *         description: Product categories reactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid data format
 *       500:
 *         description: Internal server error
 */
router.patch("/reactive", reactiveInBulk);

/**
 * @swagger
 * /product-category/reactive/{id}:
 *   patch:
 *     summary: Reactivate a deleted product category
 *     tags: [Product Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product category ID
 *     responses:
 *       200:
 *         description: Product category reactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Product category not found
 *       500:
 *         description: Internal server error
 */
router.patch("/reactive/:id", activeDeletedItem);

/**
 * @swagger
 * /product-category/{id}:
 *   put:
 *     summary: Update a product category by ID
 *     tags: [Product Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Electronics"
 *               hsnId:
 *                 type: integer
 *                 example: 2
 *               businessCategoryId:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Product category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: No changes found or invalid data
 *       404:
 *         description: Product category not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", updateById);

module.exports = router;