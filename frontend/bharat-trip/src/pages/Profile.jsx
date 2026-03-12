import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useSettings } from "../context/SettingsContext";
import "../styles/profile.css";

const API = import.meta.env.VITE_API_URL;

const getToken = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdToken(true);
};

export default function Profile() {
  const navigate = useNavigate();
  const { formatPrice } = useSettings();

  const [dbTrips, setDbTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
        return;
      }
      setFirebaseUser(user);
    });
    return () => unsub();
  }, [navigate]);

  const fetchTrips = async () => {
    if (!firebaseUser) return;
    try {
      const token = await getToken();
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
        img: t.image || "https://images.unsplash.com/photo-1580752300992-559f8e0734e0?w=600&q=80",
      }));
      setDbTrips(formatted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (firebaseUser) fetchTrips();
  }, [firebaseUser]);

  const handleViewOnMap = (trip) => {
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

  const deleteTrip = async (id) => {
    if (!window.confirm("Delete this trip?")) return;
    try {
      const token = await getToken();
      const res = await fetch(`${API}/api/profile/trips/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setDbTrips((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const name = firebaseUser?.displayName || firebaseUser?.email?.split("@")[0] || "Explorer";
  const initial = name.charAt(0).toUpperCase();

  const stats = [
    { label: "Planned", value: dbTrips.length, icon: "🗺️", color: "#3b82f6" },
    { label: "Visits", value: new Set(dbTrips.map(t => t.location)).size, icon: "📍", color: "#10b981" },
    { label: "Saves", value: 0, icon: "🔖", color: "#8b5cf6" },
  ];

  return (
    <div className="pro-page">
      <Navbar />
      <div className="pro-body">
        <header className="pro-hero">
          <div className="pro-hero-inner">
            <div className="pro-avatar">{initial}</div>
            <div className="pro-user-info">
              <h1 className="pro-name">{name}</h1>
              <p className="pro-bio">Ready for your next adventure</p>
            </div>
            <div className="pro-actions">
              <button className="pro-btn-primary" onClick={() => navigate("/planner")}>
                + New Trip
              </button>
              <button className="pro-btn-icon" onClick={() => navigate("/settings")}>⚙️</button>
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
            <h2>Recent Journeys</h2>
            <button className="view-all-btn" onClick={() => navigate("/trips")}>My Trips ›</button>
          </div>

          <div className="pro-trips-grid">
            {loading ? (
              <p>Loading trips...</p>
            ) : dbTrips.length === 0 ? (
              <div className="pro-empty">
                <p>No trips yet. Your journey begins here.</p>
                <button onClick={() => navigate("/planner")}>Plan Now</button>
              </div>
            ) : (
              dbTrips.slice(0, 3).map((trip) => (
                <div className="pro-trip-card" key={trip.id} onClick={() => handleViewOnMap(trip)}>
                  <div className="pro-trip-img-wrap">
                    <img className="pro-trip-img" src={trip.img} alt={trip.title} />
                    <div className="pro-trip-badge">{trip.days}d</div>
                  </div>
                  <div className="pro-trip-body">
                    <h3 className="pro-trip-title">{trip.title}</h3>
                    <div className="pro-trip-meta">📍 {trip.location}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}