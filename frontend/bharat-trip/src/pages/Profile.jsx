import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import SavedTrips from "../components/SavedTrips";
import SavedMaps from "../components/SavedMaps";
import "../styles/profile.css";

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "");

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { formatPrice } = useSettings();

  const [dbTrips, setDbTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setProfileData(data.user);
    } catch (err) {
      console.warn("Could not fetch profile details", err);
    }
  };

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
    if (user) {
      fetchTrips();
      fetchProfile();
    }
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

  const travelTags = profileData?.preferences?.travelStyleTags || [];

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
              
              {travelTags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                  {travelTags.map(tag => (
                    <span key={tag} style={{ 
                      fontSize: '10px', 
                      background: 'rgba(59, 130, 246, 0.1)', 
                      color: '#60a5fa', 
                      padding: '4px 10px', 
                      borderRadius: '100px',
                      fontWeight: '800',
                      border: '1px solid rgba(59, 130, 246, 0.2)'
                    }}>
                      ✦ {tag.toUpperCase()}
                    </span>
                  ))}
                </div>
              )}

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

        {/* Section 1: Saved Trips (Finalized from Polls) */}
        <section className="pro-section">
          <div className="section-header">
            <h2>Saved Trips <span style={{ color: 'var(--text-dim)', fontSize: '1rem', fontWeight: '500' }}>(Finalized)</span></h2>
          </div>
          <SavedTrips />
        </section>

        {/* Section 2: Saved Maps / Plans (Existing) */}
        <section className="pro-section">
          <div className="section-header">
            <h2>Saved Maps / Plans</h2>
            <button className="view-all-btn" onClick={() => navigate("/trips")}>See All Plans →</button>
          </div>
          <SavedMaps 
            dbTrips={dbTrips} 
            loading={loading} 
            handleViewTrip={handleViewTrip} 
            formatPrice={formatPrice}
          />
        </section>
      </div>
    </div>
  );
}
