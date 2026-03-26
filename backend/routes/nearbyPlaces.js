const express = require("express");
const router = express.Router();
const path = require("path");
const { generateReviews } = require("../services/reviewService");

/* ── Load combined datasets ── */
let allPlaces = [];
try {
  const curated = require("../data/bengaluruPlaces.json");
  const bulk = require("../data/bangalorePlaces.json");

  // Normalize curated
  const normalizedCurated = curated.flat().filter(p => p && p.name).map(p => ({
    name: p.name,
    lat: Number(p.lat),
    lng: Number(p.lng),
    category: p.category || "Other",
    source: "curated"
  }));

  // Normalize bulk
  const normalizedBulk = bulk.filter(p => p && p.name).map(p => ({
    name: p.name,
    lat: Number(p.lat),
    lng: Number(p.lng),
    category: p.category || "Other",
    source: "bulk"
  }));

  allPlaces = [...normalizedCurated, ...normalizedBulk];
  console.log(`✅ Nearby API loaded ${allPlaces.length} total places`);
} catch (e) {
  console.error("⚠️ Nearby API data load error:", e.message);
}

/* Haversine distance formula (km) */
function distance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

router.post("/", async (req, res) => {
  try {
    let { lat, lng, radius = 5 } = req.body;

    if (!lat || !lng) {
      // Fallback to Bangalore center if no coordinates provided
      lat = 12.9716;
      lng = 77.5946;
    }

    const filtered = allPlaces
      .map(place => ({
        ...place,
        distance: distance(Number(lat), Number(lng), place.lat, place.lng)
      }))
      .filter(place => place.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    const finalResults = filtered.length > 0 ? filtered.slice(0, 50) : allPlaces
      .map(place => ({
        ...place,
        distance: distance(Number(lat), Number(lng), place.lat, place.lng)
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);

    // Enrich top 10 with reviews
    const enriched = await Promise.all(
      finalResults.map(async (p, i) => {
        if (i < 10) {
          const reviews = await generateReviews(p.name, p.category, "Bangalore");
          return { ...p, reviews };
        }
        return p;
      })
    );

    res.json(enriched);
  } catch (err) {
    console.error("Nearby API error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;