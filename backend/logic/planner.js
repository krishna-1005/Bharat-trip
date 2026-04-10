const path = require("path");
const fetchOSMPlaces = require("../services/osmPlaces");
const { generateReviews: fetchUserReviews } = require("../services/reviewService");
const analyzeAndRefinePlan = require("../services/aiPlanner");

/* ── CONFIG ── */
const MAX_HOURS_PER_DAY = 8;
const MEAL_COST = { low: 200, medium: 500, high: 1500 };

/* ── TRUST HELPERS ── */
function generateRating(index) {
  // Range: 4.0 to 4.6 (believable)
  const base = 4.0;
  const variation = (index * 731) % 7; // pseudo-random variation
  return parseFloat((base + variation * 0.1).toFixed(1));
}

function generateReviews(index) {
  // Range: 100 to 5000 (realistic)
  return 100 + (index * 917) % 4901;
}

function generateTag(place, index) {
  const tags = ["Top Attraction", "Popular Spot", "Hidden Gem"];
  return tags[index % tags.length];
}

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
function calculateScore(place, interests, coords, budgetTier, userPreferences = {}, perDayBudget = 2000) {
  let score = 0;
  const interestSet = new Set(interests.map(i => i.toLowerCase()));
  
  const {
    interests: userInterests = [],
    avoidedCategories = [],
    categoryWeights = {}
  } = userPreferences;

  const category = (place.category || "").toLowerCase();

  // Boost for CURRENT trip interests
  if (interestSet.has(category)) score += 5;
  if ((place.tags || []).some(tag => interestSet.has(tag.toLowerCase()))) score += 3;

  // Boost for USER general interests (Personalization)
  if (userInterests.some(i => i.toLowerCase() === category)) score += 2;

  // Learned weights
  const weight = categoryWeights instanceof Map ? (categoryWeights.get(place.category) || 0) : (categoryWeights[place.category] || 0);
  score += weight;

  // Penalty for avoided categories
  if (avoidedCategories.some(i => i.toLowerCase() === category)) score -= 10;

  const cost = place.avgCost || 200;
  
  // Budget alignment (Aggressive penalties for over-budget places)
  if (cost > perDayBudget * 0.6) score -= 25; 
  else if (cost > perDayBudget * 0.4) score -= 10;
  else if (cost < perDayBudget * 0.1) score += 8; 
  
  if (budgetTier === "low" && cost < 200) score += 5;
  if (budgetTier === "medium" && cost < 500) score += 3;

  const dist = getDistance(coords.lat, coords.lng, place.lat, place.lng);
  if (dist < 5) score += 3;
  else if (dist < 15) score += 2;

  return score;
}

/* ── PRICE ── */
function calculateDynamicPrice(place, budgetTier) {
  let base = place.avgCost;

  if (base == null || base === 0) {
    base = 200; // fallback realistic price
  }

  const mult = {
    low: 0.7,
    medium: 1,
    high: 2
  }[budgetTier] || 1;

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

/* ── SUMMARY GENERATOR ── */
function generatePlanSummary({ city, days, totalBudget, totalTripCost, interests }) {
  const interestList = interests.length > 0 ? interests.join(", ").toLowerCase() : "general exploration";
  const budgetStatus = totalTripCost <= totalBudget ? "comfortably within" : "optimized for";
  const efficiencyNote = "Locations are grouped by proximity to minimize transit time, ensuring a balanced pace each day.";

  const templates = [
    `This ${days}-day odyssey in ${city} is curated to blend ${interestList} experiences, staying ${budgetStatus} your budget. ${efficiencyNote}`,
    `Your ${days}-day ${city} escape is perfectly paced for ${interestList}. We've grouped nearby spots to maximize your time while staying ${budgetStatus} your financial plan.`,
    `Designed for ${interestList}, this ${days}-day ${city} itinerary ensures a seamless flow. It stays ${budgetStatus} your budget goal with a focus on travel efficiency.`
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}

/* ── OSM CACHE ── */
const osmCache = new Map();

/* ── DE-DUPLICATION UTILITY ── */
function mergePools(curated, dynamic) {
  const merged = [];
  const seenNames = new Set();

  const combined = [...curated, ...dynamic];

  for (const p of combined) {
    const cleanName = p.name.toLowerCase().trim();
    if (!seenNames.has(cleanName)) {
      merged.push(p);
      seenNames.add(cleanName);
    }
  }
  return merged;
}

/* ── DATA ENRICHMENT ── */
function enrichPlace(p, index) {
  return {
    ...p,
    rating: p.rating || generateRating(index),
    reviews: p.reviews || generateReviews(index),
    tag: p.tag || generateTag(p, index),
    avgCost: p.avgCost || 200,
    timeHours: p.timeHours || 2
  };
}

/* ── FALLBACK GENERATOR ── */
function generateFallbacks(city, coords, count) {
  const fallbacks = [
    { name: "Local Market", category: "Shopping", tags: ["local", "market", "authentic"], timeHours: 2, avgCost: 100 },
    { name: "City Park", category: "Nature", tags: ["park", "relaxing", "greenery"], timeHours: 1.5, avgCost: 0 },
    { name: "Food Street", category: "Food", tags: ["street food", "local flavors", "evening"], timeHours: 2, avgCost: 300 },
    { name: "Central Mall", category: "Shopping", tags: ["mall", "modern", "branded"], timeHours: 3, avgCost: 500 },
    { name: "Ancient Temple", category: "Culture", tags: ["temple", "historic", "spiritual"], timeHours: 1, avgCost: 0 },
    { name: "Art Gallery", category: "Culture", tags: ["art", "museum", "creativity"], timeHours: 2, avgCost: 200 },
    { name: "Riverside Walk", category: "Nature", tags: ["river", "scenic", "peaceful"], timeHours: 1, avgCost: 0 },
    { name: "Heritage Walk", category: "Culture", tags: ["history", "walking tour", "architecture"], timeHours: 2.5, avgCost: 0 }
  ];

  const results = [];
  for (let i = 0; i < count; i++) {
    const template = fallbacks[i % fallbacks.length];
    results.push({
      ...template,
      name: `${city} ${template.name}`,
      lat: coords.lat + (Math.random() - 0.5) * 0.05,
      lng: coords.lng + (Math.random() - 0.5) * 0.05,
      source: "fallback",
      area: city
    });
  }
  return results;
}

/* ── DETERMINISTIC PRICING RULES ── */
const COST_RULES = {
  foodPerDay: 500,
  hotelPerNight: {
    low: 1000,
    medium: 2500,
    high: 5000
  },
  transportPerKm: 10,
  activityBase: 100
};

/**
 * Deterministically calculates the total trip cost.
 */
function calculateDeterministicTripCost(itinerary, days, budgetTier, travelerType) {
  const tMult = { solo: 1, couple: 2, family: 3, friends: 4 }[travelerType] || 1;
  const nights = Math.max(1, days);
  
  // 1. Hotel Cost
  const hotelRate = COST_RULES.hotelPerNight[budgetTier] || COST_RULES.hotelPerNight.medium;
  const totalHotel = hotelRate * nights * (tMult > 2 ? 2 : 1);

  // 2. Food Cost
  const totalFood = COST_RULES.foodPerDay * days * tMult;

  // 3. Transport & Activities
  let totalTransport = 0;
  let totalActivities = 0;

  itinerary.forEach((dayData) => {
    const places = dayData.places || [];
    
    places.forEach((place) => {
      const baseActivity = place.avgCost || COST_RULES.activityBase;
      totalActivities += baseActivity * tMult;
    });

    for (let i = 0; i < places.length - 1; i++) {
      const dist = getDistance(places[i].lat, places[i].lng, places[i+1].lat, places[i+1].lng) || 5;
      totalTransport += dist * COST_RULES.transportPerKm;
    }
    totalTransport += 20 * COST_RULES.transportPerKm; // Daily base commute
  });

  return {
    total: Math.round(totalHotel + totalFood + totalTransport + totalActivities),
    breakdown: {
      hotel: Math.round(totalHotel),
      food: Math.round(totalFood),
      transport: Math.round(totalTransport),
      activities: Math.round(totalActivities)
    }
  };
}

/* ── MAIN FUNCTION ── */
async function generatePlan({
  city,
  days,
  budget,
  interests,
  travelerType,
  pace,
  userPreferences = {},
  language = "English"
}) {
  const coords = await getCityCoords(city);
  const cleanCity = city.trim().toLowerCase();
  const totalBudget = Number(budget) || 5000;
  const perDayBudget = totalBudget / days;
  const tMult = { solo: 1, couple: 2, family: 3, friends: 4 }[travelerType] || 1;
  /* STEP 1: CURATED POOL */
  let curatedPool = allPlacesPool.filter(p => {
    if (p.area && p.area.toLowerCase() === cleanCity) return true;
    const dist = getDistance(coords.lat, coords.lng, p.lat, p.lng);
    return dist <= 40; 
  });

  /* STEP 2: HYBRID FETCH (OSM) */
  let osmPool = [];
  const cacheKey = `${coords.lat.toFixed(3)},${coords.lng.toFixed(3)}`;
  
  if (osmCache.has(cacheKey)) {
    osmPool = osmCache.get(cacheKey);
  } else {
    const radius = curatedPool.length < 10 ? 15 : 10;
    osmPool = await fetchOSMPlaces(coords.lat, coords.lng, radius);
    osmCache.set(cacheKey, osmPool);
  }

  /* STEP 3: MERGE & DE-DUPLICATE */
  let cityPool = mergePools(curatedPool, osmPool);

  /* STEP 4: INTEREST FILTER */
  const interestSet = new Set(interests.map(i => i.toLowerCase()));
  let filteredPool = cityPool.filter(p =>
    interestSet.size === 0 ||
    interestSet.has(p.category.toLowerCase()) ||
    (p.tags || []).some(t => interestSet.has(t.toLowerCase()))
  );

  if (filteredPool.length === 0) filteredPool = cityPool;

  /* STEP 5: SCORING & ENRICHMENT */
  const dailyBudget = totalBudget / days;
  
  // Refined Tier Selection: 
  // < 3000 total or < 1500/day -> low
  // < 10000 total or < 4000/day -> medium
  // else -> high
  let budgetTier = "high";
  if (totalBudget <= 3500 || dailyBudget <= 1500) {
    budgetTier = "low";
  } else if (totalBudget <= 12000 || dailyBudget <= 4000) {
    budgetTier = "medium";
  }
  let prioritizedPool = filteredPool
    .map((p, idx) => {
      const enriched = enrichPlace(p, idx);
      return {
        ...enriched,
        score: calculateScore(enriched, interests, coords, budgetTier, userPreferences, perDayBudget / (tMult * 3))
      };
    })
    .sort((a, b) => b.score - a.score);

  const minRequired = days * 3;
  if (prioritizedPool.length < minRequired) {
    const needed = minRequired - prioritizedPool.length;
    const fallbacks = generateFallbacks(city, coords, needed).map((p, idx) => {
      const enriched = enrichPlace(p, prioritizedPool.length + idx);
      return {
        ...enriched,
        score: 5 
      };
    });
    prioritizedPool = [...prioritizedPool, ...fallbacks];
  }

  const maxPlacesNeeded = Math.max(minRequired, days * 6);
  
  /* BALANCED SELECTION: Ensure each interest category is represented */
  let candidates = [];
  if (interests.length > 0) {
    const poolsByInterest = interests.map(interest => {
      const iLower = interest.toLowerCase();
      return prioritizedPool.filter(p => 
        p.category.toLowerCase() === iLower || 
        (p.tags || []).some(t => t.toLowerCase() === iLower)
      );
    });

    // Interleave picks from each interest pool
    for (let i = 0; i < maxPlacesNeeded; i++) {
      for (const pool of poolsByInterest) {
        if (pool[i] && !candidates.some(c => c.name === pool[i].name)) {
          candidates.push(pool[i]);
          if (candidates.length >= maxPlacesNeeded) break;
        }
      }
      if (candidates.length >= maxPlacesNeeded) break;
    }
  }

  // Fill remaining slots with the best overall places not already picked
  if (candidates.length < maxPlacesNeeded) {
    const remaining = prioritizedPool.filter(p => !candidates.some(c => c.name === p.name));
    candidates = [...candidates, ...remaining.slice(0, maxPlacesNeeded - candidates.length)];
  }

  /* STEP 6: AI REFINEMENT */
  let aiItinerary = null;
  try {
    aiItinerary = await analyzeAndRefinePlan({
      city,
      days,
      budget: totalBudget,
      interests,
      travelerType,
      pace,
      candidates,
      userPreferences,
      language
    });
  } catch (err) {
    console.warn("AI Refinement skipped or failed:", err.message);
  }

  /* STEP 7: BUILD ITINERARY */
  const itineraryDays = [];
  const usedPlaceNames = new Set();
  
  for (let dayNum = 1; dayNum <= days; dayNum++) {
    let dayPlaces = [];
    if (aiItinerary && aiItinerary[dayNum.toString()]) {
      dayPlaces = aiItinerary[dayNum.toString()].map(aiP => {
        const original = candidates.find(c => c.name.toLowerCase() === aiP.name.toLowerCase()) || aiP;
        return { ...original, ...aiP };
      });
    } else {
      const targetCount = 3;
      const remaining = candidates.filter(p => !usedPlaceNames.has(p.name)).slice(0, targetCount);
      dayPlaces = remaining;
    }

    const enrichedPlaces = await Promise.all(dayPlaces.map(async (p) => {
      usedPlaceNames.add(p.name);
      const userReviews = await fetchUserReviews(p.name, p.category, city);
      return { 
        ...p, 
        userReviews,
        estimatedCost: p.avgCost || COST_RULES.activityBase // Deterministic per-place cost
      };
    }));

    itineraryDays.push({
      day: dayNum,
      label: `Day ${dayNum}`,
      places: enrichedPlaces
    });
  }

  /* STEP 8: FINAL DETERMINISTIC COST CALCULATION */
  const finalPricing = calculateDeterministicTripCost(itineraryDays, days, budgetTier, travelerType);

  return { 
    city, 
    days: parseInt(days),
    itinerary: itineraryDays, 
    coordinates: coords,
    totalBudget,
    totalTripCost: finalPricing.total,
    costBreakdown: finalPricing.breakdown,
    remainingBudget: Math.round(totalBudget - finalPricing.total),
    perDayBudget: Math.round(totalBudget / days),
    isPersonalized: true,
    summary: generatePlanSummary({ city, days, totalBudget, totalTripCost: finalPricing.total, interests })
  };
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

  try {
    const indiaPlaces = require("../data/indiaPlaces.json");
    const found = indiaPlaces.find(c => c.city.toLowerCase() === cleanCity);
    if (found) return found.coordinates;
  } catch (e) {}

  try {
    const res = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanCity)}&limit=1`,
      { headers: { "User-Agent": "GoTripo/1.0" } }
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

  return map["bengaluru"];
}

function generateReason(place, interests, budgetTier, index) {
  const category = (place.category || "").toLowerCase();
  const interestSet = new Set(interests.map(i => i.toLowerCase()));

  const parts = [];

  const categoryLine = {
    nature: "offers a refreshing natural experience",
    food: "is great for exploring local food",
    culture: "has strong cultural significance",
    shopping: "is perfect for shopping lovers"
  };

  if (categoryLine[category]) {
    parts.push(categoryLine[category]);
  }

  if (interestSet.has(category)) {
    parts.push("matches your interests");
  }

  const timeTag = getTimeOfDayTag(place, index);
  if (timeTag) parts.push(timeTag);

  if ((place.avgCost || 200) < 200 && budgetTier === "low") {
    parts.push("budget-friendly");
  }

  parts.push(getCrowdTag(index));

  if (index % 2 === 0) {
    parts.push(getTrendingTag(index));
  }

  return parts.join(", ") + ".";
}

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