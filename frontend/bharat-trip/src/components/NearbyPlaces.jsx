import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* Fix marker icon issue in React */
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

export default function NearbyPlaces() {

  const [location, setLocation] = useState(null);
  const [places, setPlaces] = useState([]);

  useEffect(() => {

    navigator.geolocation.getCurrentPosition((position) => {

      const userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      console.log("User location:", userLocation);

      setLocation(userLocation);

      fetch("http://localhost:5000/api/nearby", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(userLocation)
      })
      .then(res => res.json())
      .then(data => {
        console.log("Places received:", data);
        setPlaces(data);
      });

    });

  }, []);

  if (!location) return <h2>Getting location...</h2>;

  return (

    <MapContainer
      center={[location.lat, location.lng]}
      zoom={14}
      style={{ height: "600px", width: "100%" }}
    >

      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* User Location Marker */}
      <Marker position={[location.lat, location.lng]}>
        <Popup>You are here</Popup>
      </Marker>

      {/* Test Marker (for debugging) */}
      <Marker position={[12.9716, 77.5946]}>
        <Popup>Test Marker</Popup>
      </Marker>

      {/* Nearby Places Markers */}
      {places.map((place, i) => (
        <Marker
          key={i}
          position={[Number(place.lat), Number(place.lng)]}
        >
          <Popup>
            <b>{place.name}</b><br/>
            Category: {place.category}<br/>
            Distance: {place.distance?.toFixed(2)} km
          </Popup>
        </Marker>
      ))}

    </MapContainer>

  );
}
