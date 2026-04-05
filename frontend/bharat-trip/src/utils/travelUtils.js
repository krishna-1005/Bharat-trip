/**
 * Calculates the distance between two points on Earth using the Haversine formula.
 * @param {number} lat1 Latitude of point 1
 * @param {number} lon1 Longitude of point 1
 * @param {number} lat2 Latitude of point 2
 * @param {number} lon2 Longitude of point 2
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const nLat1 = parseFloat(lat1);
  const nLon1 = parseFloat(lon1);
  const nLat2 = parseFloat(lat2);
  const nLon2 = parseFloat(lon2);

  if (!Number.isFinite(nLat1) || !Number.isFinite(nLon1) || !Number.isFinite(nLat2) || !Number.isFinite(nLon2)) {
    return null;
  }

  const R = 6371; // Earth's radius in km
  const dLat = (nLat2 - nLat1) * (Math.PI / 180);
  const dLon = (nLon2 - nLon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(nLat1 * (Math.PI / 180)) *
      Math.cos(nLat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
};

const COST_RULES = {
  foodPerDay: 500,
  hotelPerNight: {
    budget: 1000,
    low: 1000,
    mid: 2500,
    medium: 2500,
    luxury: 5000,
    high: 5000
  },
  transportPerKm: 10,
  activityBase: 100
};

/**
 * Deterministically calculates the total trip cost based on plan details.
 * @param {Object} plan The trip plan object
 * @param {Object} preferences User preferences (budgetTier, travelerType)
 * @returns {Object} Cost breakdown and total
 */
export const calculateTripCost = (plan, preferences = {}) => {
  if (!plan || !plan.itinerary) return { total: 0 };

  const days = Number(plan.days) || 1;
  const budgetTier = preferences.budget || plan.budget || "medium";
  const travelerCount = { solo: 1, couple: 2, family: 3, friends: 4 }[preferences.travelerType] || 1;

  // 1. Hotel Cost (Nights = Days - 1, min 1 for overnight feel)
  const nights = Math.max(1, days); 
  const hotelRate = COST_RULES.hotelPerNight[budgetTier.toLowerCase()] || COST_RULES.hotelPerNight.mid;
  const totalHotel = hotelRate * nights * (travelerCount > 2 ? 2 : 1); // Simple logic: 1 room for up to 2 people

  // 2. Food Cost
  const totalFood = COST_RULES.foodPerDay * days * travelerCount;

  // 3. Transport & Activity Cost
  let totalTransport = 0;
  let totalActivities = 0;

  const itinerary = Array.isArray(plan.itinerary) 
    ? plan.itinerary 
    : Object.values(plan.itinerary);

  itinerary.forEach((dayData) => {
    const places = dayData.places || [];
    
    // Activities
    places.forEach((place) => {
      const baseActivity = place.avgCost || COST_RULES.activityBase;
      totalActivities += baseActivity * travelerCount;
    });

    // Distance-based transport
    for (let i = 0; i < places.length - 1; i++) {
      const p1 = places[i];
      const p2 = places[i+1];
      const dist = calculateDistance(p1.lat, p1.lng, p2.lat, p2.lng) || 5; // Fallback 5km
      totalTransport += dist * COST_RULES.transportPerKm;
    }
    
    // Add a daily base transport for commuting to hotel/start (e.g., 20km)
    totalTransport += 20 * COST_RULES.transportPerKm;
  });

  const total = Math.round(totalHotel + totalFood + totalTransport + totalActivities);

  return {
    total,
    breakdown: {
      hotel: Math.round(totalHotel),
      food: Math.round(totalFood),
      transport: Math.round(totalTransport),
      activities: Math.round(totalActivities)
    }
  };
};

const LOCAL_CATEGORIES = ["Shopping", "Street Food", "Markets", "Cafes", "Nightlife"];
const DESTINATION_CATEGORIES = ["Nature", "Historic", "Landmarks", "Culture"];

/**
 * Filters and sorts places based on category-specific distance rules.
 * @param {Array} places List of places with { name, lat, lng, category }
 * @param {Object} userLocation { lat, lng }
 * @returns {Array} Filtered and sorted places
 */
export const filterAndSortPlaces = (places, userLocation) => {
  if (!places || !Array.isArray(places)) return [];
  if (!userLocation || !Number.isFinite(userLocation.lat) || !Number.isFinite(userLocation.lng)) {
    return places; // Fallback: return all if no user location
  }

  return places
    .map(place => {
      const dist = calculateDistance(userLocation.lat, userLocation.lng, place.lat, place.lng);
      
      if (dist === null) {
        console.warn(`BharatTrip: Skipping place "${place.name}" due to invalid coordinates.`);
        return null;
      }

      return { ...place, distanceToUser: dist };
    })
    .filter(place => {
      if (!place) return false;

      // 1. Local Categories: <= 5km
      if (LOCAL_CATEGORIES.includes(place.category)) {
        return place.distanceToUser <= 5;
      }

      // 2. Destination Categories: <= 50km
      if (DESTINATION_CATEGORIES.includes(place.category)) {
        return place.distanceToUser <= 50;
      }

      // 3. Other categories: Default to 25km radius
      return place.distanceToUser <= 25;
    })
    .sort((a, b) => {
      // For local categories, prioritize nearest first
      if (LOCAL_CATEGORIES.includes(a.category) && LOCAL_CATEGORIES.includes(b.category)) {
        return a.distanceToUser - b.distanceToUser;
      }
      // Keep original order for destinations to preserve itinerary flow
      return 0; 
    });
};

/**
 * Calculates travel cost based on distance.
 * @param {number} distance Distance in kilometers
 * @param {number} rate Rate per kilometer (default ₹8)
 * @param {number} minFare Minimum base fare (default ₹50)
 * @returns {number} Total travel cost
 */
export const calculateTravelCost = (distance, rate = 8, minFare = 50) => {
  if (distance === null || distance === undefined) return null;
  const cost = distance * rate;
  return Math.max(Math.round(cost), minFare);
};
