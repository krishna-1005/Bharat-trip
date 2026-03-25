function plannerEngine(places, { city, days, interests, budget }) {
  // 1. Filter by city + interests
  let filtered = places.filter(p =>
    p.city.toLowerCase() === city.toLowerCase() &&
    interests.includes(p.category)
  );

  // 2. Budget filter
  if (budget === "low") {
    filtered = filtered.filter(p => p.cost <= 500);
  } else if (budget === "medium") {
    filtered = filtered.filter(p => p.cost <= 1500);
  }
  // high → no filter

  // 3. Sort by rating (if exists)
  filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));

  // 4. Distribute across days
  const perDay = Math.ceil(filtered.length / days);
  const itinerary = {};

  for (let i = 0; i < days; i++) {
    const dayPlaces = filtered.slice(i * perDay, (i + 1) * perDay);

    itinerary[i + 1] = dayPlaces.map(p => ({
      name: p.name,
      category: p.category,
      avgCost: p.cost || 0,
      timeHours: p.avgTime || 2,
      lat: p.lat,
      lng: p.lng
    }));
  }

  // 5. Total cost
  const totalCost = filtered.reduce((sum, p) => sum + (p.cost || 0), 0);

  return {
    itinerary,
    totalCost
  };
}

module.exports = plannerEngine;