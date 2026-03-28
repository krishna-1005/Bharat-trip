import { useLocation, useNavigate } from "react-router-dom";
import MapView from "../components/Map/MapView";
import HoverPlaceCard from "../components/Map/HoverPlaceCard";
import { DAY_COLORS } from "../constants/dayColors";
import PlaceImage from "../components/PlaceImage";
import "./results.css";
import { useState, useEffect, useMemo, useContext } from "react";
import { useSettings } from "../context/SettingsContext";
import { AuthContext } from "../context/AuthContext";
const API = import.meta.env.VITE_API_URL;

function Results() {
  const navigate = useNavigate();
  const loc = useLocation();
  const { formatPrice, t } = useSettings();
  const { user } = useContext(AuthContext);

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
  const [scrollRef, setScrollRef] = useState(null);

  useEffect(() => {
    if (currentIndex >= 0 && isGuidanceMode) {
      const activeCard = document.querySelector(`.timeline-item.current`);
      if (activeCard) {
        activeCard.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentIndex, isGuidanceMode]);

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
    const city = plan.city || "Bangalore";
    return days.flatMap(d => (plan.itinerary[d]?.places || []).map(p => ({ ...p, city })));
  }, [plan?.itinerary, plan?.city]);

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
    if (saving || saved) return;
    setSaving(true);
    try {
      if (!user) {
        alert("Please login to save your trip plan.");
        setSaving(false);
        return;
      }
      
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication error. Please login again.");
        setSaving(false);
        return;
      }

      const res = await fetch(`${API}/api/profile/trips`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          title: tripTitle || `${totalDays}-Day ${plan.city || "India"} Trip`,
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
        // Short delay for visual feedback then redirect to profile as requested
        setTimeout(() => {
          navigate("/profile");
        }, 1000);
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Failed to save trip: ${errorData.message || "Unknown server error"}`);
        setSaving(false);
      }
    } catch (err) {
      console.error("Save trip error:", err);
      alert("Network error. Please check your connection and try again.");
      setSaving(false);
    }
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
    <div className="anchored-planner-root">
      {/* 1. MAP BASE LAYER */}
      <div className="planner-map-foundation">
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

      {/* 2. TOP NAVBAR */}
      <nav className="planner-glass-nav">
        <div className="nav-brand-group">
          <span className="brand-logo">🇮🇳</span>
          <span className="brand-name">Bharat Trip</span>
        </div>
        <div className="nav-links-center">
          <button onClick={() => navigate("/")}>Home</button>
          <button onClick={() => navigate("/create-poll")}>Poll</button>
          <button className="active">Planner</button>
        </div>
        <div className="nav-user-actions">
          <div className="nav-user-avatar" onClick={() => navigate("/profile")}>
            {user?.photoURL ? <img src={user.photoURL} alt="P" className="nav-avatar-img" /> : "👤"}
          </div>
        </div>
      </nav>

      {/* 3. LEFT ANCHOR: GUIDE CARD */}
      <div className="anchor-top-left">
        <div className="guide-assistant-card">
          {currentIndex < allPlaces.length ? (
            <>
              <div className="guide-group now">
                <span className="guide-badge now">VISIT NOW</span>
                <h2 className="guide-title">{allPlaces[currentIndex].name}</h2>
                <p className="guide-meta">📍 {userLocation ? "7.6 km away" : "Calculating distance..."}</p>
              </div>

              <div className="guide-divider-mini"></div>

              {allPlaces[currentIndex + 1] && (
                <div className="guide-group next">
                  <span className="guide-badge next">NEXT UP</span>
                  <h3 className="guide-title-sm">{allPlaces[currentIndex + 1].name}</h3>
                  <p className="guide-meta-sm">🚗 {plan.pace || "Moderate"} Pace</p>
                </div>
              )}

              <button className="guide-action-btn" onClick={() => setCurrentIndex(prev => prev + 1)}>
                Mark as Visited & Continue →
              </button>
            </>
          ) : (
            <div className="guide-completion-state">
              <span className="emoji">🏁</span>
              <h3>Trip Completed</h3>
              <button className="guide-action-btn" onClick={() => window.location.reload()}>New Adventure</button>
            </div>
          )}
        </div>
      </div>

      {/* 4. RIGHT ANCHOR: JOURNEY TIMELINE */}
      <div className="anchor-top-right">
        <aside className="journey-timeline-panel">
          <div className="timeline-header-fixed">
            <div className="timeline-progress-group">
              <span className="section-label">JOURNEY PROGRESS</span>
              <span className="progress-percentage-text">{Math.round((currentIndex / allPlaces.length) * 100)}%</span>
            </div>
            <div className="timeline-progress-bar">
              <div className="t-fill" style={{ width: `${(currentIndex / allPlaces.length) * 100}%` }}></div>
            </div>
          </div>

          <div className="timeline-scroll-area">
            {daysKeys.map((day, dIdx) => (
              <div key={day} className="timeline-day-block">
                <div className="day-indicator">
                  <span className="day-text">{day}</span>
                  <div className="day-line"></div>
                </div>

                <div className="stops-container">
                  {plan.itinerary[day].places.map((place, pIdx) => {
                    // Find global index to sync with currentIndex
                    let globalIdx = 0;
                    for (let i = 0; i < dIdx; i++) globalIdx += plan.itinerary[daysKeys[i]].places.length;
                    const idx = globalIdx + pIdx;

                    const isVisited = idx < currentIndex;
                    const isCurrent = idx === currentIndex;
                    const isUpcoming = idx > currentIndex;
                    
                    const shortInsight = place.reason 
                      ? place.reason.split(/[.!?]/)[0] + " ✨" 
                      : "Explore local highlights";

                    return (
                      <div 
                        key={idx} 
                        className={`premium-stop-card ${isVisited ? "visited" : ""} ${isCurrent ? "active" : ""} ${isUpcoming ? "upcoming" : ""}`}
                        onClick={() => setHoveredPlace(place)}
                      >
                        <div className="stop-spine">
                          <div className="spine-marker">
                            {isVisited ? "✓" : isCurrent ? "●" : ""}
                          </div>
                          {!(dIdx === daysKeys.length - 1 && pIdx === plan.itinerary[day].places.length - 1) && (
                            <div className="spine-connect"></div>
                          )}
                        </div>

                        <div className="stop-content">
                          <div className="stop-main-row">
                            <PlaceImage 
                              placeName={place.name} 
                              city={plan.city || "Bangalore"} 
                              className="stop-img-premium" 
                            />
                            <div className="stop-text-meta">
                              <h4 className="stop-name-premium">{place.name}</h4>
                              <div className="stop-pills-row">
                                <span className="p-tag">{place.category || "Sight"}</span>
                                <span className="p-meta">⏱️ 1.5h</span>
                                <span className="p-meta">💰 {formatPrice(place.avgCost || 200)}</span>
                              </div>
                            </div>
                          </div>

                          {isCurrent && (
                            <div className="stop-active-details">
                              <p className="stop-ai-tip-premium">{shortInsight}</p>
                              <button className="done-action-btn" onClick={(e) => {
                                e.stopPropagation();
                                setCurrentIndex(idx + 1);
                              }}>
                                Mark as Done →
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="timeline-footer-actions">
            <div className="footer-stats-summary">
               <div className="f-stat">
                  <span className="f-label">TOTAL BUDGET</span>
                  <span className="f-val">{formatPrice(totalTripCost)}</span>
               </div>
            </div>
            <button 
              className={`premium-save-btn ${saving ? "loading" : ""}`} 
              onClick={handleSaveTrip}
              disabled={saving || saved}
            >
              {saved ? "✓ Saved to Profile" : saving ? "Saving Journey..." : "Save Plan to Profile"}
            </button>
          </div>
        </aside>
      </div>

      {/* 5. BOTTOM ANCHOR: CONTROL BAR */}
      <div className="anchor-bottom-center">
        <div className="floating-control-pill">
          <div className="control-section" onClick={() => setIsGuidanceMode(!isGuidanceMode)}>
            <span className={`status-dot ${isGuidanceMode ? "on" : "off"}`}></span>
            Guide {isGuidanceMode ? "ON" : "OFF"}
          </div>
          <div className="control-divider"></div>
          <div className="control-section" onClick={() => setIsTracking(!isTracking)}>
            <span className={`status-dot ${isTracking ? "on" : "off"}`}></span>
            Live Track {isTracking ? "ON" : "OFF"}
          </div>
          <div className="control-divider"></div>
          <div className="control-section price">
            <span className="price-label">EST. TOTAL</span>
            <span className="price-val">{formatPrice(totalTripCost)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Results;
