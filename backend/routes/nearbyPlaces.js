const express = require("express");
const router = express.Router();
const axios = require("axios");
const path = require("path");
const { generateReviews } = require("../services/reviewService");

/* ── Load local datasets ── */
let allPlaces = [];
try {
  const curated = require("../data/bengaluruPlaces.json");
  const bulk = require("../data/bangalorePlaces.json");

  const normalizedCurated = curated.flat().filter(p => p && p.name).map(p => ({
    name: p.name,
    lat: Number(p.lat),
    lng: Number(p.lng),
    category: p.category || "Other",
    source: "curated"
  }));

  const normalizedBulk = bulk.filter(p => p && p.name).map(p => ({
    name: p.name,
    lat: Number(p.lat),
    lng: Number(p.lng),
    category: p.category || "Other",
    source: "bulk"
  }));

  allPlaces = [...normalizedCurated, ...normalizedBulk];
} catch (e) {}

function distance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const fetchOSMPlaces = require("../services/osmPlaces");

router.post("/", async (req, res) => {
  try {
    let { lat, lng, city, radius = 10, category } = req.body;

    // If city name is provided, geocode it first
    if (city && (!lat || !lng)) {
      try {
        const geo = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1`, {
          headers: { "User-Agent": "GoTripo/1.0" }
        });
        if (geo.data && geo.data.length > 0) {
          lat = Number(geo.data[0].lat);
          lng = Number(geo.data[0].lon);
        }
      } catch (e) {}
    }

    if (!lat || !lng) {
      lat = 12.9716; lng = 77.5946; // Fallback
    }

    // Filter local data
    let localMatches = allPlaces
      .map(place => ({ ...place, distance: distance(lat, lng, place.lat, place.lng) }))
      .filter(place => place.distance <= radius);
    
    if (category) {
      localMatches = localMatches.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    localMatches = localMatches.sort((a, b) => a.distance - b.distance);

    if (localMatches.length > 2) {
      return res.json(localMatches.slice(0, 10));
    }

    // Try OSM if local data is thin
    const osmPlaces = await fetchOSMPlaces(lat, lng, radius);
    let filteredOsm = osmPlaces;
    if (category) {
      filteredOsm = osmPlaces.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (filteredOsm.length > 0) {
      return res.json(filteredOsm.slice(0, 10));
    }

    // Final fallback
    const fallbacks = [
      { name: "City Center", category: "Landmark" },
      { name: "Historical Monument", category: "Culture" },
      { name: "Local Food Street", category: "Food" },
      { name: "Central Park", category: "Nature" },
      { name: "Famous Market", category: "Shopping" }
    ].map(f => ({
      ...f,
      name: city ? `${city} ${f.name}` : f.name,
      distance: 0
    }));

    res.json(fallbacks);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
