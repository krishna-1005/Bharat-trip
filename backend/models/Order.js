const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  yatraId: { type: mongoose.Schema.Types.ObjectId, ref: "Yatra" },
  items: [
    {
      itemId: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      imageUrl: { type: String }
    }
  ],
  totalAmount: { type: Number, required: true },
  deliveryAddress: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  status: { 
    type: String, 
    enum: ["placed", "confirmed", "shipped", "delivered"], 
    default: "placed" 
  },
  paymentStatus: { 
    type: String, 
    enum: ["pending", "paid"], 
    default: "pending" 
  },
  orderId: { type: String, required: true, unique: true }, // GTP-2024-XXXX
  estimatedDelivery: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
