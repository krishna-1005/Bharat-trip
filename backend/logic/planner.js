const places = require("../data/bangalorePlaces.json");

const MAX_HOURS_PER_DAY = 6;

/* Filter places based on budget + interests */
function filterPlaces(budget, interests) {

  return places.filter(place => {

    const budgetMatch = !budget || place.budget === budget;

    const interestMatch =
      !interests ||
      interests.length === 0 ||
      interests
        .map(i => i.toLowerCase())
        .includes(place.category.toLowerCase());

    return budgetMatch && interestMatch;

  });

}

/* Generate itinerary */
function generatePlan({ days, budget, interests }) {

  const filtered = filterPlaces(budget, interests);

  /* If no places found */
  let filteredPlaces = filtered;

  if (filteredPlaces.length === 0) {
    filteredPlaces = places;
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