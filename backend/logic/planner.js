const places = require("../data/bangalorePlaces.json");

const MAX_HOURS_PER_DAY = 6;

/* Filter places based on budget + interests */
function filterPlaces(budget, interests) {

  return places.filter(place => {

    const budgetMatch = !budget || place.budget === budget;

    const interestMatch =
      !interests || interests.includes(place.category);

    return budgetMatch && interestMatch;

  });

}

/* Generate itinerary */
function generatePlan({ days, budget, interests }) {

  const filtered = filterPlaces(budget, interests);

  /* If no places found */
  if (filtered.length === 0) {
    return {
      city: "Bengaluru",
      days,
      budget,
      totalTripCost: 0,
      itinerary: {}
    };
  }

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
  for (let place of filtered) {

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