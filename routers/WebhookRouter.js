const express = require("express");
const { Device } = require("../models/Devices");
const router = express.Router();
const kleur = require("kleur");

router.post("/device-check", async (req, res) => {
  try {
    const { uniqueKey } = req.body;
   console.log(kleur.red("uniqueKey not found"));
    if (!uniqueKey) {
      console.log(kleur.red("uniqueKey not found"));
      return res.json({ status: false });
    }
    const device = await Device.findOne({
      where: {
        deviceUniqueKey: uniqueKey,
      },
    });
    if (!device) {
      console.log(kleur.red("device not found"));
      return res.json({ status: false });
    }
    console.log(kleur.green("device found"));
    return res.json({ status: true });
  } catch (error) {
    console.error(kleur.red("error",error));
    return res.json({ status: false });
  }
});

module.exports = router;
