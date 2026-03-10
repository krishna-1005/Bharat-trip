const express = require("express");
const router = express.Router();

const places = require("../data/bangalorePlaces.json");

/* Haversine distance formula (km) */
function distance(lat1, lon1, lat2, lon2) {

  const R = 6371; // Earth radius in km

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

router.post("/", (req, res) => {

  try {

    const { lat, lng } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({
        error: "Latitude and longitude required"
      });
    }

    const nearby = places
      .map(place => {

        const placeLat = Number(place.lat);
        const placeLng = Number(place.lng);

        const d = distance(
          Number(lat),
          Number(lng),
          placeLat,
          placeLng
        );

        return {
          ...place,
          lat: placeLat,
          lng: placeLng,
          distance: d
        };

      })
      .filter(place => place.distance < 3)     // within 3 km
      .sort((a, b) => a.distance - b.distance) // closest first
      .slice(0, 30);                            // max 30 places

    console.log("Nearby places returned:", nearby.length);

    res.json(nearby);

  } catch (err) {

    console.error("Nearby API error:", err);

    res.status(500).json({
      error: "Server error"
    });

  }

});

module.exports = router;