const express = require("express");
const router = express.Router();
const { jwtMiddleware } = require("./../middleware/JwtMiddlware");
const { smsService } = require("./../services/SmsService");

router.post("/sent-invoice", jwtMiddleware, async (req, res) => {
  try {
    const { phone, invoiceNumber, totalAmount, businessName } = req.body;
    const result = await smsService.sentInvoiceSms({
      billAmount: totalAmount,
      invoiceNumber: invoiceNumber,
      businessName: businessName,
      phone: phone,
    });
    if (result) {
      return res.json({
        status: true,
        message: "Invoice sent successfully",
      });
    } else {
      throw new Error("Invoice not sent");
    }
  } catch (error) {
    return res.json({
      status: false,
      message: error.message,
    });
  }
});

module.exports = router;
