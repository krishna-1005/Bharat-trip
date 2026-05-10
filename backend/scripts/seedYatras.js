const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const Yatra = require("../models/Yatra");

const yatras = [
  {
    name: "Haridwar & Rishikesh",
    description: "Experience the evening Ganga Aarti and the spiritual vibe of the Himalayan foothills.",
    location: "Uttarakhand",
    duration: "4 Days",
    bestTimeToVisit: "February to June, August to October",
    highlights: ["Ganga Aarti at Har Ki Pauri", "Laxman Jhula", "Beatles Ashram", "Yoga & Meditation"],
    imageUrl: "https://images.unsplash.com/photo-1590050752117-23a9d7fc2140?auto=format&fit=crop&q=80&w=800",
    category: "pilgrimage",
    transportCosts: {
      train: { minCost: 800, maxCost: 1500, duration: "5-7 hrs" },
      flight: { minCost: 3500, maxCost: 6000, duration: "1.5 hrs" },
      bus: { minCost: 500, maxCost: 900, duration: "6-8 hrs" }
    }
  },
  {
    name: "Kashi (Varanasi) Darshan",
    description: "Visit the oldest living city in the world and the sacred Kashi Vishwanath Temple.",
    location: "Uttar Pradesh",
    duration: "3 Days",
    bestTimeToVisit: "October to March",
    highlights: ["Kashi Vishwanath Temple", "Dashashwamedh Ghat Aarti", "Sarnath", "Boat ride on Ganges"],
    imageUrl: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&q=80&w=800",
    category: "pilgrimage",
    transportCosts: {
      train: { minCost: 1200, maxCost: 2500, duration: "12-14 hrs" },
      flight: { minCost: 4500, maxCost: 8000, duration: "1.5 hrs" },
      bus: { minCost: 800, maxCost: 1200, duration: "14-16 hrs" }
    }
  },
  {
    name: "Char Dham Yatra",
    description: "The ultimate pilgrimage covering Yamunotri, Gangotri, Kedarnath, and Badrinath.",
    location: "Uttarakhand",
    duration: "12 Days",
    bestTimeToVisit: "May to June, September to October",
    highlights: ["Kedarnath Temple", "Badrinath Temple", "Yamunotri", "Gangotri"],
    imageUrl: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=800",
    category: "pilgrimage",
    transportCosts: {
      train: { minCost: 1500, maxCost: 3000, duration: "12 hrs (to Haridwar)" },
      flight: { minCost: 5000, maxCost: 9000, duration: "1.5 hrs (to Dehradun)" },
      bus: { minCost: 1000, maxCost: 1800, duration: "14 hrs (to Haridwar)" }
    }
  },
  {
    name: "Vaishno Devi Katra",
    description: "A divine journey to the holy cave of Mata Vaishno Devi in the Trikuta Mountains.",
    location: "Jammu & Kashmir",
    duration: "3 Days",
    bestTimeToVisit: "March to October",
    highlights: ["Bhawan Darshan", "Bhairon Nath Temple", "Ardh Kuwari Cave", "Trek from Katra"],
    imageUrl: "https://images.unsplash.com/photo-1622144360341-2a6c6ec663da?auto=format&fit=crop&q=80&w=800",
    category: "pilgrimage",
    transportCosts: {
      train: { minCost: 1000, maxCost: 2200, duration: "12-15 hrs" },
      flight: { minCost: 4000, maxCost: 7500, duration: "1.5 hrs" },
      bus: { minCost: 900, maxCost: 1400, duration: "14-16 hrs" }
    }
  },
  {
    name: "Tirupati Balaji",
    description: "Visit the richest temple in the world and seek blessings of Lord Venkateswara.",
    location: "Andhra Pradesh",
    duration: "2 Days",
    bestTimeToVisit: "September to March",
    highlights: ["Venkateswara Temple", "Padmavathi Temple", "Akasa Ganga", "Silathoranam"],
    imageUrl: "https://images.unsplash.com/photo-1610448721566-473ce9da81c3?auto=format&fit=crop&q=80&w=800",
    category: "pilgrimage",
    transportCosts: {
      train: { minCost: 1500, maxCost: 3500, duration: "24-30 hrs" },
      flight: { minCost: 5500, maxCost: 10000, duration: "2.5 hrs" },
      bus: { minCost: 1200, maxCost: 2000, duration: "12-15 hrs" }
    }
  },
  {
    name: "Shirdi Sai Baba",
    description: "A pilgrimage to the home of the revered saint Sai Baba.",
    location: "Maharashtra",
    duration: "2 Days",
    bestTimeToVisit: "June to March",
    highlights: ["Sai Baba Samadhi Mandir", "Dwarkamai", "Chavadi", "Shani Shingnapur"],
    imageUrl: "https://images.unsplash.com/photo-1616493923308-466f913d07e6?auto=format&fit=crop&q=80&w=800",
    category: "pilgrimage",
    transportCosts: {
      train: { minCost: 1100, maxCost: 2400, duration: "18-22 hrs" },
      flight: { minCost: 4500, maxCost: 8500, duration: "2 hrs" },
      bus: { minCost: 1000, maxCost: 1600, duration: "12-14 hrs" }
    }
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected for seeding");
    
    await Yatra.deleteMany({});
    console.log("🗑️ Existing Yatras cleared");
    
    await Yatra.insertMany(yatras);
    console.log("🌱 Database seeded with 6 Yatras");
    
    process.exit();
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
};

seedDB();
