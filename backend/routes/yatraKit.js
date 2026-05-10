const express = require("express");
const YatraKit = require("../models/YatraKit");
const router = express.Router();

// 1. GET /api/yatra-kit/:yatraId — get kit list for a yatra
router.get("/:yatraId", async (req, res) => {
  try {
    const kit = await YatraKit.findOne({ yatraId: req.params.yatraId });
    if (!kit) {
      return res.status(404).json({ error: "Kit not found for this Yatra" });
    }
    res.json(kit);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch yatra kit" });
  }
});

// 2. GET /api/yatra-kit/items/orderable — get all orderable items
router.get("/items/orderable", async (req, res) => {
  try {
    const kits = await YatraKit.find({});
    let orderableItems = [];
    kits.forEach(kit => {
      const filtered = kit.items.filter(item => item.isOrderable);
      orderableItems = [...orderableItems, ...filtered];
    });
    
    // De-duplicate items by name or id if necessary
    const uniqueItems = Array.from(new Set(orderableItems.map(a => a.name)))
      .map(name => {
        return orderableItems.find(a => a.name === name);
      });

    res.json(uniqueItems);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orderable items" });
  }
});

module.exports = router;
