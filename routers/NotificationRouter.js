const express = require("express");
const router = express.Router();
const { User } = require("../models/User");
const { Device } = require("../models/Devices");
const PushNotificationService = require("../services/PushNotificationService");
const { Op } = require("sequelize");
const { Notifications } = require("../models/Notifications");
const { jwtMiddleware } = require("./../middleware/JwtMiddlware");

router.post("/sent-app-notification", async (req, res) => {
  try {
    const { title, body, businesses = [] } = req.body;

    if (!title || !body || !businesses.length) {
      return res.status(400).json({
        success: false,
        message: "Title, body and businesses are required",
      });
    }

    const devices = await Device.findAll({
      where: { businessId: { [Op.in]: businesses } },
      attributes: ["fcmToken", "businessId"],
    });

    // Send notifications
    await Promise.all(
      devices.map((device) =>
        PushNotificationService.sendNotification(device.fcmToken, title, body)
      )
    );

    // Store notification per business
    await Promise.all(
      devices.map((device) =>
        Notifications.create({
          title,
          message: body,
          businessId: device.businessId,
        })
      )
    );

    return res.json({
      success: true,
      message: "Notification sent successfully",
      count: devices.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.post("/sent-app-notification-with-image", async (req, res) => {
  try {
    const { title, body, businesses = [], imageUrl } = req.body;

    if (!title || !body || !businesses.length || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Title, body, businesses and imageUrl are required",
      });
    }

    const devices = await Device.findAll({
      where: { businessId: { [Op.in]: businesses } },
      attributes: ["fcmToken", "businessId"],
    });

    // Send notifications
    await Promise.all(
      devices.map((device) =>
        PushNotificationService.sendNotificationWithImage(
          device.fcmToken,
          title,
          body,
          imageUrl
        )
      )
    );

    // Store notification per business
    await Promise.all(
      devices.map((device) =>
        Notifications.create({
          title,
          message: body,
          businessId: device.businessId,
          imageUrl,
        })
      )
    );

    return res.json({
      success: true,
      message: "Notification sent successfully",
      count: devices.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.post("/send-app-notification-to-all-user", async (req, res) => {
  try {
    const { title, body } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: "Title and body are required",
      });
    }

    const devices = await Device.findAll({
      attributes: ["fcmToken"],
      raw: true,
    });

    if (!devices.length) {
      return res.json({
        success: true,
        message: "No devices found",
      });
    }

    const tokens = [...new Set(devices.map((d) => d.fcmToken))]; // remove duplicates

    await Promise.all(
      tokens.map((token) =>
        PushNotificationService.sendNotification(token, title, body)
      )
    );

    return res.json({
      success: true,
      message: "Notification sent successfully",
      count: tokens.length,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error,
      success: false,
      message: "Failed to send notification",
    });
  }
});

router.get("/notification-exists", jwtMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const business = await User.findByPk(user.id, {
      attributes: ["businessId"],
    });
    const { businessId } = business.dataValues;
    const notificationExists = await Notifications.count({
      where: { [Op.and]: [{ businessId: businessId }, { read: false }] },
    });
    return res.json({
      success: notificationExists > 0,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/notifications", jwtMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const business = await User.findByPk(user.id, {
      attributes: ["businessId"],
    });
    const { businessId } = business.dataValues;
    const notifications = await Notifications.findAll({
      where: { businessId: businessId },
      order: [["createdAt", "DESC"]],
    });
    return res.json({
      success: true,
      notifications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
