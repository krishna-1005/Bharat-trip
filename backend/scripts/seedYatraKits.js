const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const Yatra = require("../models/Yatra");
const YatraKit = require("../models/YatraKit");

const seedKits = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected for seeding kits");

    await YatraKit.deleteMany({});
    console.log("🗑️ Existing YatraKits cleared");

    const yatras = await Yatra.find({});

    const kitTemplates = {
      "Haridwar & Rishikesh": [
        { id: "hri-1", name: "Gangajal Bottle", description: "Essential for carrying holy water", category: "Puja Items", isEssential: true, isOrderable: true, price: 150, weight: "500ml", imageUrl: "https://images.unsplash.com/photo-1590050752117-23a9d7fc2140?w=200" },
        { id: "hri-2", name: "White Dhoti/Kurta", description: "Traditional attire for Ganga Aarti", category: "Clothing", isEssential: true, isOrderable: true, price: 850, weight: "400g", imageUrl: "https://images.unsplash.com/photo-1583301286816-f4f0af04a8a6?w=200" },
        { id: "hri-3", name: "Rudraksha Mala", description: "Spiritual prayer beads", category: "Puja Items", isEssential: true, isOrderable: true, price: 450, weight: "100g", imageUrl: "https://images.unsplash.com/photo-1616493923308-466f913d07e6?w=200" },
        { id: "hri-4", name: "Puja Thali Set", description: "Complete set for rituals", category: "Puja Items", isEssential: true, isOrderable: true, price: 1200, weight: "1kg", imageUrl: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=200" }
      ],
      "Kashi (Varanasi) Darshan": [
        { id: "ks-1", name: "Bhasma/Vibhuti", description: "Sacred ash for Lord Shiva", category: "Puja Items", isEssential: true, isOrderable: true, price: 50, weight: "50g", imageUrl: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=200" },
        { id: "ks-2", name: "Rudraksha", description: "Single bead Rudraksha", category: "Puja Items", isEssential: true, isOrderable: true, price: 200, weight: "10g", imageUrl: "https://images.unsplash.com/photo-1616493923308-466f913d07e6?w=200" },
        { id: "ks-3", name: "White Clothes", description: "Pure white cotton clothes", category: "Clothing", isEssential: true, isOrderable: true, price: 950, weight: "500g", imageUrl: "https://images.unsplash.com/photo-1583301286816-f4f0af04a8a6?w=200" }
      ],
      "Char Dham Yatra": [
        { id: "cd-1", name: "Woolen Jacket", description: "Heavy woolen for high altitudes", category: "Clothing", isEssential: true, isOrderable: true, price: 2500, weight: "1.2kg", imageUrl: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=200" },
        { id: "cd-2", name: "Trekking Shoes", description: "Sturdy shoes for mountain paths", category: "Clothing", isEssential: true, isOrderable: true, price: 3500, weight: "1.5kg", imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200" },
        { id: "cd-3", name: "Oxygen Canister", description: "Portable oxygen for high altitude", category: "Medicines", isEssential: true, isOrderable: true, price: 600, weight: "500g", imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200" }
      ],
      "Vaishno Devi Katra": [
        { id: "vd-1", name: "Mata ka Chunari", description: "Sacred offering for the Goddess", category: "Puja Items", isEssential: true, isOrderable: true, price: 300, weight: "100g", imageUrl: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=200" },
        { id: "vd-2", name: "Walking Stick", description: "Support for the 12km trek", category: "Clothing", isEssential: false, isOrderable: true, price: 150, weight: "300g", imageUrl: "https://images.unsplash.com/photo-1590050752117-23a9d7fc2140?w=200" }
      ],
      "Tirupati Balaji": [
        { id: "tp-1", name: "Sandalwood Paste", description: "Pure sandalwood for Tilak", category: "Puja Items", isEssential: true, isOrderable: true, price: 250, weight: "50g", imageUrl: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=200" },
        { id: "tp-2", name: "Silk Veshti", description: "Traditional silk dhoti for darshan", category: "Clothing", isEssential: true, isOrderable: true, price: 1800, weight: "400g", imageUrl: "https://images.unsplash.com/photo-1583301286816-f4f0af04a8a6?w=200" }
      ],
      "Shirdi Sai Baba": [
        { id: "sh-1", name: "Udi (Sacred Ash)", description: "Powerful healing ash from Shirdi", category: "Puja Items", isEssential: true, isOrderable: true, price: 20, weight: "20g", imageUrl: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=200" },
        { id: "sh-2", name: "Sai Satcharitra", description: "Holy book of Shirdi Sai Baba", category: "Puja Items", isEssential: true, isOrderable: true, price: 150, weight: "300g", imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200" }
      ]
    };

    const finalKits = yatras.map(yatra => {
      const items = kitTemplates[yatra.name] || [
        { id: `${yatra._id}-1`, name: "Puja Kit", description: "Basic items for darshan", category: "Puja Items", isEssential: true, isOrderable: true, price: 500, weight: "500g", imageUrl: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=200" },
        { id: `${yatra._id}-2`, name: "First Aid", description: "Travel medicines", category: "Medicines", isEssential: true, isOrderable: true, price: 300, weight: "200g", imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200" }
      ];
      return {
        yatraId: yatra._id,
        items
      };
    });

    await YatraKit.insertMany(finalKits);
    console.log(`🌱 Database seeded with ${finalKits.length} Yatra Kits`);

    process.exit();
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
};

seedKits();
