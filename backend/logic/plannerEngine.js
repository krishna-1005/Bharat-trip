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

function getConstraints(category) {
  const cat = (category || "").toLowerCase();
  if (["nature", "park", "garden", "lake", "beach"].some(kw => cat.includes(kw))) {
    return { open: 6, close: 19, duration: 1.5 };
  }
  if (["temple", "church", "mosque", "spiritual"].some(kw => cat.includes(kw))) {
    return { open: 7, close: 20, duration: 1.0 };
  }
  if (["museum", "history", "monument", "fort"].some(kw => cat.includes(kw))) {
    return { open: 10, close: 18, duration: 2.5 };
  }
  if (["shopping", "market", "mall"].some(kw => cat.includes(kw))) {
    return { open: 11, close: 21, duration: 2.0 };
  }
  if (["cafe", "restaurant", "food"].some(kw => cat.includes(kw))) {
    return { open: 9, close: 23, duration: 1.0 };
  }
  if (["nightlife", "pub", "bar"].some(kw => cat.includes(kw))) {
    return { open: 18, close: 1, duration: 3.0 };
  }
  return { open: 9, close: 21, duration: 2.0 };
}

function formatTime(decimalHours) {
  let hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  let displayHours = hours % 12;
  displayHours = displayHours ? displayHours : 12;
  return `${displayHours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
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
    if (userInterests.includes(place.category)) { score += 1.5; isPersonalized = true; }
    if (interests.includes(place.category)) { score += 2.0; }
    const weight = categoryWeights instanceof Map ? (categoryWeights.get(place.category) || 0) : (categoryWeights[place.category] || 0);
    if (weight !== 0) { score += weight; if (weight > 0) isPersonalized = true; }
    if (avoidedCategories.includes(place.category)) { score -= 5.0; }
    return { ...place, score, isPersonalized };
  });

  if (budget === "low") { candidates = candidates.filter(p => (p.cost || p.estimatedCost || 0) <= 500); }
  else if (budget === "medium") { candidates = candidates.filter(p => (p.cost || p.estimatedCost || 0) <= 1500); }
  candidates = candidates.filter(p => p.score > 0);
  candidates.sort((a, b) => b.score - a.score);

  // 3. Realistic Scheduling
  const itinerary = {};
  const totalDaysRequested = parseInt(days);
  const placesPerDay = Math.ceil(candidates.length / totalDaysRequested);

  for (let d = 0; d < totalDaysRequested; d++) {
    let currentTime = 9.0; // Day starts at 9:00 AM
    const dayPlaces = candidates.slice(d * placesPerDay, (d + 1) * placesPerDay);
    const scheduledStops = [];
    let lunchDone = false;

    // Nearest neighbor reordering for the day
    let currentPool = [...dayPlaces];
    let lastLat = currentPool[0]?.lat;
    let lastLng = currentPool[0]?.lng;

    while (currentPool.length > 0 && currentTime < 21.0) {
      // Find nearest
      let nearestIdx = 0;
      let minDist = Infinity;
      currentPool.forEach((p, idx) => {
        const dist = getDistance(lastLat, lastLng, p.lat, p.lng);
        if (dist < minDist) { minDist = dist; nearestIdx = idx; }
      });

      const place = currentPool.splice(nearestIdx, 1)[0];
      const constraints = getConstraints(place.category);
      const travelTime = scheduledStops.length > 0 ? (minDist / 30) : 0; // 30 km/h average city speed
      
      currentTime += travelTime;

      // Lunch Break Logic (Mandatory around 1 PM)
      if (!lunchDone && currentTime >= 13.0) {
        scheduledStops.push({
          name: "Lunch Break",
          category: "Food",
          isBreak: true,
          startTime: formatTime(currentTime),
          endTime: formatTime(currentTime + 1.0),
          bestTime: "Afternoon",
          timeReason: "Refuel for the rest of the day"
        });
        currentTime += 1.0;
        lunchDone = true;
      }

      // Check Opening Hours
      if (currentTime < constraints.open) currentTime = constraints.open;
      
      const startTime = currentTime;
      const duration = place.avgTime || constraints.duration;
      const endTime = startTime + duration;

      if (endTime <= constraints.close || scheduledStops.length === 0) {
        const timing = getBestVisitTime(place.category, scheduledStops.length + d);
        scheduledStops.push({
          name: place.name,
          category: place.category,
          estimatedCost: place.cost || place.estimatedCost || 0,
          lat: place.lat,
          lng: place.lng,
          rating: place.rating,
          tag: place.tag,
          startTime: formatTime(startTime),
          endTime: formatTime(endTime),
          bestTime: timing.time,
          timeReason: timing.reason,
          duration: `${duration}h`
        });
        currentTime = endTime + 0.5; // 30 min buffer/rest between stops
        lastLat = place.lat;
        lastLng = place.lng;
      }
    }

    itinerary[`Day ${d + 1}`] = { places: scheduledStops };
  }

  const totalCost = candidates.reduce((sum, p) => sum + (p.cost || p.estimatedCost || 0), 0);

  return { itinerary, totalCost, isPersonalized: true };
}

module.exports = plannerEngine;