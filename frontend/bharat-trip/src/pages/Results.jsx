import { useLocation, useNavigate } from "react-router-dom";
import MapView from "../components/Map/MapView";
import { DAY_COLORS } from "../constants/dayColors";
import PlaceImage from "../components/PlaceImage";
import "./results.css";
import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { useSettings } from "../context/SettingsContext";
const API = import.meta.env.VITE_API_URL;

function Results() {
  const navigate = useNavigate();
  const loc = useLocation();
  const { formatPrice, t } = useSettings();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tripTitle, setTripTitle] = useState("");
  const [travelMode, setTravelMode] = useState("Car");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showMap, setShowMap] = useState(false); // Mobile toggle
  const [weather, setWeather] = useState({ temp: "--", desc: "Loading...", icon: "☁️" });

  useEffect(() => {
    const params = new URLSearchParams(loc.search);
    const sharedTripId = params.get("sharedTripId");

    const fetchSharedTrip = async (id) => {
      try {
        const res = await fetch(`${API}/api/trips/${id}`);
        const data = await res.json();
        if (res.ok) {
          const formattedPlan = {
            city: data.destination || "Bangalore",
            days: data.days,
            itinerary: data.itinerary,
            isShared: true
          };
          setPlan(formattedPlan);
          setTripTitle(data.title);
        }
      } catch (err) {
        console.error("Error fetching shared trip:", err);
      } finally {
        setLoading(false);
      }
    };

    if (sharedTripId) {
      fetchSharedTrip(sharedTripId);
    } else if (loc.state?.plan) {
      setPlan(loc.state.plan);
      setLoading(false);
    } else {
      const savedPlan = localStorage.getItem("tripPlan");
      if (savedPlan) {
        setPlan(JSON.parse(savedPlan));
      }
      setLoading(false);
    }
  }, [loc.search, loc.state]);

  // Live Weather Fetch
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=12.9716&longitude=77.5946&current_weather=true");
        const data = await res.json();
        const code = data.current_weather.weathercode;
        
        let desc = "Clear Skies";
        let icon = "☀️";
        if (code > 0 && code < 45) { desc = "Partly Cloudy"; icon = "⛅"; }
        else if (code >= 45 && code < 60) { desc = "Foggy"; icon = "🌫️"; }
        else if (code >= 60) { desc = "Rainy"; icon = "🌧️"; }

        setWeather({ 
          temp: Math.round(data.current_weather.temperature) + "°C", 
          desc: `${desc} • Perfect for travel`,
          icon 
        });
      } catch {
        setWeather({ temp: "28°C", desc: "Sunny • Perfect for travel", icon: "☀️" });
      }
    };
    fetchWeather();
  }, []);

  if (loading) {
    return <div className="res-empty"><h2>Loading Trip...</h2></div>;
  }

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
          city: plan.city || "Bangalore",
          days: totalDays,
          budget: plan.budget,
          interests: plan.interests,
          itinerary: plan.itinerary,
          totalCost: totalTripCost
        })
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => navigate("/trips"), 1200);
      }
    } catch { alert("Server error"); } finally { setSaving(false); }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Trip link copied to clipboard!");
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getTravelTime = (dist) => {
    if (!dist || dist < 0.1) return null;
    let speed = 25; 
    if (travelMode === "Bike") speed = 30;
    if (travelMode === "Transit") speed = 15;
    const hours = dist / speed;
    const mins = Math.round(hours * 60);
    if (mins < 1) return "1 min";
    if (mins < 60) return `${mins} mins`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className={`res-page ${showMap ? "mobile-map-active" : ""}`}>
      {/* ── MOBILE TOGGLE ── */}
      <div className="res-mobile-toggle">
        <button className={!showMap ? "active" : ""} onClick={() => setShowMap(false)}>List</button>
        <button className={showMap ? "active" : ""} onClick={() => setShowMap(true)}>Map</button>
      </div>

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
                readOnly={plan.isShared}
              />
              <span className="header-sub">{plan.city || "Bengaluru"} • {plan.isShared ? "Shared Trip" : "AI Generated"}</span>
            </div>
            <button className="share-btn" onClick={handleShare} title="Copy Link">🔗</button>
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
          <div className="weather-preview-card">
            <div className="weather-info">
              <span className="weather-temp">{weather.temp}</span>
              <span className="weather-desc">{weather.desc}</span>
            </div>
            <span className="weather-icon">{weather.icon}</span>
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
                {plan.itinerary[day].places.map((place, pIdx) => {
                  const prevPlace = pIdx > 0 ? plan.itinerary[day].places[pIdx - 1] : null;
                  const distance = prevPlace ? getDistance(prevPlace.lat, prevPlace.lng, place.lat, place.lng) : 0;
                  const travelTime = prevPlace ? getTravelTime(distance) : null;

                  return (
                    <div key={pIdx} className="timeline-item">
                      <div className="timeline-marker">
                        <span className="marker-dot"></span>
                        {pIdx < plan.itinerary[day].places.length - 1 && <span className="marker-line"></span>}
                      </div>
                      <div className="timeline-content">
                        <div className="place-card-mini">
                          <PlaceImage 
                            placeName={place.name} 
                            city={plan.city || "Bengaluru"} 
                            className="mini-card-img" 
                          />
                          <div className="place-info-main">
                            <h4>{place.name}</h4>
                            <div className="place-badge-row">
                              <span className="place-tag">{place.category || "Sightseeing"}</span>
                              {travelTime && (
                                <span className="travel-time-badge">
                                  {travelMode === "Bike" ? "🏍️" : travelMode === "Car" ? "🚗" : "🚌"} {travelTime}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="place-cost-mini">{formatPrice(place.estimatedCost || 0)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {!plan.isShared && (
            <div className="res-inventory-actions">
              <button 
                className={`compact-save-btn ${saved ? "saved" : ""}`} 
                onClick={handleSaveTrip} 
                disabled={saving || saved}
              >
                {saved ? "✓ Trip Saved" : saving ? "Saving..." : "Confirm & Save Plan"}
              </button>
            </div>
          )}
          
          {plan.isShared && (
            <div className="res-inventory-actions">
              <button className="compact-save-btn" onClick={() => navigate("/planner")}>
                Plan Your Own Trip
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

export default Results;