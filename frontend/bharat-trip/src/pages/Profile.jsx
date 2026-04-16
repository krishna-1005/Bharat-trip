import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { auth } from "../firebase";
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
    try {
      let token = await auth.currentUser?.getIdToken(true);
      if (!token && user?.token) token = user.token;
      if (!token) return;
      
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
      let token = await auth.currentUser?.getIdToken(true);
      if (!token && user?.token) token = user.token;
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
            <div className="pro-avatar-wrap">
              <div className="pro-avatar">{initial}</div>
              <div className="pro-avatar-glow"></div>
            </div>
            
            <div className="pro-user-info">
              <div className="pro-badge-row desktop-only">
                <span className="pro-status-badge premium">Premium Member</span>
                <span className="pro-status-badge verified">Verified Traveler</span>
              </div>
              
              <h1 className="pro-name">{name}</h1>
              <p className="pro-bio">Adventurer • Explorer • Storyteller</p>
              
              <div className="pro-badge-row mobile-only">
                <span className="pro-status-badge premium">Premium</span>
                <span className="pro-status-badge verified">Verified</span>
              </div>

              {travelTags.length > 0 && (
                <div className="pro-tags-row">
                  {travelTags.map(tag => (
                    <span key={tag} className="pro-tag">
                      ✦ {tag.toUpperCase()}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pro-actions">
              <button className="btn-premium primary" onClick={() => navigate("/planner")}>
                <span className="btn-icon">✨</span>
                <span className="btn-text">New Journey</span>
              </button>
              <button className="btn-premium outline icon-only" onClick={() => navigate("/settings")}>
                ⚙️
              </button>
            </div>
          </div>
        </header>

        <div className="pro-stats">
          {stats.map((s, i) => (
            <div key={i} className="pro-stat-card">
              <div className="pro-stat-icon-wrap" style={{ background: `${s.color}15`, color: s.color }}>
                {s.icon}
              </div>
              <div className="pro-stat-info">
                <span className="pro-stat-value">{s.value}</span>
                <span className="pro-stat-label">{s.label}</span>
              </div>
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
