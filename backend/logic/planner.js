const path = require("path");
const fetchOSMPlaces = require("../services/osmPlaces");
const analyzeAndRefinePlan = require("../services/aiPlanner");

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
  if (place.avgCost === 0) return 0; // free places

  const base = place.avgCost ?? 200;

  const mult = {
    low: 0.7,
    medium: 1,
    high: 2
  }[budget] || 1;

  const price = Math.round(base * mult);

  return Math.max(50, price); // minimum realistic cost
}

/* ── LOAD DATA ── */
let allPlacesPool = [];

function loadData() {
  try {
    const curated = require(path.join(__dirname, "../data/bengaluruPlaces.json"));
    const bulk = require(path.join(__dirname, "../data/bangalorePlaces.json"));

    allPlacesPool = [...curated.flat(), ...bulk].map(p => ({
      name: p.name,
      lat: Number(p.lat),
      lng: Number(p.lng),
      category: p.category || "Other",
      tags: (p.tags || []).map(t => t.toLowerCase()),
      timeHours: p.timeHours || 2,
      avgCost: p.avgCost ?? null,
      source: "dataset"
    }));
  } catch {
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
  travelerType,
  pace
}) {
  const coords = await getCityCoords(city);

  /* 🔥 STEP 1: GEO FILTER */
  let cityPool = allPlacesPool.filter(p =>
    getDistance(coords.lat, coords.lng, p.lat, p.lng) <= 50
  );

  /* 🔥 STEP 2: OSM */
  if (cityPool.length < 10) {
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
        source: "osm"
      }))
    );
  }

  /* 🔥 STEP 3: INTEREST FILTER */
  const interestSet = new Set(interests.map(i => i.toLowerCase()));

  let finalPool = cityPool.filter(p =>
    interestSet.size === 0 ||
    interestSet.has(p.category.toLowerCase()) ||
    (p.tags || []).some(t => interestSet.has(t))
  );

  if (finalPool.length === 0) finalPool = cityPool;

  /* 🔥 STEP 4: SCORING (IMPORTANT) */
  finalPool = finalPool
    .map(p => ({
      ...p,
      score: calculateScore(p, interests, coords, budget)
    }))
    .sort((a, b) => b.score - a.score);

  /* 🔥 STEP 5: AI (optional) */
  let aiMap = null;
  try {
    aiMap = await analyzeAndRefinePlan({
      city, days, budget, interests, travelerType, pace, 
      candidates: finalPool.slice(0, 15) // Limit to top candidates
    });
  } catch {}

  /* 🔥 STEP 6: DISTRIBUTION */
  const itinerary = {};
  const used = new Set();
  let poolIndex = 0;

  const tMult = { solo: 1, couple: 2, family: 3, friends: 4 }[travelerType] || 1;

  for (let d = 1; d <= days; d++) {
    let dayPlaces = [];
    let dayHours = 0;
    let dayCost = 0;

    const remainingPlaces = finalPool.length - used.size;
    const remainingDays = days - d + 1;
    const limit = Math.ceil(remainingPlaces / remainingDays);

    /* 🔥 AI suggestions */
    const suggestions = aiMap?.[d] || [];

    let aiCount = 0;
    const MAX_AI_PER_DAY = Math.ceil(limit / 2); // 🔥 only 50%

    for (let s of suggestions) {
      if (aiCount >= MAX_AI_PER_DAY) break;

      const name = typeof s === "string" ? s : s.name;
      const found = finalPool.find(p => p.name.toLowerCase() === name.toLowerCase());

      if (!found || used.has(name.toLowerCase())) continue;

        const t = found.timeHours || 2;
        if (dayHours + t > MAX_HOURS_PER_DAY) continue;

        dayPlaces.push(found);
        dayHours += t;
        dayCost += calculateDynamicPrice(found, budget) * tMult;

        used.add(name.toLowerCase());
        aiCount++; // 🔥 control AI
        if (dayPlaces.length >= Math.floor(limit / 2)) break;
      }

    /* 🔥 Fill remaining */
    const remainingSlots = Math.max(0, limit - dayPlaces.length);

    let added = 0;

    while (
      added < remainingSlots &&
      poolIndex < finalPool.length
    ) for (let p of finalPool) {
        if (added >= remainingSlots) break;

        if (used.has(p.name.toLowerCase())) continue;

        const t = p.timeHours || 2;
        if (dayHours + t > MAX_HOURS_PER_DAY) continue;

        dayPlaces.push(p);
        dayHours += t;
        dayCost += calculateDynamicPrice(p, budget) * tMult;

        used.add(p.name.toLowerCase());
        added++;
      }

    /* fallback */
    if (dayPlaces.length === 0 && finalPool.length > 0) {
      const f = finalPool[0];
      dayPlaces.push(f);
      dayHours += 2;
    }

    const meal = (MEAL_COST[budget] || 500) * tMult;

    itinerary[`Day ${d}`] = {
      places: dayPlaces,
      estimatedHours: dayHours,
      estimatedCost: dayCost + meal
    };
  }

  return { city, itinerary, coordinates: coords };
}

/* ── CITY COORDS ── */
async function getCityCoords(city) {
  const map = {
    Bengaluru: { lat: 12.9716, lng: 77.5946 },
    Mumbai: { lat: 19.076, lng: 72.8777 }
  };

  return map[city] || map["Bengaluru"];
}

module.exports = generatePlan;