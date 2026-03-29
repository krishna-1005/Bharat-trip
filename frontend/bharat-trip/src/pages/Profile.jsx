import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import PlaceImage from "../components/PlaceImage";
import "../styles/profile.css";

const API = import.meta.env.VITE_API_URL;

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { formatPrice } = useSettings();

  const [dbTrips, setDbTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const fetchTrips = async () => {
    if (!user) return;
    try {
      const token = user.token || localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API}/api/profile/trips`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        console.error(data.error);
        return;
      }
      const formatted = (data.trips || []).map((t) => ({
        id: t._id,
        title: t.title || "Custom Trip",
        dates: t.dates || new Date(t.createdAt).toLocaleDateString(),
        location: t.destination || t.city || "Bangalore",
        status: t.status || "upcoming",
        budget: t.budget,
        days: t.days,
        totalCost: t.totalTripCost,
        itinerary: t.itinerary,
      }));
      setDbTrips(formatted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchTrips();
  }, [user]);

  const handleViewTrip = (trip) => {
    const itineryObj = {};
    if (Array.isArray(trip.itinerary)) {
      trip.itinerary.forEach((d, idx) => {
        const key = d.day || `Day ${idx + 1}`;
        itineryObj[key] = {
          places: d.places,
          estimatedCost: d.estimatedCost,
          estimatedHours: d.estimatedHours,
          color: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"][idx % 4]
        };
      });
    }
    const planData = {
      city: trip.location,
      days: trip.days,
      itinerary: Object.keys(itineryObj).length > 0 ? itineryObj : trip.itinerary,
      totalTripCost: trip.totalCost,
      isSaved: true
    };
    localStorage.setItem("tripPlan", JSON.stringify(planData));
    navigate("/results", { state: { plan: planData } });
  };

  const name = user?.name || user?.email?.split("@")[0] || "Explorer";
  const initial = name.charAt(0).toUpperCase();

  const stats = [
    { label: "Trips Planned", value: dbTrips.length, icon: "🗺️", color: "#3b82f6" },
    { label: "Cities Explored", value: new Set(dbTrips.map(t => t.location)).size, icon: "📍", color: "#10b981" },
    { label: "Global Ranking", value: "Top 5%", icon: "🏆", color: "#f59e0b" },
  ];

  return (
    <div className="pro-page">
      <div className="pro-body">
        <header className="pro-hero">
          <div className="pro-hero-inner">
            <div className="pro-avatar">{initial}</div>
            <div className="pro-user-info">
              <h1 className="pro-name">{name}</h1>
              <p className="pro-bio">Adventurer • Explorer • Storyteller</p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <span className="pro-trip-badge" style={{ position: 'static', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>Premium Member</span>
                <span className="pro-trip-badge" style={{ position: 'static', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>Verified Traveler</span>
              </div>
            </div>
            <div className="pro-actions">
              <button className="btn-premium primary" onClick={() => navigate("/planner")}>
                + New Journey
              </button>
              <button className="btn-premium outline" style={{ width: '56px', height: '56px', padding: 0 }} onClick={() => navigate("/settings")}>
                ⚙️
              </button>
            </div>
          </div>
        </header>

        <div className="pro-stats">
          {stats.map((s, i) => (
            <div key={i} className="pro-stat-card">
              <div className="pro-stat-header">
                <span className="pro-stat-icon" style={{ background: `${s.color}15`, color: s.color }}>{s.icon}</span>
                <span className="pro-stat-label">{s.label}</span>
              </div>
              <span className="pro-stat-value">{s.value}</span>
            </div>
          ))}
        </div>

        <section className="pro-section">
          <div className="section-header">
            <h2>Recent Adventures</h2>
            <button className="view-all-btn" onClick={() => navigate("/trips")}>See All Trips →</button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>Discovering your journeys...</p>
            </div>
          ) : dbTrips.length === 0 ? (
            <div className="pro-empty">
              <div className="pro-empty-icon">🌍</div>
              <h3>The world is waiting</h3>
              <p>Your journey list is empty. Let's start planning your next masterpiece.</p>
              <button className="btn-premium primary" style={{ marginTop: '12px' }} onClick={() => navigate("/planner")}>Plan Now</button>
            </div>
          ) : (
            <div className="pro-trips-grid">
              {dbTrips.slice(0, 3).map((trip) => (
                <div className="pro-trip-card" key={trip.id} onClick={() => handleViewTrip(trip)} style={{ cursor: 'pointer' }}>
                  <div className="pro-trip-img-wrap">
                    <PlaceImage 
                      placeName={trip.title.includes("Trip") ? trip.location : trip.title} 
                      city={trip.location} 
                      className="pro-trip-img" 
                    />
                    <div className="pro-trip-badge">{trip.days} Days</div>
                  </div>
                  <div className="pro-trip-body">
                    <h3 className="pro-trip-title">{trip.title}</h3>
                    <div className="pro-trip-meta">
                      <span>📍 {trip.location}</span>
                      <span>💰 {formatPrice(trip.totalCost)}</span>
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
