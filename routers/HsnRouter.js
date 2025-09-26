const express = require("express");
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
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: HSN
 *   description: HSN Code Management API
 */

/**
 * @swagger
 * /hsn:
 *   post:
 *     summary: Create a new HSN code
 *     tags: [HSN]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - hsnCode
 *               - description
 *             properties:
 *               hsnCode:
 *                 type: string
 *                 example: "1234"
 *               description:
 *                 type: string
 *                 example: "Pharmaceutical products"
 *               cGst:
 *                 type: number
 *                 example: 2.5
 *               sGst:
 *                 type: number
 *                 example: 2.5
 *               iGst:
 *                 type: number
 *                 example: 5.0
 *     responses:
 *       201:
 *         description: HSN code created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Hsn'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: HSN code already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 */
router.post("/", createHsn);

/**
 * @swagger
 * /hsn/bulk:
 *   post:
 *     summary: Create multiple HSN codes in bulk
 *     tags: [HSN]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - hsncodes
 *             properties:
 *               hsncodes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - hsnCode
 *                     - description
 *                   properties:
 *                     hsnCode:
 *                       type: string
 *                     description:
 *                       type: string
 *                     cGst:
 *                       type: number
 *                     sGst:
 *                       type: number
 *                     iGst:
 *                       type: number
 *     responses:
 *       201:
 *         description: Bulk creation completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 createdData:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Hsn'
 *                 unformatData:
 *                   type: array
 *                   items:
 *                     type: object
 *                 message:
 *                   type: string
 *                 status:
 *                   type: boolean
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post("/bulk", createBulk);

/**
 * @swagger
 * /hsn/export/{format}:
 *   get:
 *     summary: Export HSN codes in various formats
 *     tags: [HSN]
 *     parameters:
 *       - $ref: '#/components/parameters/formatParam'
 *     responses:
 *       200:
 *         description: Export successful
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Hsn'
 *           text/csv:
 *             schema:
 *               type: string
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid format
 *       500:
 *         description: Internal server error
 */
router.get("/export/:format", exportData);

/**
 * @swagger
 * /hsn:
 *   get:
 *     summary: Get all active HSN codes
 *     tags: [HSN]
 *     responses:
 *       200:
 *         description: List of active HSN codes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Hsn'
 *                 status:
 *                   type: boolean
 *       500:
 *         description: Internal server error
 */
router.get("/", getAll);

/**
 * @swagger
 * /hsn/search:
 *   get:
 *     summary: Search HSN codes by query
 *     tags: [HSN]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term for HSN code or description
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Hsn'
 *                 status:
 *                   type: boolean
 *       500:
 *         description: Internal server error
 */
router.get("/search", search);

/**
 * @swagger
 * /hsn/count:
 *   get:
 *     summary: Get total count of HSN codes
 *     tags: [HSN]
 *     responses:
 *       200:
 *         description: Count of HSN codes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: integer
 *                 status:
 *                   type: boolean
 *       500:
 *         description: Internal server error
 */
router.get("/count", count);

/**
 * @swagger
 * /hsn/{id}:
 *   get:
 *     summary: Get HSN code by ID
 *     tags: [HSN]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: HSN code details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Hsn'
 *                 status:
 *                   type: boolean
 *       404:
 *         description: HSN code not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", getById);

/**
 * @swagger
 * /hsn/code/{code}:
 *   get:
 *     summary: Get HSN code by HSN code value
 *     tags: [HSN]
 *     parameters:
 *       - $ref: '#/components/parameters/hsnCodeParam'
 *     responses:
 *       200:
 *         description: HSN code details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Hsn'
 *                 status:
 *                   type: boolean
 *       404:
 *         description: HSN code not found
 *       500:
 *         description: Internal server error
 */
router.get("/code/:code", getByHsnCode);

/**
 * @swagger
 * /hsn/{id}:
 *   put:
 *     summary: Update HSN code by ID
 *     tags: [HSN]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               cGst:
 *                 type: number
 *               sGst:
 *                 type: number
 *               iGst:
 *                 type: number
 *     responses:
 *       200:
 *         description: HSN code updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 status:
 *                   type: boolean
 *       404:
 *         description: HSN code not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", updateById);

/**
 * @swagger
 * /hsn/{id}:
 *   delete:
 *     summary: Deactivate HSN code by ID (soft delete)
 *     tags: [HSN]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: HSN code deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 status:
 *                   type: boolean
 *       404:
 *         description: HSN code not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", deActiveById);

/**
 * @swagger
 * /hsn/hsn/{hsnCode}:
 *   delete:
 *     summary: Deactivate HSN code by HSN code value
 *     tags: [HSN]
 *     parameters:
 *       - in: path
 *         name: hsnCode
 *         required: true
 *         schema:
 *           type: string
 *         description: HSN code value
 *     responses:
 *       200:
 *         description: HSN code deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 status:
 *                   type: boolean
 *       404:
 *         description: HSN code not found
 *       500:
 *         description: Internal server error
 */
router.delete("/hsn/:hsnCode", deActiveByHsnCode);

/**
 * @swagger
 * /hsn/bulk/id:
 *   delete:
 *     summary: Deactivate multiple HSN codes by IDs
 *     tags: [HSN]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of HSN code IDs to deactivate
 *     responses:
 *       200:
 *         description: HSN codes deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 status:
 *                   type: boolean
 *       404:
 *         description: No valid IDs provided
 *       500:
 *         description: Internal server error
 */
router.delete("/bulk/id", deActiveByIdInBulk);

/**
 * @swagger
 * /hsn/active/all:
 *   patch:
 *     summary: Activate all HSN codes
 *     tags: [HSN]
 *     responses:
 *       200:
 *         description: All HSN codes activated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 status:
 *                   type: boolean
 *       500:
 *         description: Internal server error
 */
router.patch("/active/all", activeAll);

/**
 * @swagger
 * /hsn/active/{id}:
 *   patch:
 *     summary: Activate a specific HSN code by ID
 *     tags: [HSN]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: HSN code activated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 status:
 *                   type: boolean
 *       404:
 *         description: HSN code not found
 *       500:
 *         description: Internal server error
 */
router.patch("/active/:id", activeById);

module.exports = router;