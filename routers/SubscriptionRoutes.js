const express = require("express");
const { jwtMiddleware } = require("../middleware/JwtMiddlware");

const { User } = require("./../models/User");
const Subscription = require("../models/Subscription");
const { Op } = require("sequelize");

const router = express.Router();

router.post("/", jwtMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const business = await User.findByPk(user.id, {
      attributes: ["businessId"],
    });
    const { businessId } = business?.dataValues || {};

    const subscription = await Subscription.findOne({
      where: {
        businessId: businessId,
        endDate: {
          [Op.gte]: new Date(),
        },
      },
    });

    if (subscription && subscription?.plan !== "free") {
      return res.json({
        message: "Subscription already exists",
        status: false,
      });
    }

    const { plan, orderId, paymentId, paymentSignature } = req.body;
    if (!["free", "basic", "pro"].includes(plan)) {
      return res.json({
        message: "Invalid plan",
        status: false,
      });
    }

    if (!orderId || !paymentId || !paymentSignature) {
      return res.json({
        message: "Invalid payment details",
        status: false,
      });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);

    const createdSubscription = await Subscription.create({
      businessId: businessId,
      plan: plan,
      orderId: orderId,
      paymentId: paymentId,
      paymentSignature: paymentSignature,
      startDate: startDate,
      endDate: endDate,
    });

    return res.json({
      message: "Subscription created successfully",
      status: true,
      data: createdSubscription,
    });
  } catch (error) {
    return res.json({
      error: error,
      message: "Something went wrong",
      status: false,
    });
  }
});

router.get("/current-subscription", jwtMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const business = await User.findByPk(user.id, {
      attributes: ["businessId"],
    });
    const { businessId } = business?.dataValues || {};
    const subscription = await Subscription.findOne({
      where: {
        businessId: businessId,
        endDate: {
          [Op.gte]: new Date(),
        },
      },
      order: [["endDate", "DESC"]],
      attributes: ["startDate","endDate","plan"]
    });
    return res.json({
      message: "Subscription found successfully",
      status: true,
      data: subscription,
    });
  } catch (error) {
    return res.json({
      error: error,
      message: "Something went wrong",
      status: false,
    });
  }
});

module.exports = router;
