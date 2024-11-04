const express = require("express");
const app = express();
const razorpay = require("razorpay");
const cors = require("cors");
require("dotenv").config();

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
app.use(
  cors({
    origin: ["http://localhost:3000", process.env.CLIENT_URL],
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Hello World" });
});

app.post("/orders", async (req, res) => {
  const instance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const options = {
    amount: req.body.amount,
    currency: req.body.currency,
    receipt: "receipt#1",
    payment_capture: 1,
  };

  try {
    const response = await instance.orders.create(options);
    res.json({
      id: response.id,
      currency: response.currency,
      amount: response.amount,
    });
  } catch (error) {
    res.status(500).send("Internal Server Error");
    console.log(error);
  }
});

app.get("/payment/:paymentId", async (req, res) => {
  const { paymentId } = req.params;

  const instance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  try {
    const response = await instance.payments.fetch(paymentId);
    if (!response) {
      res.status(404).send("Payment not found");
    }

    res.json({
      id: response.id,
      entity: response.entity,
      amount: response.amount,
      currency: response.currency,
      status: response,
    });
  } catch (error) {
    res.status(500).send("Internal Server Error");
    console.log(error);
  }
});
