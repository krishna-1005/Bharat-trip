const axios = require("axios");

/* Map OSM tags → planner categories */
function mapCategory(tags = {}) {

  if (tags.tourism === "attraction" || tags.tourism === "museum")
    return "Culture";

  if (tags.leisure === "park" || tags.natural)
    return "Nature";

  if (tags.historic)
    return "Culture";

  if (tags.amenity === "place_of_worship")
    return "Spiritual";

  if (tags.natural === "peak" || tags.natural === "hill")
    return "Adventure";

  return "Other";
}

async function fetchOSMPlaces() {

  const query = `
  [out:json];
  (
    node["tourism"="attraction"](12.8,77.4,13.3,77.9);
    node["tourism"="museum"](12.8,77.4,13.3,77.9);
    node["leisure"="park"](12.8,77.4,13.3,77.9);
    node["historic"](12.8,77.4,13.3,77.9);
    node["amenity"="place_of_worship"](12.8,77.4,13.3,77.9);
    node["natural"](12.8,77.4,13.3,77.9);
  );
  out;
  `;

  const response = await axios.post(
    "https://overpass-api.de/api/interpreter",
    query
  );

  const places = response.data.elements
    .filter(p => p.tags && p.tags.name) // remove unnamed places
    .map(p => ({
      name: p.tags.name,
      lat: p.lat,
      lng: p.lon,
      category: mapCategory(p.tags)
    }));

  return places;
}

module.exports = fetchOSMPlaces;