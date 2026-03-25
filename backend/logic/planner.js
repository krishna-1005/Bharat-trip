const path = require("path");
const fetchOSMPlaces = require("../services/osmPlaces");

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
  if (place.avgCost === 0) return 0;

  const base = place.avgCost ?? 200;

  const mult = {
    low: 0.7,
    medium: 1,
    high: 2
  }[budget] || 1;

  const price = Math.round(base * mult);

  return Math.max(50, price);
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
  travelerType
}) {
  const coords = await getCityCoords(city);

  /* STEP 1: GEO FILTER */
  let cityPool = allPlacesPool.filter(p =>
    getDistance(coords.lat, coords.lng, p.lat, p.lng) <= 50
  );

  /* STEP 2: OSM fallback */
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

  /* STEP 3: INTEREST FILTER */
  const interestSet = new Set(interests.map(i => i.toLowerCase()));

  let finalPool = cityPool.filter(p =>
    interestSet.size === 0 ||
    interestSet.has(p.category.toLowerCase()) ||
    (p.tags || []).some(t => interestSet.has(t))
  );

  if (finalPool.length === 0) finalPool = cityPool;

  /* STEP 4: SCORING */
  finalPool = finalPool
    .map(p => ({
      ...p,
      score: calculateScore(p, interests, coords, budget)
    }))
    .sort((a, b) => b.score - a.score);

  /* STEP 5: DISTRIBUTION (FIXED) */
  const itinerary = {};
  const perDay = Math.ceil(finalPool.length / days);

  const tMult = { solo: 1, couple: 2, family: 3, friends: 4 }[travelerType] || 1;

  for (let day = 1; day <= days; day++) {
    const start = (day - 1) * perDay;
    const end = start + perDay;

    const selected = finalPool.slice(start, end);

    let hours = 0;
    let cost = 0;

    const validPlaces = [];

    for (let p of selected) {
      const t = p.timeHours || 2;

      if (hours + t > MAX_HOURS_PER_DAY) continue;

      hours += t;
      cost += calculateDynamicPrice(p, budget) * tMult;

      validPlaces.push(p);
    }

    const meal = (MEAL_COST[budget] || 500) * tMult;

    itinerary[`Day ${day}`] = {
      places: validPlaces,
      estimatedHours: hours,
      estimatedCost: cost + meal
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