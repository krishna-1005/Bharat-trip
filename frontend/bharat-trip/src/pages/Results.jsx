import { useLocation, useNavigate } from "react-router-dom";
import MapView from "../components/Map/MapView";
import HoverPlaceCard from "../components/Map/HoverPlaceCard";
import { DAY_COLORS } from "../constants/dayColors";
import PlaceImage from "../components/PlaceImage";
import GuidancePanel from "../components/Map/GuidancePanel";
import "./results.css";
import { useState, useEffect, useMemo } from "react";
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
  const [showMap, setShowMap] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [isGuidanceMode, setIsGuidanceMode] = useState(false);
  const [hoveredPlace, setHoveredPlace] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [weather, setWeather] = useState({ temp: "--", desc: "Loading...", icon: "☁️" });
  const [currentIndex, setCurrentIndex] = useState(() => {
    const saved = localStorage.getItem("tripCurrentIndex");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    let watchId = null;
    if (isTracking) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.log("Tracking error:", error),
        { enableHighAccuracy: true }
      );
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.log("Location error:", error),
        { enableHighAccuracy: true }
      );
    }
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isTracking]);

  useEffect(() => {
    localStorage.setItem("tripCurrentIndex", currentIndex);
  }, [currentIndex]);

  const handleUndo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const resetProgress = () => {
    if (window.confirm("Are you sure you want to reset your trip progress?")) {
      setCurrentIndex(0);
      setIsGuidanceMode(false);
    }
  };

  const allPlaces = useMemo(() => {
    if (!plan || !plan.itinerary) return [];
    const days = Object.keys(plan.itinerary);
    return days.flatMap(d => plan.itinerary[d]?.places || []);
  }, [plan?.itinerary]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
            coordinates: data.coordinates, // Use coordinates from DB if available
            days: data.days,
            itinerary: data.itinerary,
            isShared: true,
            totalTripCost: data.totalTripCost,
            travelerType: data.travelerType,
            pace: data.pace
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
      // Reset progress for a brand new plan from the planner
      setCurrentIndex(0);
      localStorage.setItem("tripCurrentIndex", 0);
      setLoading(false);
    } else {
      const savedPlan = localStorage.getItem("tripPlan");
      if (savedPlan) {
        setPlan(JSON.parse(savedPlan));
      }
      setLoading(false);
    }
  }, [loc.search, loc.state]);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!plan?.coordinates) return;
      const { lat, lng } = plan.coordinates;
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`);
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
  }, [plan?.coordinates]);

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

  const daysKeys = Object.keys(plan.itinerary);
  const totalDays = daysKeys.length;
  
  const totalTripCost = plan.totalTripCost || daysKeys.reduce((total, dayKey) => {
    const day = plan.itinerary[dayKey];
    const placesCost = day.places.reduce((sum, p) => sum + (p.avgCost || 200), 0);    const mealCost = day.dayMealCost || 0;
    return total + placesCost + mealCost;
  }, 0);

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
          totalCost: totalTripCost,
          travelerType: plan.travelerType,
          pace: plan.pace
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
      {saved && (
        <div className="res-success-overlay">
          <div className="res-success-card">
            <div className="success-icon">✨</div>
            <h2>Adventure Saved!</h2>
            <p>Your trip to {plan.city || "Bengaluru"} is ready.</p>
            <div className="success-image-previews">
              <PlaceImage placeName={plan.city || "Bengaluru"} city={plan.city || "Bengaluru"} className="success-preview-img" />
            </div>
            <p className="success-redirect">Redirecting to your trips...</p>
          </div>
        </div>
      )}

      {/* MOBILE HEADER (Always Visible) */}
      <div className="res-mobile-header">
        <button className="mobile-back-btn" onClick={() => navigate("/planner")}>←</button>
        <div className="mobile-header-center">
          <h3>{tripTitle || "Your Trip"}</h3>
          <span>{plan.city || "Bengaluru"} • {totalDays} Days</span>
        </div>
        <button className="mobile-share-btn" onClick={handleShare}>🔗</button>
      </div>

      {/* MOBILE TOGGLE (Mobile Only: <= 768px) */}
      {windowWidth <= 768 && (
        <div className="res-mobile-toggle">
          <button className={!showMap ? "active" : ""} onClick={() => setShowMap(false)}>
            <span className="toggle-icon">📋</span> List
          </button>
          <button className={showMap ? "active" : ""} onClick={() => setShowMap(true)}>
            <span className="toggle-icon">🗺️</span> Map
          </button>
        </div>
      )}

      {windowWidth > 900 && (
        <aside className="res-details-panel">
          {hoveredPlace ? (
            <HoverPlaceCard place={hoveredPlace} city={plan.city} />
          ) : (
            <div className="details-placeholder">
              <div className="placeholder-icon">📍</div>
              <h3>Location Details</h3>
              <p>Hover over a marker on the map to see original reviews and details.</p>
            </div>
          )}
        </aside>
      )}

      <div className="res-map-section">
        <div className="map-inner-container">
          <MapView 
            plan={plan} 
            isTracking={isTracking} 
            onHover={setHoveredPlace} 
            isGuidanceMode={isGuidanceMode}
            setIsGuidanceMode={setIsGuidanceMode}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            userLocation={userLocation}
          />
        </div>
        <div className="res-floating-stats">
          <button 
            className={`res-stat-pill tracking-btn ${isGuidanceMode ? "active" : ""}`}
            onClick={() => setIsGuidanceMode(!isGuidanceMode)}
            title={isGuidanceMode ? "Stop Guidance" : "Start Step-by-Step Guidance"}
          >
            <span className="pill-icon">{isGuidanceMode ? "⏹️" : "🧭"}</span>
            <div className="pill-texts">
              <span className="pill-val">{isGuidanceMode ? "Guidance ON" : "Guide Me"}</span>
              <span className="pill-label">{isGuidanceMode ? "ACTIVE" : "STEP-BY-STEP"}</span>
            </div>
          </button>
          <button 
            className={`res-stat-pill tracking-btn ${isTracking ? "active" : ""}`}
            onClick={() => setIsTracking(!isTracking)}
            title={isTracking ? "Stop Live Tracking" : "Start Live Tracking"}
          >
            <span className="pill-icon">{isTracking ? "📡" : "📍"}</span>
            <div className="pill-texts">
              <span className="pill-val">{isTracking ? "Tracking..." : "Live Track"}</span>
              <span className="pill-label">{isTracking ? "ON" : "OFF"}</span>
            </div>
          </button>
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
              <span className="header-sub">
                {plan.city || "Bengaluru"} • {plan.travelerType || "Solo"} • {plan.pace || "Moderate"} Pace
              </span>
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
          {/* CURRENT DESTINATION FOCUS CARD */}
          {currentIndex < allPlaces.length ? (
            <div className="current-dest-focus-card">
              <div className="focus-label">NEXT STOP</div>
              <div className="focus-card-body">
                <PlaceImage 
                  placeName={allPlaces[currentIndex].name} 
                  city={plan.city || "Bengaluru"} 
                  className="focus-card-img" 
                />
                <div className="focus-card-info">
                  <h3>{allPlaces[currentIndex].name}</h3>
                  <p>{allPlaces[currentIndex].category || "Sightseeing"}</p>
                  <div className="focus-card-actions">
                    <button 
                      className="focus-btn mark-visited"
                      onClick={() => setCurrentIndex(prev => prev + 1)}
                    >
                      ✓ Mark Visited
                    </button>
                    {currentIndex > 0 && (
                      <button 
                        className="focus-btn undo-visited"
                        onClick={handleUndo}
                      >
                        ↩ Undo Last
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="trip-completion-card">
              <span className="completion-emoji">🎉</span>
              <h3>Trip Completed!</h3>
              <p>You've visited all planned locations.</p>
              <button className="focus-btn undo-visited" onClick={handleUndo}>
                ↩ Undo Last Stop
              </button>
            </div>
          )}

          <div className="weather-preview-card">
            <div className="weather-info">
              <span className="weather-temp">{weather.temp}</span>
              <span className="weather-desc">{weather.desc}</span>
            </div>
            <span className="weather-icon">{weather.icon}</span>
          </div>

          {(() => {
            let globalPlaceIdx = 0;
            return daysKeys.map((day, idx) => {
              const dayData = plan.itinerary[day];
              const placesCost = dayData.places.reduce((sum, p) => sum + (p.estimatedCost || 0), 0);
              const mealCost = dayData.dayMealCost || 0;

              return (
                <div key={day} className="premium-day-card" style={{ "--day-accent": DAY_COLORS[idx % DAY_COLORS.length] }}>
                  <div className="day-header">
                    <div className="day-info">
                      <span className="day-badge">{day}</span>
                      <h3 className="day-title">Exploration Day</h3>
                    </div>
                    <div className="day-meta">
                      <span>⏱️ {dayData.estimatedHours}h</span>
                      <span>💰 {formatPrice(dayData.estimatedCost || (placesCost + mealCost))}</span>
                    </div>
                  </div>

                  <div className="place-timeline">
                    {dayData.places.map((place, pIdx) => {
                      const pGlobalIdx = globalPlaceIdx++;
                      const isVisited = pGlobalIdx < currentIndex;
                      const isCurrent = pGlobalIdx === currentIndex;
                      
                      const prevPlace = pIdx > 0 ? dayData.places[pIdx - 1] : null;
                      const distance = prevPlace ? getDistance(prevPlace.lat, prevPlace.lng, place.lat, place.lng) : 0;
                      const travelTime = prevPlace ? getTravelTime(distance) : null;

                      return (
                        <div key={pIdx} className={`timeline-item ${isVisited ? "visited" : ""} ${isCurrent ? "current" : ""}`}>
                          <div className="timeline-marker">
                            <span className="marker-dot"></span>
                            {pIdx < dayData.places.length - 1 && <span className="marker-line"></span>}
                          </div>
                          <div className="timeline-content">
                            <div className="place-card-mini">
                              <PlaceImage 
                                placeName={place.name} 
                                city={plan.city || "Bengaluru"} 
                                className="mini-card-img" 
                              />
                              <div className="place-info-main">
                                <h4 style={{ textDecoration: isVisited ? 'line-through' : 'none', opacity: isVisited ? 0.6 : 1 }}>
                                  {place.name}
                                </h4>
                                <p style={{
                                  fontSize: "11px",
                                  color: "var(--text-dim)",
                                  marginTop: "4px",
                                  fontStyle: "italic"
                                }}>
                                  {place.reason}
                                </p>
                                <div className="place-badge-row">
                                  <span className="place-tag">{place.category || "Sightseeing"}</span>
                                  {travelTime && (
                                    <span className="travel-time-badge">
                                      {travelMode === "Bike" ? "🏍️" : travelMode === "Car" ? "🚗" : "🚌"} {travelTime}
                                    </span>
                                  )}
                                </div>
                                {place.description && (
                                  <p className="place-description-mini" style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', fontStyle: 'italic', lineHeight: '1.3' }}>
                                    {place.description}
                                  </p>
                                )}
                              </div>
                              <div className="place-actions-mini">
                                {isVisited ? (
                                  <button className="visited-tick active" title="Visited">✓</button>
                                ) : (
                                  <button 
                                    className={`visited-tick ${isCurrent ? "next-up" : ""}`} 
                                    onClick={() => setCurrentIndex(pGlobalIdx + 1)}
                                    title="Mark as visited"
                                  >
                                    {isCurrent ? "Mark Visited" : "○"}
                                  </button>
                                )}
                                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', marginTop: '4px' }}>
                                  <span className="place-cost-mini">{formatPrice(place.avgCost || 200)}</span>
                                  <span style={{ fontSize: '8px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>{place.estimatedCost > 0 ? 'Est.' : ''}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {mealCost > 0 && (
                      <div className="timeline-item" style={{ opacity: 0.8, marginTop: '8px' }}>
                        <div className="timeline-marker"><span className="marker-dot" style={{ background: '#94a3b8' }}></span></div>
                        <div className="timeline-content">
                          <div className="place-card-mini" style={{ borderStyle: 'dashed', background: 'transparent' }}>
                            <div style={{ fontSize: '20px', padding: '0 10px' }}>🍴</div>
                            <div className="place-info-main">
                              <h4>Estimated Meals</h4>
                              <span className="place-tag">Food & Dining</span>
                            </div>
                            <span className="place-cost-mini">{formatPrice(mealCost)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            });
          })()}

          {!plan.isShared && (
            <div className="res-inventory-actions">
              <button 
                className={`compact-save-btn ${saved ? "saved" : ""}`} 
                onClick={handleSaveTrip} 
                disabled={saving || saved}
              >
                {saved ? "✓ Trip Saved" : saving ? "Saving..." : "Confirm & Save Plan"}
              </button>
              
              <button className="reset-trip-btn" onClick={resetProgress}>
                ↺ Reset All Progress
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
