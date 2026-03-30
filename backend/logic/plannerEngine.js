function plannerEngine(places, { city, days, interests, budget, userPreferences = {} }) {
  // 1. Initial Filtering
  let candidates = places.filter(p => p.city.toLowerCase() === city.toLowerCase());

  const {
    interests: userInterests = [],
    avoidedCategories = [],
    categoryWeights = new Map(),
  } = userPreferences;

  // 2. Personalized Scoring
  candidates = candidates.map(place => {
    let score = place.rating || 0;
    let isPersonalized = false;

    // Boost if in user's general interests
    if (userInterests.includes(place.category)) {
      score += 1.5;
      isPersonalized = true;
    }

    // Boost if in CURRENT trip interests
    if (interests.includes(place.category)) {
      score += 2.0;
    }

    // Apply learned weights
    const weight = categoryWeights instanceof Map 
      ? (categoryWeights.get(place.category) || 0)
      : (categoryWeights[place.category] || 0);
    
    if (weight !== 0) {
      score += weight;
      if (weight > 0) isPersonalized = true;
    }

    // Heavy penalty for avoided categories
    if (avoidedCategories.includes(place.category)) {
      score -= 5.0;
    }

    return { ...place, score, isPersonalized };
  });

  // 3. Filter by Budget & Minimum Score
  if (budget === "low") {
    candidates = candidates.filter(p => (p.cost || p.estimatedCost || 0) <= 500);
  } else if (budget === "medium") {
    candidates = candidates.filter(p => (p.cost || p.estimatedCost || 0) <= 1500);
  }

  // Remove heavily penalized places
  candidates = candidates.filter(p => p.score > 0);

  // 4. Sort by Score
  candidates.sort((a, b) => b.score - a.score);

  // 5. Distribute across days
  const perDay = Math.ceil(candidates.length / days);
  const itinerary = {};

  for (let i = 0; i < days; i++) {
    const dayPlaces = candidates.slice(i * perDay, (i + 1) * perDay);

    itinerary[`Day ${i + 1}`] = {
      places: dayPlaces.map(p => ({
        name: p.name,
        category: p.category,
        estimatedCost: p.cost || p.estimatedCost || 0,
        timeHours: p.avgTime || 2,
        lat: p.lat,
        lng: p.lng,
        rating: p.rating,
        tag: p.tag,
        isPersonalized: p.isPersonalized
      }))
    };
  }

  // 6. Total cost
  const totalCost = candidates.reduce((sum, p) => sum + (p.cost || p.estimatedCost || 0), 0);

  return {
    itinerary,
    totalCost,
    isPersonalized: true
  };
}

module.exports = plannerEngine;