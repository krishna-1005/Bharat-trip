const path = require("path");
const fetchOSMPlaces = require("../services/osmPlaces");
const { generateReviews } = require("../services/reviewService");

/* ── CONFIG ── */
const MAX_HOURS_PER_DAY = 8;
const MEAL_COST = { low: 200, medium: 500, high: 1500 };

/* ── DISTANCE FUNCTION ── */
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ── SCORING ENGINE ── */
function calculateScore(place, interests, coords, budget) {
  let score = 0;
  const interestSet = new Set(interests.map(i => i.toLowerCase()));

  if (interestSet.has((place.category || "").toLowerCase())) score += 5;

  if ((place.tags || []).some(tag => interestSet.has(tag))) score += 3;

  const cost = place.avgCost || 200;
  if (budget === "low" && cost < 200) score += 3;
  if (budget === "medium" && cost < 500) score += 2;

  const dist = getDistance(coords.lat, coords.lng, place.lat, place.lng);
  if (dist < 5) score += 3;
  else if (dist < 15) score += 2;

  const time = place.timeHours || 2;
  if (time <= 2) score += 2;

  return score;
}

/* ── PRICE ── */
function calculateDynamicPrice(place, budget) {
  let base = place.avgCost;

  if (base == null || base === 0) {
    base = 200; // fallback realistic price
  }

  const mult = {
    low: 0.7,
    medium: 1,
    high: 2
  }[budget] || 1;

  return Math.round(base * mult);
}

/* ── LOAD DATA ── */
let allPlacesPool = [];

function loadData() {
  try {
    const curated = require(path.join(__dirname, "../data/bengaluruPlaces.json"));
    const bulk = require(path.join(__dirname, "../data/bangalorePlaces.json"));
    const indiaPlaces = require(path.join(__dirname, "../data/indiaPlaces.json"));

    const flatIndia = indiaPlaces.flatMap(cityData => 
      cityData.places.map(p => ({ ...p, area: cityData.city }))
    );

    allPlacesPool = [...curated.flat(), ...bulk, ...flatIndia].map(p => ({
      name: p.name,
      lat: Number(p.lat),
      lng: Number(p.lng),
      category: p.category || "Other",
      tags: (p.tags || []).map(t => t.toLowerCase()),
      timeHours: p.timeHours || 2,
      avgCost: p.avgCost ?? null,
      source: "dataset",
      area: p.area
    }));
  } catch (err) {
    console.error("Error loading data:", err);
    allPlacesPool = [];
  }
}

loadData();

/* ── MAIN FUNCTION ── */
async function generatePlan({
  city,
  days,
  budget,
  interests,
  travelerType
}) {
  const coords = await getCityCoords(city);
  const cleanCity = city.trim().toLowerCase();

  /* STEP 1: GEO FILTER (STRICT) */
  let cityPool = allPlacesPool.filter(p => {
    // 1. Check for explicit area match (e.g., area: "Agra")
    if (p.area && p.area.toLowerCase() === cleanCity) return true;
    
    // 2. Or check for distance within a strict 50km radius
    const dist = getDistance(coords.lat, coords.lng, p.lat, p.lng);
    return dist <= 50;
  });

  /* STEP 2: OSM fallback if pool is too small for this city */
  if (cityPool.length < 8) {
    const osm = await fetchOSMPlaces(coords.lat, coords.lng);

    cityPool.push(
      ...osm.map(p => ({
        name: p.name,
        lat: Number(p.lat),
        lng: Number(p.lng),
        category: p.category || "Other",
        tags: [],
        timeHours: 1.5,
        avgCost: 100,
        source: "osm",
        area: city // Mark these as belonging to the requested city
      }))
    );
  }

  /* STEP 3: INTEREST FILTER */
  const interestSet = new Set(interests.map(i => i.toLowerCase()));

  // Filter the city-specific pool by interests
  let filteredPool = cityPool.filter(p =>
    interestSet.size === 0 ||
    interestSet.has(p.category.toLowerCase()) ||
    (p.tags || []).some(t => interestSet.has(t))
  );

  // If no interest match, use the whole city pool instead of the global pool
  if (filteredPool.length === 0) filteredPool = cityPool;

  /* STEP 4: SCORING & TRUNCATING */
  let prioritizedPool = filteredPool
    .map(p => ({
      ...p,
      score: calculateScore(p, interests, coords, budget)
    }))
    .sort((a, b) => b.score - a.score);

  // Take a reasonable number of top places (e.g., 4-5 per day max)
  const maxPlacesNeeded = days * 5;
  prioritizedPool = prioritizedPool.slice(0, maxPlacesNeeded);

  /* STEP 5: BALANCED DISTRIBUTION */
  const itinerary = {};
  const tMult = { solo: 1, couple: 2, family: 3, friends: 4 }[travelerType] || 1;

  // Track used places to avoid duplicates
  const usedPlaceNames = new Set();
  
  for (let day = 1; day <= days; day++) {
    let hours = 0;
    let cost = 0;
    const validPlaces = [];

    // Calculate how many places we should target for this day to keep it even
    // Remaining places / remaining days
    const remainingDays = (days - day) + 1;
    const remainingPool = prioritizedPool.filter(p => !usedPlaceNames.has(p.name));
    const targetCount = Math.ceil(remainingPool.length / remainingDays);

    let count = 0;
    for (const p of remainingPool) {
      if (count >= targetCount) break;
      
      const t = p.timeHours || 2;
      if (hours + t <= MAX_HOURS_PER_DAY) {
        hours += t;
        const placeCost = calculateDynamicPrice(p, budget) * tMult;
        cost += placeCost;

        validPlaces.push({
          ...p,
          estimatedCost: placeCost,
          reason: generateReason(p, interests, budget, count)
        });
        
        usedPlaceNames.add(p.name);
        count++;
      }
    }

    const meal = (MEAL_COST[budget] || 500) * tMult;

    // Enriched data with reviews
    const enrichedPlaces = await Promise.all(validPlaces.map(async (p) => {
      const reviews = await generateReviews(p.name, p.category, city);
      return { ...p, reviews };
    }));

    itinerary[`Day ${day}`] = {
      places: enrichedPlaces,
      estimatedHours: hours,
      estimatedCost: cost + meal
    };
  }

  return { city, itinerary, coordinates: coords };
}

const axios = require("axios");

/* ── CITY COORDS ── */
async function getCityCoords(city) {
  const map = {
    "bengaluru": { lat: 12.9716, lng: 77.5946 },
    "bangalore": { lat: 12.9716, lng: 77.5946 },
    "mumbai": { lat: 19.076, lng: 72.8777 },
    "agra": { lat: 27.1767, lng: 78.0081 },
    "delhi": { lat: 28.6139, lng: 77.2090 },
    "new delhi": { lat: 28.6139, lng: 77.2090 }
  };

  const cleanCity = city.trim().toLowerCase();
  if (map[cleanCity]) return map[cleanCity];

  // Try curated dataset first (case-insensitive)
  try {
    const indiaPlaces = require("../data/indiaPlaces.json");
    const found = indiaPlaces.find(c => c.city.toLowerCase() === cleanCity);
    if (found) return found.coordinates;
  } catch (e) {}

  // External Geocoder Fallback (Nominatim)
  try {
    const res = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanCity)}&limit=1`,
      { headers: { "User-Agent": "BharatTrip/1.0" } }
    );
    if (res.data && res.data.length > 0) {
      return {
        lat: Number(res.data[0].lat),
        lng: Number(res.data[0].lon)
      };
    }
  } catch (err) {
    console.error("Geocoding failed for:", cleanCity, err.message);
  }

  // Final fallback to Bengaluru
  return map["bengaluru"];
}

function generateReason(place, interests, budget, index) {
  const category = (place.category || "").toLowerCase();
  const interestSet = new Set(interests.map(i => i.toLowerCase()));

  const parts = [];

  // 🎯 Category personality (VERY IMPORTANT)
  const categoryLine = {
    nature: "offers a refreshing natural experience",
    food: "is great for exploring local food",
    culture: "has strong cultural significance",
    shopping: "is perfect for shopping lovers"
  };

  if (categoryLine[category]) {
    parts.push(categoryLine[category]);
  }

  // 🎯 Interest match
  if (interestSet.has(category)) {
    parts.push("matches your interests");
  }

  // 🎯 Time-based
  const timeTag = getTimeOfDayTag(place, index);
  if (timeTag) parts.push(timeTag);

  // 🎯 Budget
  if ((place.avgCost || 200) < 200 && budget === "low") {
    parts.push("budget-friendly");
  }

  // 🎯 Crowd
  parts.push(getCrowdTag(index));

  // 🎯 Trending (not always)
  if (index % 2 === 0) {
    parts.push(getTrendingTag(index));
  }

  return parts.join(", ") + ".";
}

// scsewfwefw
function getTimeOfDayTag(place, index) {
  const morning = ["park", "nature"];
  const evening = ["food", "shopping"];
  const flexible = ["culture"];

  const category = (place.category || "").toLowerCase();

  if (morning.includes(category)) {
    return index % 2 === 0 ? "best visited in the morning" : "perfect for early hours";
  }

  if (evening.includes(category)) {
    return index % 2 === 0 ? "ideal for evening time" : "great for sunset or night vibe";
  }

  if (flexible.includes(category)) {
    return "can be explored anytime during the day";
  }

  return null;
}

function getCrowdTag(index) {
  const crowdTypes = [
    "usually less crowded",
    "popular among travelers",
    "a well-known busy spot",
    "relatively शांत and peaceful"
  ];

  return crowdTypes[index % crowdTypes.length];
}

function getTrendingTag(index) {
  const trending = [
    "currently trending among tourists",
    "a must-visit spot right now",
    "one of the top-rated places recently",
    "frequently recommended by travelers"
  ];

  return trending[index % trending.length];
}

module.exports = generatePlan;