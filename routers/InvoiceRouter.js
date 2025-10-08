const express = require("express");
const { Invoice } = require("../models/Invoice");
const { InvoiceItems } = require("../models/InvoiceItems");
const { transform } = require("pdfkit");
const router = express.Router();

router.post("/", async (req, res) => {
  let transaction;
  try {
    const { userId, status, items = [] } = req.body;
    const allowedStatus = ["paid", "unpaid", "canceled"];
    if (!userId || !allowedStatus.includes(status)) {
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
    let gst = 0;

    let gstPercentage = 0;

    items.forEach((item) => {
      if (
        !item.quantity ||
        !item.productId ||
        !item.rate ||
        !item.gstType ||
        !item.gstPercentage
      ) {
        return res
          .status(400)
          .json({ message: "Invalid data format", status: false });
      }
      gstPercentage = Number(item.gstPercentage);
      gst = gst + (item.rate * item.quantity * gstPercentage) / 100;
      totalAmount = totalAmount + item.rate * item.quantity;
    });

    console.info(totalAmount);

    transaction = await Invoice.sequelize.transaction();

    const invoice = await Invoice.create(
      {
        userId,
        totalAmount: totalAmount + gst,
        status: "paid",
      },
      { transaction }
    );

    await InvoiceItems.bulkCreate(
      items.map((item) => ({
        invoiceId: invoice.id,
        productId: item.productId,
        quantity: item.quantity,
        rate: item.rate,
        gstType: item.gstType,
        gstPercentage: item.gstPercentage,
      })),
      { transaction }
    );

    await transaction.commit();

    return res
      .status(201)
      .json({ message: "Invoice created successfully", status: true });
  } catch (error) {
    transaction.rollback();
    return res.json({ message: "Something went wrong", status: false, error });
  }
});

router.get("/", async (req, res) => {
  try {
    const data = await Invoice.findAll();

    return res.json({ data, status: true }).status(200);
  } catch (error) {
    return res.json({ message: "Something went wrong", status: false });
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
