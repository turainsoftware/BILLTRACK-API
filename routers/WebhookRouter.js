const express = require("express");
const { Device } = require("../models/Devices");
const router = express.Router();

router.get("/device-check/:uniqueKey", async (req, res) => {
  try {
    const { uniqueKey } = req.params;
    const data = await Device.findOne({
      where: {
        deviceUniqueKey: uniqueKey,
      },
    });
    if (!data) {
      return res.send(false);
    }
    return res.send(true);
  } catch (error) {
    return res.send(false);
  }
});


module.exports = router;