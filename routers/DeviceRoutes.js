const express = require("express");
const { Device } = require("../models/Devices");
const router = express.Router();

router.delete("/remove-device/:deviceUniqueKey", async (req, res) => {
  try {
    const { deviceUniqueKey } = req.params;
    console.log(deviceUniqueKey);
    if (!deviceUniqueKey)
      return res.json({
        message: "Device unique id is required",
        status: false,
      });
    const device = await Device.findOne({
      where: { deviceUniqueKey },
    });
    console.log("device", device);
    if (!device)
      return res.json({ message: "Device not found", status: false });
    await device.destroy();
    return res.json({ message: "Device removed successfully", status: true });
  } catch (error) {
    console.log(error);
    return res.json({ message: "Something went wrong", status: false });
  }
});

module.exports = router;
