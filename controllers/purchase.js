const Razorpay = require('razorpay');
const Order = require('../models/orders');

const purchasepremium = async (req, res) => {
  try {
    console.log(process.env.RAZORPAY_KEY_ID)
    console.log(process.env.RAZORPAY_KEY_SECRET)
    const rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const amount = 200 * 100; 
    const receipt = `${req.user.id}_${Date.now()}`; 

   
    const order = await rzp.orders.create({ amount, currency: "INR", receipt });

    
    const newOrder = await Order.create({
      orderid: order.id,
      userId: req.user.id,
      status: 'PENDING',
    });

   
    return res.status(201).json({
      order,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Error in purchasepremium:", err);
    return res.status(500).json({ message: "Failed to initiate payment", error: err.message });
  }
};
const updateTransactionStatus = async (req, res) => {
    try {
      const { payment_id, order_id, status } = req.body;
  
      const order = await Order.findOne({ where: { orderid: order_id } });
  
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
  
      if (status === "FAILED") {
        // Update order status to FAILED
        order.status = "FAILED";
        await order.save();
  
        return res.status(202).json({
          success: false,
          message: "Transaction Failed. Order status updated to FAILED.",
        });
      } else if (status === "SUCCESS") {
        // Update order and user premium status concurrently
        const updateOrder = order.update({
          paymentid: payment_id,
          status: "SUCCESS",
        });
  
        const updateUser = req.user.update({ ispremiumuser: true });
  
        await Promise.all([updateOrder, updateUser]);
  
        return res.status(202).json({
          success: true,
          message: "Transaction Successful",
        });
      } else {
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
  