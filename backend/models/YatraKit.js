const mongoose = require("mongoose");

const yatraKitSchema = new mongoose.Schema({
  yatraId: { type: mongoose.Schema.Types.ObjectId, ref: "Yatra", required: true },
  items: [
    {
      id: { type: String, required: true },
      name: { type: String, required: true },
      description: { type: String },
      category: { type: String, required: true }, // "Puja Items" / "Clothing" / "Medicines" / "Documents"
      isEssential: { type: Boolean, default: false },
      imageUrl: { type: String },
      price: { type: Number },
      isOrderable: { type: Boolean, default: false },
      weight: { type: String },
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("YatraKit", yatraKitSchema);
