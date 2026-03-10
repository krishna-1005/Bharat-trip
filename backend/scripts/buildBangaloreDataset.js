const fs = require("fs");
const axios = require("axios");

const URL =
"https://overpass-api.de/api/interpreter?data=[out:json];area['name'='Bengaluru']->.a;(node['tourism'](area.a);node['amenity'='restaurant'](area.a);node['leisure'](area.a););out;";

async function buildDataset() {
  const res = await axios.get(URL);

  const places = res.data.elements
    .filter(p => p.tags && p.tags.name)
    .map(p => ({
      name: p.tags.name,
      area: "Bangalore",
      category: p.tags.tourism || p.tags.leisure || "Food",
      budget: "medium",
      avgCost: 500,
      timeHours: 2,
      lat: p.lat,
      lng: p.lon
    }));

  fs.writeFileSync(
    "./backend/data/bangalorePlaces.json",
    JSON.stringify(places, null, 2)
  );

  console.log("Dataset created:", places.length, "places");
}

buildDataset();