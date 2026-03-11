const fetchOSMPlaces = require("../services/osmPlaces");

const MAX_HOURS_PER_DAY = 6;

/* Filter places based on interests */
function filterPlaces(places, interests) {

  if (!interests || interests.length === 0) return places;

  const normalizedInterests = interests.map(i => i.toLowerCase());

  return places.filter(place => {

    const category = (place.category || "").toLowerCase();

    return normalizedInterests.includes(category);

  });

}

/* Generate itinerary */
async function generatePlan({ days, budget, interests }) {

  /* Fetch places from OSM */
  let places = await fetchOSMPlaces();

  /* Add default fields for planner compatibility */
  places = places.map(p => ({
    ...p,
    timeHours: 1.5,
    avgCost: 100
  }));

  const filtered = filterPlaces(places, interests);

  let filteredPlaces = filtered.length > 0 ? filtered : places;

  const itinerary = {};

  /* Create empty days */
  for (let d = 1; d <= days; d++) {

    itinerary[`Day ${d}`] = {
      places: [],
      estimatedHours: 0,
      estimatedCost: 0
    };

  }

  let dayIndex = 1;

  /* Distribute places across days */
  for (let place of filteredPlaces) {

    const dayKey = `Day ${dayIndex}`;
    const day = itinerary[dayKey];

    if (day.estimatedHours + place.timeHours <= MAX_HOURS_PER_DAY) {

      day.places.push(place);
      day.estimatedHours += place.timeHours;
      day.estimatedCost += place.avgCost;

      dayIndex = dayIndex % days + 1;

    }

  }

  const totalTripCost = Object.values(itinerary)
    .reduce((sum, day) => sum + day.estimatedCost, 0);

  return {
    city: "Bengaluru",
    days,
    budget,
    totalTripCost,
    itinerary
  };

}

module.exports = generatePlan;