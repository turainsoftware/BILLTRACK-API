const app = require("express");
const Razorpay = require("razorpay");
const router = app.Router();

const razorpay = new Razorpay({
  key_id: "rzp_test_RpQkpzsXTA2VO6",
  key_secret: "ipX303FliKXbW6wPVbSsnVdr",
});

// const razorpay = new Razorpay({
//   key_id: "rzp_live_RpQhHpWDUvOOad",
//   key_secret: "99XA0RNWx3mOWL2kQSpFuBuf",
// });

router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;
    let receipt = `order_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 12)}`;
    receipt = receipt.slice(0, 40);
    const order = await razorpay.orders.create({
      amount: parseInt(amount) * 100,
      currency: "INR",
      receipt: receipt,
    });
    console.log(order);
    return res.json({ order, status: true });
  } catch (error) {
    console.log(error);
    return res.json({
      error: error,
      message: "Something went wrong",
      status: false,
    });
  }
});

module.exports = router;