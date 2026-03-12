import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../../utils/fixLeafletIcons";
import PlaceImage from "../components/PlaceImage";
import { useSettings } from "../context/SettingsContext";
import "./results.css"; // Reuse some styles

export default function PlaceDetails() {
  const loc = useLocation();
  const navigate = useNavigate();
  const { t } = useSettings();
  const [place, setPlace] = useState(null);

  useEffect(() => {
    if (loc.state?.place) {
      setPlace(loc.state.place);
    } else {
      // If accessed directly without state, we'd fetch details
      // But for this prototype, we'll just redirect back if no data
      navigate("/");
    }
  }, [loc.state, navigate]);

  if (!place) return <div className="res-empty"><h2>Loading Details...</h2></div>;

  return (
    <div className="res-page" style={{ flexDirection: 'column', overflowY: 'auto', padding: '100px 20px 40px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ background: 'var(--glass)', border: '1px solid var(--border-main)', color: 'var(--text-main)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', marginBottom: '20px' }}
        >
          ← Back
        </button>

        <div className="premium-card" style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', marginBottom: '40px' }}>
          <div style={{ flex: '1', minWidth: '300px' }}>
            <PlaceImage 
              placeName={place.name} 
              city={place.address?.city || "India"} 
              style={{ width: '100%', height: '300px', borderRadius: '16px', objectFit: 'cover' }}
              className="details-hero-img"
            />
          </div>
          <div style={{ flex: '1.5', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0 }}>{place.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ background: 'var(--accent-amber)', color: '#000', padding: '4px 10px', borderRadius: '6px', fontWeight: '800', fontSize: '1.1rem' }}>
                ⭐ {place.rating}
              </span>
              <span style={{ color: 'var(--text-dim)' }}>Real User Rating</span>
            </div>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-dim)', lineHeight: '1.6' }}>
              {place.fullName}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
              <span className="place-tag">{place.category || "Sightseeing"}</span>
              <span className="place-tag">📍 {place.address?.state || place.address?.country || "India"}</span>
            </div>
          </div>
        </div>

        <div className="premium-card" style={{ padding: '0', overflow: 'hidden', height: '400px', borderRadius: '24px', border: '1px solid var(--border-main)' }}>
          <MapContainer
            center={[place.lat, place.lng]}
            zoom={15}
            zoomControl={true}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[place.lat, place.lng]}>
              <Tooltip permanent direction="top">{place.name}</Tooltip>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
