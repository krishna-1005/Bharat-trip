/**
 * Cost Intelligence Engine
 * Handles price comparisons, savings insights, and date-based price fluctuations.
 */

// Simulation of price fluctuation by day of week (0=Sun, 6=Sat)
// In India, mid-week (Tue-Wed) is often cheaper for flights and business hotels.
const DAY_PRICE_MULTIPLIERS = {
  0: 1.15, // Sunday (High)
  1: 1.05, // Monday
  2: 0.90, // Tuesday (Cheap)
  3: 0.85, // Wednesday (Cheapest)
  4: 1.00, // Thursday
  5: 1.20, // Friday (High)
  6: 1.25  // Saturday (Highest)
};

/**
 * Compares current trip costs with potential alternatives.
 */
function compareCosts(plan) {
  const { totalTripCost, days, budgetTier, recommendedStay, recommendedTransport } = plan;
  
  // 1. Hotel Comparison
  const currentHotelCost = recommendedStay?.avgCost || 2000;
  const alternatives = [
    { type: "Hostel/Budget", avgCost: currentHotelCost * 0.5, savings: currentHotelCost * 0.5 },
    { type: "Mid-range", avgCost: currentHotelCost * 0.8, savings: currentHotelCost * 0.2 },
  ].filter(alt => alt.avgCost < currentHotelCost);

  // 2. Transport Comparison
  const transportSavings = recommendedTransport?.mode === "Flight" ? "Switching to Train could save ~₹3,500" : null;

  return {
    hotelAlternatives: alternatives,
    transportInsight: transportSavings
  };
}

/**
 * Suggests cheaper date changes based on historical simulation.
 */
function suggestCheaperDates(startDate, days) {
  const start = new Date(startDate);
  const suggestions = [];

  // Check next 14 days for better starting points
  for (let i = -3; i <= 7; i++) {
    if (i === 0) continue; // Skip current date
    
    const candidate = new Date(start);
    candidate.setDate(start.getDate() + i);
    
    // Simple heuristic: compare average multiplier for the trip duration
    const getAvgMultiplier = (date) => {
      let sum = 0;
      for (let j = 0; j < days; j++) {
        const d = new Date(date);
        d.setDate(date.getDate() + j);
        sum += DAY_PRICE_MULTIPLIERS[d.getDay()];
      }
      return sum / days;
    };

    const currentMult = getAvgMultiplier(start);
    const candidateMult = getAvgMultiplier(candidate);

    if (candidateMult < currentMult * 0.95) { // If 5%+ cheaper
      suggestions.push({
        newStartDate: candidate.toISOString().split('T')[0],
        estimatedSavingsPercent: Math.round((1 - candidateMult / currentMult) * 100),
        reason: DAY_PRICE_MULTIPLIERS[candidate.getDay()] < 1 ? "Mid-week departure" : "Lower weekend surcharge"
      });
    }
  }

  return suggestions.sort((a, b) => b.estimatedSavingsPercent - a.estimatedSavingsPercent).slice(0, 2);
}

/**
 * Generates savings insights per user/plan.
 */
function getSavingsInsights(plan, startDate) {
  const comparisons = compareCosts(plan);
  const dateSuggestions = suggestCheaperDates(startDate || new Date(), plan.days || 5);
  
  const totalPotentialSavings = (comparisons.hotelAlternatives[0]?.savings || 0) * (plan.days || 5);
  
  return {
    potentialHotelSavings: totalPotentialSavings,
    transportInsight: comparisons.transportInsight,
    cheaperDates: dateSuggestions,
    score: totalPotentialSavings > 5000 ? "High Savings Potential" : "Optimized"
  };
}

module.exports = {
  getSavingsInsights,
  compareCosts,
  suggestCheaperDates
};
