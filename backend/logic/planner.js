const path         = require("path");
const fetchOSMPlaces = require("../services/osmPlaces");

/* ── Load curated dataset ── */
let localPlaces = [];
try {
  localPlaces = require(path.join(__dirname, "../data/places.json"));
  console.log(`✅ Loaded ${localPlaces.length} places from places.json`);
} catch (e) {
  console.warn("⚠️  places.json not found, will rely on OSM only");
}

const MAX_HOURS_PER_DAY = 7;
const PLACES_PER_DAY    = 3;
const MEAL_COST         = { low: 200, medium: 500, high: 1000 };
const DAY_COLORS        = ["#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#f97316","#ec4899","#84cc16","#14b8a6"];

const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

/* ── Filter by budget + interests ── */
function filterPlaces(places, budget, interests) {

  const interestSet = new Set((interests || []).map(i => i.toLowerCase()));

  // Step 1: match budget
  let pool = places.filter(p =>
    !p.budget || p.budget === budget || p.area === "OutSkirts" === false
  );

  // Step 2: if interests given, boost matching places to front
  if (interestSet.size > 0) {
    const matched   = pool.filter(p =>
      interestSet.has((p.category || "").toLowerCase()) ||
      (p.tags || []).some(t => interestSet.has(t.toLowerCase()))
    );
    const unmatched = pool.filter(p => !matched.includes(p));
    pool = [...shuffle(matched), ...shuffle(unmatched)];
  } else {
    pool = shuffle(pool);
  }

  return pool;
}

/* ── Main generate function ── */
async function generatePlan({ days = 2, budget = "low", interests = [] }) {

  days = Math.min(Math.max(parseInt(days) || 2, 1), 10);

  /* 1 — Start with local curated places */
  let allPlaces = localPlaces.map(p => ({
    name:         p.name,
    lat:          p.lat,
    lng:          p.lng,
    category:     p.category || "Other",
    tags:         p.tags     || [],
    budget:       p.budget   || "low",
    timeHours:    p.timeHours || 2,
    avgCost:      p.avgCost  || 100,
    area:         p.area     || "Central",
    source:       "local",
  }));

  /* 2 — Optionally supplement with OSM (non-blocking) */
  try {
    const osmPlaces = await fetchOSMPlaces();
    const osmMapped = osmPlaces.map(p => ({
      name:      p.name,
      lat:       p.lat,
      lng:       p.lng,
      category:  p.category || "Other",
      tags:      [],
      budget:    budget,
      timeHours: 1.5,
      avgCost:   100,
      area:      "Central",
      source:    "osm",
    }));

    // Only add OSM places not already in local dataset
    const localNames = new Set(allPlaces.map(p => p.name.toLowerCase()));
    const newOSM     = osmMapped.filter(p => !localNames.has(p.name.toLowerCase()));
    allPlaces        = [...allPlaces, ...newOSM];

  } catch (e) {
    console.warn("⚠️  OSM fetch skipped:", e.message);
  }

  /* 3 — Filter + sort by budget and interests */
  const pool = filterPlaces(
    allPlaces.filter(p => p.budget === budget),
    budget,
    interests
  );

  // If filtered pool too small, fall back to all places of any budget
  const finalPool = pool.length >= days * 2
    ? pool
    : filterPlaces(allPlaces, budget, interests);

  /* 4 — Build itinerary */
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
        estimatedCost: place.avgCost,
        timeHours:     place.timeHours,
        lat:           place.lat,
        lng:           place.lng,
        category:      place.category,
        tags:          place.tags,
      });

      dayCost  += place.avgCost;
      dayHours += place.timeHours;
      usedNames.add(place.name);
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