const path = require("path");
const fetchOSMPlaces = require("../services/osmPlaces");
const analyzeAndRefinePlan = require("../services/aiPlanner");
const { generateReviews } = require("../services/reviewService");

/* ── Load curated dataset ── */
let localPlaces = [];
let bulkPlaces  = [];
let allPlacesPool = [];
let lastOSMFetch = 0;
const OSM_CACHE_TIME = 1000 * 60 * 60; // 1 hour

// EMERGENCY BACKUP: If everything else fails, use these.
const EMERGENCY_POOL = [
  { name: "Cubbon Park", lat: 12.9763, lng: 77.5929, category: "Nature", budget: "low", avgCost: 50, timeHours: 2, tags: ["nature", "park", "heritage"] },
  { name: "Lalbagh Botanical Garden", lat: 12.9507, lng: 77.5848, category: "Nature", budget: "low", avgCost: 60, timeHours: 2, tags: ["nature", "park", "heritage"] },
  { name: "ISKCON Temple", lat: 13.0098, lng: 77.5511, category: "Culture", budget: "low", avgCost: 0, timeHours: 2, tags: ["culture", "spiritual", "heritage"] },
  { name: "Bangalore Palace", lat: 12.9987, lng: 77.5921, category: "Culture", budget: "medium", avgCost: 480, timeHours: 2, tags: ["culture", "heritage"] },
  { name: "Bannerghatta Biological Park", lat: 12.8006, lng: 77.5770, category: "Nature", budget: "medium", avgCost: 300, timeHours: 4, tags: ["nature", "wildlife"] },
  { name: "Tipu Sultan's Summer Palace", lat: 12.9593, lng: 77.5738, category: "Culture", budget: "low", avgCost: 50, timeHours: 1, tags: ["culture", "heritage"] },
  { name: "Vidhana Soudha (Outer View)", lat: 12.9796, lng: 77.5907, category: "Culture", budget: "low", avgCost: 0, timeHours: 1, tags: ["culture", "landmark", "heritage"] },
  { name: "Commercial Street Shopping", lat: 12.9822, lng: 77.6083, category: "Food", budget: "medium", avgCost: 500, timeHours: 3, tags: ["shopping", "food"] },
  { name: "Visvesvaraya Museum", lat: 12.9751, lng: 77.5961, category: "Culture", budget: "low", avgCost: 100, timeHours: 3, tags: ["culture", "science", "heritage"] },
  { name: "Nandi Hills Sunrise", lat: 13.3702, lng: 77.6835, category: "Nature", budget: "medium", avgCost: 200, timeHours: 4, tags: ["nature", "adventure"] }
];

/* ── Dynamic Price Generator ── */
function calculateDynamicPrice(place, userBudget) {
  const category = (place.category || "").toLowerCase();
  
  // If it's curated data and has a REAL price (not just default 100), use it
  if (place.source === "curated" && place.avgCost > 0 && place.avgCost !== 100) {
    return place.avgCost;
  }

  // Base prices by category
  let basePrice = 150;
  if (category.includes("hotel") || category.includes("resort") || category.includes("stay")) basePrice = 3000;
  else if (category.includes("luxury") || category.includes("fine dining")) basePrice = 2500;
  else if (category.includes("brewery") || category.includes("pub") || category.includes("nightlife")) basePrice = 1200;
  else if (category.includes("restaurant") || category.includes("cafe") || category.includes("food")) basePrice = 450;
  else if (category.includes("mall") || category.includes("shopping") || category.includes("market")) basePrice = 600;
  else if (category.includes("museum") || category.includes("palace") || category.includes("fort") || category.includes("heritage")) basePrice = 250;
  else if (category.includes("park") || category.includes("nature") || category.includes("lake") || category.includes("garden")) basePrice = 80;
  else if (category.includes("temple") || category.includes("church") || category.includes("mosque") || category.includes("spiritual")) basePrice = 0;
  else if (category.includes("trek") || category.includes("hill") || category.includes("adventure")) basePrice = 300;

  // Scale based on user budget
  const multipliers = { low: 0.5, medium: 1.0, high: 2.2 };
  const multiplier = multipliers[userBudget] || 1.0;
  
  // High variance randomness (+/- 40%) to ensure unique prices
  const randomFactor = 0.6 + Math.random() * 0.8;
  
  let finalPrice = Math.round(basePrice * multiplier * randomFactor);
  
  // Special case for free places
  if (basePrice === 0) return 0;
  
  // Round to nearest 10 for "realistic" pricing
  finalPrice = Math.ceil(finalPrice / 10) * 10;
  
  return Math.max(30, finalPrice);
}

function loadData() {
  try {
    const curated = require(path.join(__dirname, "../data/bengaluruPlaces.json"));
    localPlaces = curated.flat().filter(p => p && typeof p === "object" && p.name).map(p => ({
      name:         p.name,
      lat:          Number(p.lat) || 12.9716,
      lng:          Number(p.lng) || 77.5946,
      category:     p.category || "Sightseeing",
      tags:         (p.tags || []).map(t => t.toLowerCase()),
      budget:       p.budget   || "low",
      timeHours:    p.timeHours || 2,
      avgCost:      p.avgCost, // Keep raw, will handle in calculateDynamicPrice
      area:         p.area     || "Bangalore",
      source:       "curated"
    }));
    
    const bulk = require(path.join(__dirname, "../data/bangalorePlaces.json"));
    bulkPlaces = bulk.filter(p => p && p.name).map(p => ({
      name:         p.name,
      lat:          Number(p.lat) || 12.9716,
      lng:          Number(p.lng) || 77.5946,
      category:     p.category || "Place",
      tags:         (p.tags || []).map(t => t.toLowerCase()),
      budget:       p.budget   || "medium",
      timeHours:    p.timeHours || 2,
      avgCost:      null,
      area:         p.area     || "Bangalore",
      source:       "bulk"
    }));
    
    const existingNames = new Set(localPlaces.map(p => p.name.toLowerCase()));
    // Combine but KEEP localPlaces at the beginning to prioritize them
    allPlacesPool = [...localPlaces, ...bulkPlaces.filter(p => !existingNames.has(p.name.toLowerCase()))];

    if (allPlacesPool.length === 0) {
        console.warn("⚠️ Main pools empty, loading emergency pool");
        allPlacesPool = [...EMERGENCY_POOL];
    }

    console.log(`✅ Planner initialized with ${allPlacesPool.length} total places`);
  } catch (e) {
    console.error("⚠️ Data loading issue:", e.message);
    allPlacesPool = [...EMERGENCY_POOL];
  }
}

loadData();

const PLACES_PER_DAY    = 3;
const MEAL_COST         = { low: 200, medium: 500, high: 1500 };
const DAY_COLORS        = ["#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#f97316","#ec4899","#84cc16","#14b8a6"];

const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

/* ── Filter logic ── */
function getPool(allPlaces, budget, interests) {
  const interestSet = new Set((interests || []).map(i => i.toLowerCase()));
  
  // 1. Get curated places matching budget/interests first
  let curated = allPlaces.filter(p => p.source === "curated");
  let bulk    = allPlaces.filter(p => p.source !== "curated");

  // Filter both by budget if possible
  let curatedMatch = curated.filter(p => p.budget === budget);
  let bulkMatch    = bulk.filter(p => p.budget === budget);

  // 2. Mix them, ensuring curated are front-loaded
  return [...shuffle(curatedMatch), ...shuffle(curated), ...shuffle(bulkMatch), ...shuffle(bulk)];
}

async function updateOSM() {
  if (Date.now() - lastOSMFetch < OSM_CACHE_TIME) return;
  
  try {
    const osmPlaces = await fetchOSMPlaces();
    if (osmPlaces && osmPlaces.length > 0) {
      const osmMapped = osmPlaces.map(p => ({
        name:      p.name,
        lat:       p.lat,
        lng:       p.lng,
        category:  p.category || "Other",
        tags:      [],
        budget:    "low",
        timeHours: 1.5,
        avgCost:   null,
        area:      "Central",
        source:    "osm",
      }));

      const existingNames = new Set(allPlacesPool.map(p => p.name.toLowerCase()));
      const newPlaces = osmMapped.filter(p => !existingNames.has(p.name.toLowerCase()));
      allPlacesPool = [...allPlacesPool, ...newPlaces];
      lastOSMFetch = Date.now();
    }
  } catch (e) {}
}

async function generatePlan({ days = 2, budget = "low", interests = [], travelerType = "solo", pace = "moderate" }) {
  days = Math.min(Math.max(parseInt(days) || 2, 1), 30);
  
  if (allPlacesPool.length < 10) {
      loadData();
  }

  const finalPool = getPool(allPlacesPool, budget, interests);
  console.log(`🎯 Generated pool of ${finalPool.length} places for ${days} days (${travelerType}, ${pace} pace)`);

  // Pace adjustments
  let placesPerDay = 3;
  if (pace === "relaxed") placesPerDay = 2;
  if (pace === "fast")    placesPerDay = 5;

  // AI Refinement - Pick top 40 candidates to stay within context limits
  let aiItineraryMap = null;
  try {
    const candidates = finalPool.slice(0, 40);
    aiItineraryMap = await analyzeAndRefinePlan({
      days, budget, interests, travelerType, pace, candidates
    });
  } catch (err) {
    console.error("AI Refinement failed, falling back to heuristics");
  }

  const itinerary  = {};
  const usedNames  = new Set();
  let   totalCost  = 0;
  let   poolIndex  = 0;

  // Traveler multipliers
  const travelerMultipliers = { solo: 1, couple: 2, family: 3.5, friends: 4 };
  const tMult = travelerMultipliers[travelerType] || 1;

  for (let d = 1; d <= days; d++) {
    const dayKey    = `Day ${d}`;
    const dayPlaces = [];
    let   dayCost   = 0;
    let   dayHours  = 0;

    // 1. Try to use AI suggestions first
    const suggestedNames = aiItineraryMap ? (aiItineraryMap[d] || aiItineraryMap[String(d)] || []) : [];
    
    suggestedNames.forEach(name => {
      const place = allPlacesPool.find(p => p.name === name);
      if (place && !usedNames.has(place.name)) {
        let placeCost = calculateDynamicPrice(place, budget) * tMult;
        dayPlaces.push({
          name:          place.name,
          estimatedCost: placeCost,
          avgCost:       placeCost,
          timeHours:     Number(place.timeHours) || 2,
          lat:           Number(place.lat) || 12.9716,
          lng:           Number(place.lng) || 77.5946,
          category:      place.category,
          tags:          place.tags || [],
          source:        place.source
        });
        dayCost  += placeCost;
        dayHours += (Number(place.timeHours) || 2);
        usedNames.add(place.name);
      }
    });

    // 2. Fill remaining slots with heuristics
    while (dayPlaces.length < placesPerDay && poolIndex < finalPool.length) {
      const place = finalPool[poolIndex++];
      if (usedNames.has(place.name)) continue;

      let placeCost = calculateDynamicPrice(place, budget) * tMult;

      dayPlaces.push({
        name:          place.name,
        estimatedCost: placeCost,
        avgCost:       placeCost,
        timeHours:     Number(place.timeHours) || 2,
        lat:           Number(place.lat) || 12.9716,
        lng:           Number(place.lng) || 77.5946,
        category:      place.category,
        tags:          place.tags || [],
        source:        place.source
      });

      dayCost  += placeCost;
      dayHours += (Number(place.timeHours) || 2);
      usedNames.add(place.name);
    }

    // Safety: If Day is still empty, grab from emergency pool
    if (dayPlaces.length === 0) {
        const fallback = EMERGENCY_POOL[d % EMERGENCY_POOL.length];
        let fallbackCost = calculateDynamicPrice(fallback, budget) * tMult;
        
        dayPlaces.push({
            name: fallback.name,
            estimatedCost: fallbackCost,
            avgCost: fallbackCost,
            timeHours: fallback.timeHours,
            lat: fallback.lat,
            lng: fallback.lng,
            category: fallback.category,
            tags: fallback.tags,
            source: "emergency"
        });
        dayCost += fallbackCost;
    }

    // 3. Generate reviews for each place in the day
    await Promise.all(dayPlaces.map(async (p) => {
      p.reviews = await generateReviews(p.name, p.category);
    }));

    // Meal cost adjusted for traveler count and budget
    const mealCost     = (MEAL_COST[budget] || 500) * tMult;
    const totalDayCost = dayCost + mealCost;
    totalCost         += totalDayCost;

    itinerary[dayKey] = {
      places:         dayPlaces,
      estimatedCost:  totalDayCost,
      estimatedHours: Math.round(dayHours * 10) / 10,
      dayMealCost:    mealCost,
      color:          DAY_COLORS[(d - 1) % DAY_COLORS.length],
    };
  }

  return {
    city:          "Bengaluru",
    days,
    budget,
    interests,
    travelerType,
    pace,
    itinerary,
    totalTripCost: totalCost,
    generatedAt:   new Date().toISOString(),
  };
}

module.exports = generatePlan;