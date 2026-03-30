import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import PlaceImage from "../components/PlaceImage";
import "./home.css"; // Reuse some home styles or create exploration.css

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "");

export default function Exploration() {
  const navigate = useNavigate();
  const { formatPrice, t } = useSettings();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ city: "", days: "", sort: "recent" });

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams(filter).toString();
      const res = await fetch(`${API}/api/public/trips?${query}`);
      const data = await res.json();
      if (res.ok) setTrips(data.trips || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [filter.sort]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTrips();
  };

  return (
    <div className="pro-page" style={{ paddingTop: '80px' }}>
      <div className="pro-body">
        <header className="pro-hero" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 className="pro-name">Explore Journeys</h1>
          <p className="pro-bio">Discover and reuse world-class itineraries from our community.</p>
          
          <form className="explore-search-bar" onSubmit={handleSearch} style={{ maxWidth: '600px', margin: '30px auto', display: 'flex', gap: '10px' }}>
             <input 
               type="text" 
               placeholder="Search city..." 
               value={filter.city}
               onChange={(e) => setFilter({...filter, city: e.target.value})}
               style={{ flex: 1, padding: '12px 20px', borderRadius: '30px', border: '1px solid #ddd', outline: 'none' }}
             />
             <button type="submit" className="btn-premium primary">Search</button>
          </form>

          <div className="explore-filters" style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
            <select value={filter.sort} onChange={(e) => setFilter({...filter, sort: e.target.value})} style={{ padding: '8px 15px', borderRadius: '20px', border: '1px solid #ddd' }}>
               <option value="recent">Most Recent</option>
               <option value="popular">Most Popular</option>
            </select>
          </div>
        </header>

        <section className="pro-section">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px' }}>
               <div className="res-spinner" style={{ margin: '0 auto' }}></div>
               <p>Fetching public archives...</p>
            </div>
          ) : trips.length === 0 ? (
            <div className="pro-empty">
              <div className="pro-empty-icon">🌍</div>
              <h3>No public journeys found</h3>
              <p>Be the first to share a world-class itinerary with the community!</p>
            </div>
          ) : (
            <div className="pro-trips-grid">
              {trips.map((trip) => (
                <div className="pro-trip-card" key={trip._id} onClick={() => navigate(`/trip/${trip._id}`)} style={{ cursor: 'pointer' }}>
                  <div className="pro-trip-img-wrap">
                    <PlaceImage 
                      placeName={trip.title.includes("Trip") ? trip.destination : trip.title} 
                      city={trip.destination} 
                      className="pro-trip-img" 
                    />
                    <div className="pro-trip-badge">{trip.days} Days</div>
                  </div>
                  <div className="pro-trip-body">
                    <h3 className="pro-trip-title">{trip.title}</h3>
                    <div className="pro-trip-meta">
                      <span>📍 {trip.destination}</span>
                      <span>💰 {formatPrice(trip.totalTripCost)}</span>
                    </div>
                    <div className="pro-trip-stats" style={{ display: 'flex', gap: '15px', marginTop: '10px', fontSize: '0.85rem', color: '#666' }}>
                       <span>❤️ {trip.likes?.length || 0}</span>
                       <span>👁 {trip.views || 0}</span>
                       <span>👤 {trip.userId?.name || "Traveler"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
