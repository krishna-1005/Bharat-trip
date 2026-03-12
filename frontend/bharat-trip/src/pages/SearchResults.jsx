import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PlaceImage from "../components/PlaceImage";
import { useSettings } from "../context/SettingsContext";
import "./results.css";

const API = import.meta.env.VITE_API_URL;

export default function SearchResults() {
  const loc = useLocation();
  const navigate = useNavigate();
  const { formatPrice } = useSettings();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const query = new URLSearchParams(loc.search).get("q");

  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/places/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const handleSelect = (place) => {
    navigate(`/place/${place.id}`, { state: { place } });
  };

  if (loading) return <div className="res-empty"><h2>Searching for "{query}"...</h2></div>;

  return (
    <div className="res-page" style={{ flexDirection: 'column', overflowY: 'auto', padding: '100px 20px 40px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '30px' }}>
          Search Results for <span className="gradient-text">"{query}"</span>
        </h1>

        {results.length === 0 ? (
          <div className="res-empty">
            <span style={{ fontSize: '48px' }}>🔍</span>
            <h2>No places found</h2>
            <button onClick={() => navigate("/")}>Try another search</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {results.map((place) => (
              <div 
                key={place.id} 
                className="pro-trip-card" 
                onClick={() => handleSelect(place)}
                style={{ cursor: 'pointer' }}
              >
                <div className="pro-trip-img-wrap" style={{ height: '200px' }}>
                  <PlaceImage 
                    placeName={place.name} 
                    city={place.address?.city || "India"} 
                    className="pro-trip-img"
                  />
                  <div className="pro-trip-badge" style={{ background: 'var(--accent-amber)', color: '#000' }}>⭐ {place.rating}</div>
                </div>
                <div className="pro-trip-body">
                  <h3 className="pro-trip-title">{place.name}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: '5px 0' }}>{place.category}</p>
                  <div className="pro-trip-meta">
                    📍 {place.address?.city || place.address?.state || "India"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
