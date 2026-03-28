import { useLocation, useNavigate } from "react-router-dom";
import MapView from "../components/Map/MapView";
import { DAY_COLORS } from "../constants/dayColors";
import PlaceImage from "../components/PlaceImage";
import "./results.css";
import { useState, useEffect, useMemo, useContext } from "react";
import { useSettings } from "../context/SettingsContext";
import { AuthContext } from "../context/AuthContext";
import { auth } from "../firebase";
const API = import.meta.env.VITE_API_URL;

function Results() {
  const navigate = useNavigate();
  const loc = useLocation();
  const { formatPrice, t } = useSettings();
  const { user } = useContext(AuthContext);

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tripTitle, setTripTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [isGuidanceMode, setIsGuidanceMode] = useState(false);
  const [hoveredPlace, setHoveredPlace] = useState(null);
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

  const allPlaces = useMemo(() => {
    if (!plan || !plan.itinerary) return [];
    const days = Object.keys(plan.itinerary);
    const city = plan.city || "Bangalore";
    return days.flatMap(d => (plan.itinerary[d]?.places || []).map(p => ({ ...p, city })));
  }, [plan?.itinerary, plan?.city]);

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
            coordinates: data.coordinates,
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

  if (loading) {
    return <div className="res-empty"><h2>Loading Your Premium Trip...</h2></div>;
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
    const placesCost = day.places.reduce((sum, p) => sum + (p.avgCost || 200), 0);
    const mealCost = day.dayMealCost || 0;
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
      
      let token = localStorage.getItem("token");
      if (auth.currentUser) {
        try {
          token = await auth.currentUser.getIdToken(true);
          localStorage.setItem("token", token);
        } catch (tokenErr) {
          console.error("Failed to refresh Firebase token:", tokenErr);
        }
      }

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
        setTimeout(() => navigate("/profile"), 1000);
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Failed to save trip: ${errorData.error || "Unknown server error"}`);
        setSaving(false);
      }
    } catch (err) {
      console.error("Save trip error:", err);
      alert("Network error. Please try again.");
      setSaving(false);
    }
  };

  const progressPercent = Math.round((currentIndex / allPlaces.length) * 100);

  return (
    <div className="anchored-planner-root">
      {/* LEFT SIDEBAR: PREMIUM ITINERARY */}
      <aside className="premium-itinerary-sidebar">
        <div className="sidebar-header-premium">
          <div className="header-top-row">
            <div className="premium-brand">
              <div className="brand-dot"></div>
              <span className="brand-text">Bharat Trip</span>
            </div>
            <button className="back-control" onClick={() => navigate("/planner")}>
              ← Edit Plan
            </button>
          </div>
          
          <div className="trip-hero-info">
            <h1>{tripTitle || `${totalDays} Days in ${plan.city || "India"}`}</h1>
            <div className="trip-meta-pills">
              <span className="meta-pill">✨ {plan.travelerType || "Solo"}</span>
              <span className="meta-pill">⚡ {plan.pace || "Moderate"} Pace</span>
              <span className="meta-pill">📅 {totalDays} Days</span>
            </div>
          </div>
        </div>

        <div className="sidebar-scroll-content">
          {/* Progress Tracker Card */}
          <div className="journey-progress-card">
            <div className="progress-header">
              <span className="progress-label">Journey Progress</span>
              <span className="progress-val">{progressPercent}%</span>
            </div>
            <div className="progress-track-premium">
              <div className="progress-fill-premium" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>

          {/* Timeline */}
          {daysKeys.map((day, dIdx) => (
            <div key={day} className="premium-day-section">
              <div className="day-header-premium">
                <div className="day-circle">{dIdx + 1}</div>
                <div className="day-info">
                  <h3>{day}</h3>
                  <span>{plan.itinerary[day].places.length} Destinations</span>
                </div>
              </div>

              <div className="stops-container-premium">
                {plan.itinerary[day].places.map((place, pIdx) => {
                  let globalIdx = 0;
                  for (let i = 0; i < dIdx; i++) globalIdx += plan.itinerary[daysKeys[i]].places.length;
                  const idx = globalIdx + pIdx;

                  const isVisited = idx < currentIndex;
                  const isCurrent = idx === currentIndex;
                  const isUpcoming = idx > currentIndex;

                  return (
                    <div 
                      key={idx} 
                      className={`premium-stop-card-v2 ${isVisited ? "visited" : ""} ${isCurrent ? "active" : ""} ${isUpcoming ? "upcoming" : ""}`}
                      onClick={() => setHoveredPlace(place)}
                    >
                      <div className="stop-marker-v2"></div>
                      <div className="stop-card-inner">
                        <div className="stop-top-row">
                          <PlaceImage 
                            placeName={place.name} 
                            city={plan.city || "Bangalore"} 
                            className="stop-image-v2" 
                          />
                          <div className="stop-details-v2">
                            <h4>{place.name}</h4>
                            <div className="stop-pills-v2">
                              <span className="stop-pill-v2">{place.category || "Sight"}</span>
                              <span className="stop-pill-v2">{formatPrice(place.avgCost || 200)}</span>
                            </div>
                          </div>
                        </div>

                        {isCurrent && (
                          <div className="active-action-pane">
                            <p className="stop-insight-v2">
                              {place.reason ? place.reason.split(/[.!?]/)[0] + " ✨" : "Discover the beauty of this location."}
                            </p>
                            <button className="premium-action-btn" onClick={(e) => {
                              e.stopPropagation();
                              setCurrentIndex(idx + 1);
                            }}>
                              <span>Mark as Visited</span>
                              <span className="btn-arrow">→</span>
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

        <div className="sidebar-footer-premium">
          <div className="footer-summary-row">
            <div className="budget-estimate">
              <span className="budget-label">Est. Total Budget</span>
              <span className="budget-value">{formatPrice(totalTripCost)}</span>
            </div>
            <button 
              className="save-journey-btn"
              onClick={handleSaveTrip}
              disabled={saving || saved}
            >
              {saved ? "✓ Saved to Profile" : saving ? "Saving Journey..." : "Save to Profile"}
            </button>
          </div>
        </div>
      </aside>

      {/* RIGHT SECTION: FULL SCREEN MAP */}
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

        {/* Floating Map UI */}
        <div className="floating-map-controls">
          <button 
            className={`map-control-btn ${isGuidanceMode ? "active" : ""}`}
            onClick={() => setIsGuidanceMode(!isGuidanceMode)}
            title="Toggle Guide"
          >
            {isGuidanceMode ? "🎯" : "🧭"}
          </button>
          <button 
            className={`map-control-btn ${isTracking ? "active" : ""}`}
            onClick={() => setIsTracking(!isTracking)}
            title="Live Tracking"
          >
            {isTracking ? "🛰️" : "📍"}
          </button>
          <button className="map-control-btn" onClick={() => window.location.reload()} title="Refresh">
            🔄
          </button>
        </div>

        <div className="bottom-map-info-pill">
          <div className="map-info-item">
            <div className={`info-icon-dot ${isTracking ? "live" : ""}`}></div>
            <span>{isTracking ? "Live GPS Active" : "Static Map View"}</span>
          </div>
          <div className="map-info-item">
            <div className="info-icon-dot" style={{background: '#10b981'}}></div>
            <span>{allPlaces.length} Points of Interest</span>
          </div>
          <div className="map-info-item">
            <div className="info-icon-dot" style={{background: '#8b5cf6'}}></div>
            <span>{plan.pace || "Moderate"} Pace</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Results;
