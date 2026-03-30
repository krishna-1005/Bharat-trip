function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getBestVisitTime(category, index) {
  const cat = (category || "").toLowerCase();
  
  // Rule-based logic with variations
  if (["nature", "park", "garden", "hill", "lake", "waterfall", "beach"].some(kw => cat.includes(kw))) {
    const isEven = index % 2 === 0;
    return {
      time: isEven ? "Morning" : "Evening",
      reason: isEven ? "Pleasant weather and soft sunlight for photos" : "Golden hour views and cool breeze"
    };
  }

  if (["temple", "church", "mosque", "spiritual", "monument", "museum", "history", "cultural"].some(kw => cat.includes(kw))) {
    const isEven = index % 2 === 0;
    return {
      time: "Morning",
      reason: isEven ? "Peaceful atmosphere and fewer crowds" : "Beat the midday heat and enjoy the tranquility"
    };
  }

  if (["cafe", "restaurant", "dining", "food", "bakery"].some(kw => cat.includes(kw))) {
    const isEven = index % 2 === 0;
    return {
      time: isEven ? "Afternoon" : "Evening",
      reason: isEven ? "Perfect time for a relaxed lunch break" : "Enjoy the vibrant dinner ambiance"
    };
  }

  if (["shopping", "market", "mall", "street"].some(kw => cat.includes(kw))) {
    return {
      time: "Evening",
      reason: "Most active hours with a lively local atmosphere"
    };
  }

  if (["nightlife", "pub", "bar", "club", "lounge"].some(kw => cat.includes(kw))) {
    return {
      time: "Night",
      reason: "Peak experience time with music and energy"
    };
  }

  // Default fallback
  const times = ["Morning", "Afternoon", "Evening"];
  const selectedTime = times[index % 3];
  const reasons = [
    "Ideal for exploring without the midday rush",
    "Great time to experience the local vibe",
    "Cooler temperatures and beautiful light"
  ];
  
  return {
    time: selectedTime,
    reason: reasons[index % 3]
  };
}

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
      places: dayPlaces.map((p, idx) => {
        const timing = getBestVisitTime(p.category, idx + i); // use idx + i for more variation
        return {
          name: p.name,
          category: p.category,
          estimatedCost: p.cost || p.estimatedCost || 0,
          timeHours: p.avgTime || 2,
          lat: p.lat,
          lng: p.lng,
          rating: p.rating,
          tag: p.tag,
          isPersonalized: p.isPersonalized,
          bestTime: timing.time,
          timeReason: timing.reason
        };
      })
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