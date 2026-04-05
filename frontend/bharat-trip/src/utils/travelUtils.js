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

const LOCAL_CATEGORIES = ["shopping", "street food", "markets", "cafes", "nightlife", "food"];
const DESTINATION_CATEGORIES = ["nature", "historic", "landmarks", "culture", "heritage", "museum", "park"];

/**
 * Filters and sorts places based on category-specific distance rules.
 * @param {Array} places List of places with { name, lat, lng, category }
 * @param {Object} userLocation { lat, lng }
 * @returns {Array} Filtered and sorted places
 */
export const filterAndSortPlaces = (places, userLocation) => {
  if (!places || !Array.isArray(places)) return [];
  
  const nLat = Number(userLocation?.lat);
  const nLng = Number(userLocation?.lng);

  // Fallback: return all if no user location is provided or valid
  if (!userLocation || !Number.isFinite(nLat) || !Number.isFinite(nLng)) {
    return places; 
  }

  const enriched = places
    .map(place => {
      const dist = calculateDistance(nLat, nLng, place.lat, place.lng);
      return { ...place, distanceToUser: dist };
    });

  // CRITICAL FIX: Only apply filtering if at least one place is within 100km.
  // This ensures that if you are in a different city, we don't hide EVERYTHING.
  const isNearbyCity = enriched.some(p => p.distanceToUser !== null && p.distanceToUser < 100);
  
  if (!isNearbyCity) {
    return places; // User is far away, show full itinerary without filtering
  }

  return enriched
    .filter(place => {
      if (place.distanceToUser === null) return true; // Keep if we can't calculate distance

      const cat = (place.category || "").toLowerCase();

      // 1. Local Categories: <= 10km
      if (LOCAL_CATEGORIES.some(lc => cat.includes(lc))) {
        return place.distanceToUser <= 10;
      }

      // 2. Destination Categories: <= 60km
      if (DESTINATION_CATEGORIES.some(dc => cat.includes(dc))) {
        return place.distanceToUser <= 60;
      }

      // 3. Other categories: Default to 40km radius
      return place.distanceToUser <= 40;
    })
    .sort((a, b) => {
      const catA = (a.category || "").toLowerCase();
      const catB = (b.category || "").toLowerCase();
      
      // For local categories, prioritize nearest first
      if (LOCAL_CATEGORIES.some(lc => catA.includes(lc)) && LOCAL_CATEGORIES.some(lc => catB.includes(lc))) {
        return (a.distanceToUser || 0) - (b.distanceToUser || 0);
      }
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
