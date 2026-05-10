const express = require("express");
const Cart = require("../models/Cart");
const { protect } = require("../middleware/protect");
const router = express.Router();

// GET /api/cart — get user cart
router.get("/", protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [], totalAmount: 0 });
    }
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

// POST /api/cart/add — add item to cart
router.post("/add", protect, async (req, res) => {
  try {
    const { itemId, name, price, imageUrl, yatraId } = req.body;
    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [], yatraId, totalAmount: 0 });
    }

    const itemIndex = cart.items.findIndex(p => p.itemId === itemId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += 1;
    } else {
      cart.items.push({ itemId, name, price, quantity: 1, imageUrl });
    }

    cart.totalAmount = cart.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: "Failed to add to cart" });
  }
});

// PUT /api/cart/update — update quantity
router.put("/update", protect, async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    const itemIndex = cart.items.findIndex(p => p.itemId === itemId);
    if (itemIndex > -1) {
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }
      cart.totalAmount = cart.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      await cart.save();
      res.json(cart);
    } else {
      res.status(404).json({ error: "Item not found in cart" });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to update cart" });
  }
});

// DELETE /api/cart/remove/:itemId — remove item
router.delete("/remove/:itemId", protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    cart.items = cart.items.filter(p => p.itemId !== req.params.itemId);
    cart.totalAmount = cart.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: "Failed to remove item" });
  }
});

// DELETE /api/cart/clear — clear cart
router.delete("/clear", protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id });
    if (cart) {
      cart.items = [];
      cart.totalAmount = 0;
      await cart.save();
    }
    res.json({ message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear cart" });
  }
});

module.exports = router;
