import { useLocation, useNavigate } from "react-router-dom";
import MapView from "../components/Map/MapView";
import { DAY_COLORS } from "../constants/dayColors";
import "./results.css";
import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { useSettings } from "../context/SettingsContext";
const API = import.meta.env.VITE_API_URL;

function Results() {
  const navigate = useNavigate();
  const loc = useLocation();
  const { formatPrice, t } = useSettings();

  const [plan, setPlan] = useState(() => {
    if (loc.state?.plan) {
      localStorage.setItem("tripPlan", JSON.stringify(loc.state.plan));
      return loc.state.plan;
    }
    const saved = localStorage.getItem("tripPlan") || sessionStorage.getItem("tripPlan");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (!plan) {
      const saved = localStorage.getItem("tripPlan") || sessionStorage.getItem("tripPlan");
      if (saved) setPlan(JSON.parse(saved));
    }
  }, [plan]);

  const [tripTitle, setTripTitle] = useState("");
  const [travelMode, setTravelMode] = useState("Car");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!plan || !plan.itinerary) {
    return (
      <div className="res-empty">
        <div className="res-empty-icon">🗺️</div>
        <h2>{t("no_trip")}</h2>
        <button onClick={() => navigate("/planner")}>← {t("back_to_planner")}</button>
      </div>
    );
  }

  const days = Object.keys(plan.itinerary);
  const totalDays = days.length;
  const totalPlaces = days.reduce((sum, d) => sum + (plan.itinerary[d]?.places?.length || 0), 0);
  const totalTripCost = plan.totalTripCost || days.reduce((sum, d) => sum + (plan.itinerary[d]?.estimatedCost || 0), 0);

  const handleSaveTrip = async () => {
    setSaving(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) { alert("Please login first"); return; }
      const token = await user.getIdToken(true);
      const res = await fetch(`${API}/api/profile/trips`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: tripTitle || `${totalDays}-Day Bangalore Trip`,
          city: "Bangalore",
          days: totalDays,
          budget: plan.budget,
          interests: plan.interests,
          itinerary: plan.itinerary,
          totalCost: totalTripCost
        })
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => navigate("/profile"), 1200);
      }
    } catch { alert("Server error"); } finally { setSaving(false); }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Trip link copied to clipboard!");
  };

  return (
    <div className="res-page">
      {/* ── LEFT: MAP SECTION ── */}
      <div className="res-map-section">
        <div className="map-inner-container">
          <MapView plan={plan} />
        </div>
        
        <div className="res-floating-stats">
          <div className="res-stat-pill">
            <span className="pill-icon">💰</span>
            <div className="pill-texts">
              <span className="pill-val">{formatPrice(totalTripCost)}</span>
              <span className="pill-label">{t("total_cost")}</span>
            </div>
          </div>
          <div className="res-stat-pill">
            <span className="pill-icon">📅</span>
            <div className="pill-texts">
              <span className="pill-val">{totalDays} {t("days")}</span>
              <span className="pill-label">Duration</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: PREMIUM INVENTORY PANEL ── */}
      <aside className="res-inventory-panel">
        
        <div className="res-inventory-header">
          <div className="header-top">
            <button className="back-btn" onClick={() => navigate("/planner")}>←</button>
            <div className="header-titles">
              <input 
                type="text" 
                placeholder="Name your adventure..." 
                className="editable-title"
                value={tripTitle}
                onChange={e => setTripTitle(e.target.value)}
              />
              <span className="header-sub">Bengaluru • AI Generated</span>
            </div>
            <button className="share-btn" onClick={handleShare}>🔗</button>
          </div>

          <div className="header-tools">
            <div className="tool-group">
              <label>Travel Mode</label>
              <select value={travelMode} onChange={e => setTravelMode(e.target.value)}>
                <option>Car</option>
                <option>Bike</option>
                <option>Transit</option>
              </select>
            </div>
            <button className="optimize-tool-btn">✨ Optimize</button>
          </div>
        </div>

        <div className="res-itinerary-scroll">
          {/* Weather Widget */}
          <div className="weather-preview-card">
            <div className="weather-info">
              <span className="weather-temp">28°C</span>
              <span className="weather-desc">Sunny • Perfect for travel</span>
            </div>
            <span className="weather-icon">☀️</span>
          </div>

          {days.map((day, idx) => (
            <div key={day} className="premium-day-card" style={{ "--day-accent": DAY_COLORS[idx % DAY_COLORS.length] }}>
              <div className="day-header">
                <div className="day-info">
                  <span className="day-badge">{day}</span>
                  <h3 className="day-title">Exploration Day</h3>
                </div>
                <div className="day-meta">
                  <span>⏱️ {plan.itinerary[day].estimatedHours}h</span>
                  <span>💰 {formatPrice(plan.itinerary[day].estimatedCost)}</span>
                </div>
              </div>

              <div className="place-timeline">
                {plan.itinerary[day].places.map((place, pIdx) => (
                  <div key={pIdx} className="timeline-item">
                    <div className="timeline-marker">
                      <span className="marker-dot"></span>
                      {pIdx < plan.itinerary[day].places.length - 1 && <span className="marker-line"></span>}
                    </div>
                    <div className="timeline-content">
                      <div className="place-card-mini">
                        <div className="place-info-main">
                          <h4>{place.name}</h4>
                          <span className="place-tag">{place.category || "Sightseeing"}</span>
                        </div>
                        <span className="place-cost-mini">{formatPrice(place.estimatedCost || 0)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* REDUCED SIZE SAVE BUTTON INSIDE INVENTORY */}
          <div className="res-inventory-actions">
            <button 
              className={`compact-save-btn ${saved ? "saved" : ""}`} 
              onClick={handleSaveTrip} 
              disabled={saving || saved}
            >
              {saved ? "✓ Trip Saved" : saving ? "Saving..." : "Confirm & Save Plan"}
            </button>
          </div>
        </div>

      </aside>
    </div>
  );
}

export default Results;