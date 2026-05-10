const express = require("express");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const { protect } = require("../middleware/protect");
const router = express.Router();

// 1. POST /api/orders — place order from cart
router.post("/", protect, async (req, res) => {
  try {
    const { deliveryAddress, yatraId } = req.body;
    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const orderId = `GTP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

    const order = new Order({
      userId: req.user._id,
      yatraId: cart.yatraId || yatraId,
      items: cart.items,
      totalAmount: cart.totalAmount,
      deliveryAddress,
      orderId,
      estimatedDelivery,
      paymentStatus: "paid" // Dummy payment success
    });

    await order.save();

    // Clear cart after order
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to place order" });
  }
});

// 2. GET /api/orders — get all orders of user
router.get("/", protect, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// 3. GET /api/orders/:orderId — get single order detail
router.get("/:orderId", protect, async (req, res) => {
  try {
    const order = await Order.findOne({ userId: req.user._id, orderId: req.params.orderId });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch order detail" });
  }
});

module.exports = router;
