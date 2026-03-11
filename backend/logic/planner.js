const path = require("path");
const fetchOSMPlaces = require("../services/osmPlaces");

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

function loadData() {
  try {
    const curated = require(path.join(__dirname, "../data/bengaluruPlaces.json"));
    localPlaces = curated.flat().filter(p => p && typeof p === "object" && p.name).map(p => ({
      name:         p.name,
      lat:          p.lat,
      lng:          p.lng,
      category:     p.category || "Other",
      tags:         (p.tags || []).map(t => t.toLowerCase()),
      budget:       p.budget   || "low",
      timeHours:    p.timeHours || 2,
      avgCost:      p.avgCost  || 100,
      area:         p.area     || "Central",
      source:       "curated"
    }));
    
    const bulk = require(path.join(__dirname, "../data/bangalorePlaces.json"));
    bulkPlaces = bulk.filter(p => p && p.name).map(p => ({
      name:         p.name,
      lat:          p.lat,
      lng:          p.lng,
      category:     p.category || "Other",
      tags:         (p.tags || []).map(t => t.toLowerCase()),
      budget:       p.budget   || "medium",
      timeHours:    p.timeHours || 2,
      avgCost:      p.avgCost  || 500,
      area:         p.area     || "Bangalore",
      source:       "bulk"
    }));
    
    const existingNames = new Set(localPlaces.map(p => p.name.toLowerCase()));
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
const MEAL_COST         = { low: 200, medium: 500, high: 1000 };
const DAY_COLORS        = ["#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#f97316","#ec4899","#84cc16","#14b8a6"];

const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

/* ── Filter logic ── */
function getPool(allPlaces, budget, interests) {
  const interestSet = new Set((interests || []).map(i => i.toLowerCase()));
  
  // Flexible mapping: "Heritage" -> "Culture"
  if (interestSet.has("heritage")) interestSet.add("culture");

  // 1. Filter by budget
  let pool = allPlaces.filter(p => p.budget === budget);
  
  // 2. Prioritize interests
  if (interestSet.size > 0) {
    const matched = pool.filter(p => 
      interestSet.has(p.category.toLowerCase()) || 
      (p.tags && p.tags.some(t => interestSet.has(t.toLowerCase())))
    );
    
    if (matched.length >= 5) {
      const others = pool.filter(p => !matched.includes(p));
      return [...shuffle(matched), ...shuffle(others)];
    }
  }

  // 3. Fallback: if pool is small, add other budgets
  if (pool.length < (PLACES_PER_DAY * 2)) {
    pool = [...pool, ...allPlaces.filter(p => p.budget !== budget)];
  }

  // 4. Ultimate safety check
  if (pool.length < 5) {
      return shuffle([...EMERGENCY_POOL]);
  }

  return shuffle(pool);
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
        avgCost:   100,
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

async function generatePlan({ days = 2, budget = "low", interests = [] }) {
  days = Math.min(Math.max(parseInt(days) || 2, 1), 30);
  
  if (allPlacesPool.length < 10) {
      loadData();
  }

  const finalPool = getPool(allPlacesPool, budget, interests);
  console.log(`🎯 Generated pool of ${finalPool.length} places for ${days} days`);

  const itinerary  = {};
  const usedNames  = new Set();
  let   totalCost  = 0;
  let   poolIndex  = 0;

  for (let d = 1; d <= days; d++) {
    const dayKey    = `Day ${d}`;
    const dayPlaces = [];
    let   dayCost   = 0;
    let   dayHours  = 0;

    while (dayPlaces.length < PLACES_PER_DAY && poolIndex < finalPool.length) {
      const place = finalPool[poolIndex++];
      if (usedNames.has(place.name)) continue;

      dayPlaces.push({
        name:          place.name,
        estimatedCost: Number(place.avgCost) || 0,
        timeHours:     Number(place.timeHours) || 2,
        lat:           Number(place.lat) || 12.9716,
        lng:           Number(place.lng) || 77.5946,
        category:      place.category,
        tags:          place.tags || [],
      });

      dayCost  += (Number(place.avgCost) || 0);
      dayHours += (Number(place.timeHours) || 2);
      usedNames.add(place.name);
    }

    // Safety: If Day is still empty, grab from emergency pool
    if (dayPlaces.length === 0) {
        const fallback = EMERGENCY_POOL[d % EMERGENCY_POOL.length];
        dayPlaces.push({
            name: fallback.name,
            estimatedCost: fallback.avgCost,
            timeHours: fallback.timeHours,
            lat: fallback.lat,
            lng: fallback.lng,
            category: fallback.category,
            tags: fallback.tags
        });
        dayCost += fallback.avgCost;
    }

    const mealCost     = MEAL_COST[budget] || 200;
    const totalDayCost = dayCost + mealCost;
    totalCost         += totalDayCost;

    itinerary[dayKey] = {
      places:         dayPlaces,
      estimatedCost:  totalDayCost,
      estimatedHours: Math.round(dayHours * 10) / 10,
      color:          DAY_COLORS[(d - 1) % DAY_COLORS.length],
    };
  }

  return {
    city:          "Bengaluru",
    days,
    budget,
    interests,
    itinerary,
    totalTripCost: totalCost,
    generatedAt:   new Date().toISOString(),
  };
}

module.exports = generatePlan;