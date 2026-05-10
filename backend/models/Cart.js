const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  yatraId: { type: mongoose.Schema.Types.ObjectId, ref: "Yatra" },
  items: [
    {
      itemId: { type: String, required: true }, // refers to the 'id' field in YatraKit items
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true, default: 1 },
      imageUrl: { type: String }
    }
  ],
  totalAmount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Cart", cartSchema);
