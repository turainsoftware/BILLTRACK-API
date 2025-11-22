const express = require("express");
const { Invoice } = require("../models/Invoice");
const { InvoiceItems } = require("../models/InvoiceItems");
const { transform } = require("pdfkit");
const router = express.Router();
const { User } = require("./../models/User");
const { jwtMiddleware } = require("./../middleware/JwtMiddlware");
const { generateInvoiceNumber } = require("../utils/helper");

router.post("/", jwtMiddleware, async (req, res) => {
  let transaction;
  try {
    const user = req.user;

    const { status, customerNumber = "", items = [] } = req.body;
    const allowedStatus = ["paid", "unpaid", "canceled"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        message: "Invalid data format",
        status: false,
      });
    }

    if (!items || !Array.isArray(items) || !items.length > 0) {
      return res.status(400).json({
        message: "Invalid data format",
        status: false,
      });
    }

    let totalAmount = 0;

    items.forEach((item) => {
      if (!item.quantity || !item.productName || !item.rate) {
        return res
          .status(400)
          .json({ message: "Invalid data format", status: false });
      }
      totalAmount =
        totalAmount + new Number(item.rate) * new Number(item.quantity);
    });

    console.info(totalAmount);

    const business = await User.findByPk(user.id, {
      attributes: ["businessId"],
    });
    const { businessId } = business?.dataValues || {};

    transaction = await Invoice.sequelize.transaction();

    const invoiceNumber = generateInvoiceNumber(businessId);

    const invoice = await Invoice.create(
      {
        invoiceNumber: invoiceNumber,
        userId: user?.id,
        businessId: businessId,
        totalAmount: totalAmount,
        status: "paid",
        customerNumber,
      },
      { transaction }
    );

    await InvoiceItems.bulkCreate(
      items.map((item) => ({
        invoiceId: invoice.id,
        productName: item.productName,
        quantity: item.quantity,
        rate: item.rate,
        gstType: item.gstType || null,
        gstPercentage: item.gstPercentage || null,
      })),
      { transaction }
    );

    await transaction.commit();

    return res
      .status(201)
      .json({ message: "Invoice created successfully", status: true });
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }
    return res.json({
      error,
      message: "Something went wrong",
      status: false,
      error,
    });
  }
});

router.get("/", jwtMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const business = await User.findByPk(user.id, {
      attributes: ["businessId"],
    });
    const { businessId } = business?.dataValues || {};

    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 0;

    const offset = page * limit;

    const total = await Invoice.count({
      where: {
        businessId: businessId,
      },
    });

    const data = await Invoice.findAll({
      where: {
        businessId: businessId,
      },
      attributes: { exclude: ["userId", "businessId", "updatedAt"] },
      offset: offset,
      limit: limit,
      order: [["createdAt", "DESC"]],
    });

    const totalPage = Math.ceil(total / limit);
    const isLastPage = page === totalPage - 1;

    return res
      .json({
        data,
        pagination: {
          totalPage,
          hasNext: !isLastPage,
        },
        status: true,
      })
      .status(200);
  } catch (error) {
    return res.json({ error, message: "Something went wrong", status: false });
  }
});

router.get("/items/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findByPk(id, {
      attributes: ["id"],
    });
    if (!invoice) return res.json({ message: "No data found", status: false });
    const items = await InvoiceItems.findAll({
      where: {
        invoiceId: id,
      },
      attributes: [
        "id",
        "productName",
        "quantity",
        "rate",
        "gstType",
        "gstPercentage",
      ],
    });
    return res.json({ items, status: true }).status(200);
  } catch (error) {
    return res.json({ message: "Something went wrong", status: false });
  }
});

router.get("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const invoices = await Invoice.findAll({
      where: {
        userId: id,
      },
    });
    if (!invoices) return res.json({ message: "No data found", status: false });
    return res.json({ invoices, status: true }).status(200);
  } catch (error) {
    return res.json({ message: "Something went wrong", status: false });
  }
});

router.get("items/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findOne({
      where: {
        userId: id,
      },
    });

    if (!invoice) return res.json({ message: "No data found", status: false });
    const items = await InvoiceItems.findAll({
      where: {
        invoiceId: invoice.id,
      },
    });
    return res.json({ data: items, status: true }).status(200);
  } catch (error) {
    return res.json({ message: "Something went wrong", status: false });
  }
});

module.exports = router;
