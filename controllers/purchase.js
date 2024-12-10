const Razorpay = require('razorpay');
const Order = require('../models/orders');
const { generateAccessToken } = require('./auth'); // Import the function

const purchasepremium = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: User not logged in" });
    }

    const rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const amount = 200 * 100; // Amount in paise
    const receipt = `${req.user.id}_${Date.now()}`; // Unique receipt ID

    const order = await rzp.orders.create({ amount, currency: "INR", receipt });
    if (!order || !order.status) {
      console.error("Invalid Razorpay order response:", order);
      return res.status(500).json({ message: "Razorpay order creation failed" });
    }

    const newOrder = await Order.create({
      orderid: order.id,
      userId: req.user.id,
      status: "PENDING",
    });

    return res.status(201).json({
      order,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Error in purchasepremium:", err.message);
    return res.status(500).json({ message: "Failed to initiate payment", error: err.message });
  }
};

const updateTransactionStatus = async (req, res) => {
  try {
    const { payment_id, order_id, status } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: User not logged in" });
    }

    console.log("Received data - payment_id:", payment_id, "order_id:", order_id, "status:", status);

    const order = await Order.findOne({ where: { orderid: order_id } });
    if (!order) {
      console.error("Order not found for order_id:", order_id);
      return res.status(404).json({ message: "Order not found" });
    }

    console.log("Order found:", order);

    if (status === "FAILED") {
      order.status = "FAILED";
      await order.save();
      console.log("Order status updated to FAILED");
      return res.status(202).json({
        success: false,
        message: "Transaction Failed. Order status updated to FAILED.",
      });
    } else if (status === "SUCCESS") {
      try {
        await Promise.all([
          order.update({
            paymentid: payment_id,
            status: "SUCCESS",
          }),
          req.user.update({ ispremiumuser: true }),
        ]);
        console.log("Order and user successfully updated");
        return res.status(202).json({
          success: true,
          message: "Transaction Successful",
          token: generateAccessToken(req.user.id, undefined, true),
        });
      } catch (updateError) {
        console.error("Error updating order or user:", updateError.message);
        return res.status(500).json({ message: "Failed to update order or user", error: updateError.message });
      }
    } else {
      console.error("Invalid transaction status:", status);
      return res.status(400).json({ message: "Invalid transaction status" });
    }
  } catch (err) {
    console.error("Error in updateTransactionStatus:", err.stack || err.message);
    return res.status(500).json({ message: "Failed to update transaction", error: err.message });
  }
};

module.exports = {
  purchasepremium,
  updateTransactionStatus,
};
