const axios = require("axios");

/**
 * Maps OSM tags to standard GoTripo categories.
 * Standard categories: Nature, Food, Culture, Shopping, Adventure, Nightlife
 */
function mapCategory(tags = {}) {
  // ACCOMMODATION
  if (tags.tourism === "hotel" || tags.tourism === "hostel" || tags.tourism === "guest_house" || tags.tourism === "motel" || tags.tourism === "apartment") return "Stay";

  // SPIRITUAL (Maps to Culture for trip themes)
  if (tags.amenity === "place_of_worship" || tags.religion) return "Culture";
  
  // NIGHTLIFE
  if (tags.amenity === "pub" || tags.amenity === "bar" || tags.amenity === "nightclub") return "Nightlife";

  // CULTURE
  if (tags.tourism === "museum" || tags.tourism === "art_gallery" || tags.historic || tags.heritage) return "Culture";
  if (tags.amenity === "theatre" || tags.amenity === "library" || tags.amenity === "arts_centre") return "Culture";
  
  // NATURE
  if (tags.leisure === "park" || tags.leisure === "garden" || tags.leisure === "nature_reserve") return "Nature";
  if (tags.natural === "water" || tags.natural === "beach" || tags.natural === "wood" || tags.natural === "peak") return "Nature";
  if (tags.tourism === "zoo" || tags.tourism === "aquarium") return "Nature";

  // FOOD
  if (tags.amenity === "restaurant" || tags.amenity === "cafe" || tags.amenity === "food_court") return "Food";

  // SHOPPING
  if (tags.shop || tags.amenity === "market" || tags.tourism === "marketplace") return "Shopping";

  // ADVENTURE / ENTERTAINMENT
  if (tags.leisure === "theme_park" || tags.leisure === "water_park" || tags.leisure === "stadium" || tags.leisure === "cinema" || tags.leisure === "adventure_park" || tags.leisure === "playground") return "Adventure";

  // ATTRACTION FALLBACK
  if (tags.tourism === "attraction" || tags.tourism === "viewpoint") return "Culture";

  return "Other";
}

const NAME_MAPPINGS = {
  "Bird and Rabbit park": "Jawahar Bal Bhavan",
  "Bird And Rabbit Park": "Jawahar Bal Bhavan",
  "Indira Gandhi Musical Fountain": "Indira Gandhi Musical Fountain Park",
  "High Court of Karnataka": "Karnataka High Court",
  "Cubbon Park": "Cubbon Park",
  "Lalbagh Botanical Garden": "Lalbagh Botanical Garden",
  "Government Museum": "Government Museum (Bengaluru)",
  "Visvesvaraya Industrial and Technological Museum": "Visvesvaraya Museum"
};

const JUNK_PATTERNS = [
  /^tree\b/i, /\btree$/i,
  /kaolin/i,
  /unnamed/i,
  /^(water|electric|lamp|pole|post|tower|tank|bore|well|pump|bus stop|toilet|atm)/i,
  /park\s+\d+/i,
  /\d{4,}/,
  /^[a-z]{1,3}$/i,
  /gate\s+\d+/i,
  /pillar\s+\d+/i
];

function sanitizeName(name) {
  if (!name) return "";
  let trimmed = name.trim();
  
  // 1. Check exact mapping (case-insensitive check for robustness)
  for (const [key, val] of Object.entries(NAME_MAPPINGS)) {
    if (trimmed.toLowerCase() === key.toLowerCase()) return val;
  }
  
  // 2. Remove leading "The "
  trimmed = trimmed.replace(/^the\s+/i, '');

  // 3. Fix double spaces
  trimmed = trimmed.replace(/\s+/g, ' ');

  // 4. Proper Case Conversion (if all caps)
  if (trimmed === trimmed.toUpperCase() && trimmed.length > 4) {
    trimmed = trimmed.charAt(0) + trimmed.slice(1).toLowerCase();
  }

  return trimmed;
}

function isJunk(name = "") {
  if (!name || name.trim().length < 4) return true;
  return JUNK_PATTERNS.some(rx => rx.test(name.trim()));
}

/**
 * Fetches places from OpenStreetMap via Overpass API.
 */
async function fetchOSMPlaces(lat, lng, radiusKm = 10) {
  // Dynamic radius conversion (rough: 1 degree ~ 111km)
  const degRadius = radiusKm / 111;
  const minLat = lat - degRadius;
  const maxLat = lat + degRadius;
  const minLng = lng - degRadius;
  const maxLng = lng + degRadius;

  const query = `
  [out:json][timeout:30];
  (
    node["tourism"~"attraction|museum|viewpoint|art_gallery|zoo|aquarium|hotel|hostel|guest_house|motel"](${minLat},${minLng},${maxLat},${maxLng});
    way["tourism"~"attraction|museum|viewpoint|art_gallery|zoo|aquarium|hotel|hostel|guest_house|motel"](${minLat},${minLng},${maxLat},${maxLng});
    
    node["leisure"~"park|garden|nature_reserve|theme_park|water_park|adventure_park|stadium|playground"](${minLat},${minLng},${maxLat},${maxLng});
    way["leisure"~"park|garden|nature_reserve|theme_park|water_park|adventure_park|stadium|playground"](${minLat},${minLng},${maxLat},${maxLng});

    node["amenity"~"restaurant|cafe|food_court|place_of_worship|theatre|market|pub|bar|nightclub|arts_centre"](${minLat},${minLng},${maxLat},${maxLng});
    way["amenity"~"restaurant|cafe|food_court|place_of_worship|theatre|market|pub|bar|nightclub|arts_centre"](${minLat},${minLng},${maxLat},${maxLng});

    node["historic"](${minLat},${minLng},${maxLat},${maxLng});
    way["historic"](${minLat},${minLng},${maxLat},${maxLng});

    node["natural"~"peak|beach"](${minLat},${minLng},${maxLat},${maxLng});
  );
  out center;
  `;

  try {
    const response = await axios.post(
      "https://overpass-api.de/api/interpreter",
      query,
      { 
        headers: { 
          "Content-Type": "text/plain",
          "User-Agent": "GoTripoTravelApp/1.0 (https://gotripo.com; contact@gotripo.com)"
        }, 
        timeout: 40000 
      }
    );

    if (!response.data || !response.data.elements) return [];

    const rawElements = response.data.elements;
    const places = rawElements
      .filter(p => p.tags?.name && !isJunk(p.tags.name))
      .map(p => {
        const pLat = p.lat || p.center?.lat;
        const pLng = p.lon || p.center?.lon;
        const sName = sanitizeName(p.tags.name);
        
        // Generate realistic enrichment for OSM data
        const rating = (4.0 + Math.random() * 0.8).toFixed(1);
        const reviews = Math.floor(100 + Math.random() * 4900);
        
        return {
          name: sName,
          lat: Number(pLat),
          lng: Number(pLng),
          category: mapCategory(p.tags),
          timeHours: 2, // Default
          avgCost: p.tags.amenity === "restaurant" ? 500 : 100, // Heuristic
          tags: [p.tags.tourism, p.tags.amenity, p.tags.historic].filter(Boolean),
          rating: Number(rating),
          reviews: reviews,
          source: "osm"
        };
      })
      .filter(p => p.lat && p.lng && p.name);

    console.log(`✅ OSM: Fetched and normalized ${places.length} places for coordinates [${lat}, ${lng}]`);
    return places;


  } catch (err) {
    console.error("âš ï¸ OSM Fetch Error:", err.message);
    return [];
  }
}

module.exports = fetchOSMPlaces;
