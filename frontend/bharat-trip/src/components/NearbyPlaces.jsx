import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../utils/fixLeafletIcons"; // centralized fix

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "");

export default function NearbyPlaces() {
  const [location, setLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNearby = async (lat, lng) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/nearby`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lng })
      });
      const data = await res.json();
      setPlaces(data);
    } catch (err) {
      console.error("Fetch nearby failed:", err);
      setError("Failed to load nearby places.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Try to get user location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setLocation(userLocation);
        fetchNearby(userLocation.lat, userLocation.lng);
      },
      (err) => {
        console.warn("Geolocation denied/failed. Falling back to Bangalore center.", err);
        const defaultLoc = { lat: 12.9716, lng: 77.5946 };
        setLocation(defaultLoc);
        fetchNearby(defaultLoc.lat, defaultLoc.lng);
      },
      { timeout: 10000 }
    );
  }, []);

  if (!location) return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h2>📍 Getting your location...</h2>
      <p>If prompted, please allow location access to see places near you.</p>
    </div>
  );

  return (
    <div className="nearby-wrap">
      <div className="nearby-header" style={{ padding: "10px 20px" }}>
        <h3>Nearby Places</h3>
        {loading && <span className="loading-badge">Refreshing...</span>}
        {error && <span className="error-badge" style={{ color: "red" }}>{error}</span>}
      </div>

      <MapContainer
        center={[location.lat, location.lng]}
        zoom={14}
        style={{ height: "600px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {/* User Location Marker */}
        <Marker position={[location.lat, location.lng]}>
          <Popup>You are here</Popup>
        </Marker>

        {/* Nearby Places Markers */}
        {places.map((place, i) => (
          <Marker
            key={i}
            position={[Number(place.lat), Number(place.lng)]}
          >
            <Popup>
              <div style={{ minWidth: "150px" }}>
                <b style={{ color: "#2563eb" }}>{place.name}</b><br/>
                <span style={{ fontSize: "12px", color: "#666" }}>
                  Category: {place.category}<br/>
                  Distance: {place.distance?.toFixed(2)} km
                </span>
                <br/>
                <small style={{ color: "#999" }}>Source: {place.source}</small>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
