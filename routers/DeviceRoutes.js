const express = require("express");
const { Device } = require("../models/Devices");
const router = express.Router();

router.delete("remove-device", async (req, res) => {
  try {
    const { deviceUniqueId } = req.body;
    if (!deviceUniqueId)
      return res.json({
        message: "Device unique id is required",
        status: false,
      });
    const device = await Device.findOne({
      where: { deviceUniqueId },
      attributes: ["id"],
    });
    if (!device)
      return res.json({ message: "Device not found", status: false });
    await device.destroy();
    return res.json({ message: "Device removed successfully", status: true });
  } catch (error) {
    return res.json({ message: "Something went wrong", status: false });
  }
});

module.exports = router;
