const axios = require("axios");

/* ── Category mapper ── */
function mapCategory(tags = {}) {
  if (tags.tourism === "attraction" || tags.tourism === "museum") return "Culture";
  if (tags.leisure === "park")         return "Nature";
  if (tags.natural === "peak" || tags.natural === "hill") return "Adventure";
  if (tags.natural)                    return "Nature";
  if (tags.historic)                   return "Culture";
  if (tags.amenity === "place_of_worship") return "Spiritual";
  return "Other";
}

/* ── Junk name patterns to reject ── */
const JUNK_PATTERNS = [
  /^tree\b/i, /\btree$/i,          // "Tree 2189", "Banyan Tree"
  /^rock\b/i,                       // "Rock Hill"
  /kaolin/i,                        // geology junk
  /unnamed/i,
  /^(water|electric|lamp|pole|post|tower|tank|bore|well|pump)/i,
  /park\s+\d+/i,                    // "Park 12"
  /\d{4,}/,                         // names that are mostly numbers
  /^[a-z]{1,3}$/i,                  // very short names
];

function isJunk(name = "") {
  if (!name || name.trim().length < 4) return true;
  return JUNK_PATTERNS.some(rx => rx.test(name.trim()));
}

/* ── Known good Bangalore places (curated seed list) ── */
const KNOWN_PLACES = [
  "Cubbon Park", "Lalbagh Botanical Garden", "Bangalore Palace",
  "ISKCON Temple", "Vidhana Soudha", "Tipu Sultan's Summer Palace",
  "Nandi Hills", "Bannerghatta National Park", "Ulsoor Lake",
  "National Gallery of Modern Art", "HAL Aerospace Museum",
  "Jawaharlal Nehru Planetarium", "Wonderla", "UB City",
  "Ranga Shankara", "KR Market", "Commercial Street",
  "Church Street", "VV Puram Food Street", "MTR Restaurant",
  "Banashankari Temple", "St. Mary's Basilica",
];

async function fetchOSMPlaces(lat, lng) {
  const radius = 0.15; // roughly 15km box
  const minLat = lat - radius;
  const maxLat = lat + radius;
  const minLng = lng - radius;
  const maxLng = lng + radius;

  const query = `
  [out:json][timeout:30];
  (
    node["tourism"~"attraction|museum|viewpoint"](${minLat},${minLng},${maxLat},${maxLng});
    way["tourism"~"attraction|museum|viewpoint"](${minLat},${minLng},${maxLat},${maxLng});
    node["leisure"="park"]["name"](${minLat},${minLng},${maxLat},${maxLng});
    way["leisure"="park"]["name"](${minLat},${minLng},${maxLat},${maxLng});
    node["historic"]["name"](${minLat},${minLng},${maxLat},${maxLng});
    way["historic"]["name"](${minLat},${minLng},${maxLat},${maxLng});
    node["amenity"="place_of_worship"]["name"](${minLat},${minLng},${maxLat},${maxLng});
    node["natural"~"peak|hill"]["name"](${minLat},${minLng},${maxLat},${maxLng});
  );
  out center;
  `;

  try {
    const response = await axios.post(
      "https://overpass-api.de/api/interpreter",
      query,
      { headers: { "Content-Type": "text/plain" }, timeout: 35000 }
    );

    const places = response.data.elements
      .filter(p => p.tags?.name && !isJunk(p.tags.name))
      .map(p => ({
        name:     p.tags.name,
        lat:      p.lat || p.center?.lat,
        lng:      p.lon || p.center?.lon,
        category: mapCategory(p.tags),
        source:   "osm",
      }))
      .filter(p => p.lat && p.lng);

    console.log(`✅ OSM fetched ${places.length} quality places`);
    return places;

  } catch (err) {
    console.error("⚠️  OSM fetch failed:", err.message);
    return []; // graceful degradation — planner uses places.json
  }
}

module.exports = fetchOSMPlaces;