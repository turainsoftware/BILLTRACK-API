const express = require("express");
const router = express.Router();
const { jwtMiddleware } = require("./../middleware/JwtMiddlware");
const { User } = require("../models/User");
const { Device } = require("../models/Devices");
const PushNotificationService = require("../services/PushNotificationService");

router.post("/sent-app-notification", jwtMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const userBusiness = await User.findByPk(user.id, {
      attributes: ["businessId"],
    });

    const { title, body } = req.body;

    const { businessId } = userBusiness.dataValues;
    const devices = await Device.findAll({
      where: { businessId: businessId },
      attributes: ["fcmToken"],
    });

    devices.map((device) => {
      const { fcmToken } = device;
      PushNotificationService.sendNotification(fcmToken, title,body);
    });
    return res.json({
      success: true,
      message: "Notification sent successfully",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
});

router.post("/sent-app-notification-with-image",jwtMiddleware,async(req,res)=>{
    try {
      const user = req.user;
      const userBusiness = await User.findByPk(user.id, {
        attributes: ["businessId"],
      });

      const { title, body,imageUrl } = req.body;

      const { businessId } = userBusiness.dataValues;
      const devices = await Device.findAll({
        where: { businessId: businessId },
        attributes: ["fcmToken"],
      });

      devices.map((device) => {
        const { fcmToken } = device;
        PushNotificationService.sendNotificationWithImage(fcmToken, title,body,imageUrl);
      });

      return res.json({
        success: true,
        message: "User fetched successfully",
      });
    } catch (error) {
        return res.json({
            success: false,
            message: error.message,
          });      
    }
})

module.exports = router;
