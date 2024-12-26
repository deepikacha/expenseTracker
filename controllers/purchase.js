const Razorpay = require('razorpay');
const Order = require('../models/orders');
const { generateToken } = require('../util/jwt'); 

const purchasepremium = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: User not logged in" });
    }

    const rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    console.log(rzp);

    const amount = 200 * 100; // Amount in paise
    const receipt = `${req.user.id}_${Date.now()}`; // Unique receipt ID

    const order = await rzp.orders.create({ amount, currency: "INR", receipt });
    console.log(order);
    if (!order || !order.status) {
      console.error("Invalid Razorpay order response:", order);
      return res.status(500).json({ message: "Razorpay order creation failed" });
    }

    const newOrder = await Order.create({
      orderid: order.id,
      userId: req.user.id,
      status: "PENDING",
    });
     console.log(order);
     console.log(process.env.RAZORPAY_KEY_ID)
     res.status(201).json({
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
    const { paymentid, orderid, status } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: User not logged in" });
    }

  
    if (!orderid || !paymentid) {
      console.error("Order ID or Payment ID is missing");
      return res.status(400).json({ message: "Order ID or Payment ID is missing" });
    }

    const order = await Order.findOne({ where: { orderid } });
    if (!order) {
      console.error("Order not found for orderid:", orderid);
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
            paymentid: paymentid,
            status: "SUCCESS",
          }),
          req.user.update({ ispremiumuser: true }),
        ]);
        console.log("Order and user successfully updated");
        return res.status(202).json({
          success: true,
          message: "Transaction Successful",
          token: generateToken(req.user.id),
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
    console.error("Error in updateTransactionStatus:", err.message);
    return res.status(500).json({ message: "Failed to update transaction", error: err.message });
  }
};



module.exports = {
  purchasepremium,
  updateTransactionStatus,
};

   