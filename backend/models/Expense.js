const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trip",
    required: true,
    index: true
  },
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { 
    type: String, 
    enum: ["food", "hotel", "transport", "activity"], 
    required: true 
  },
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  splitAmong: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Expense", expenseSchema);
