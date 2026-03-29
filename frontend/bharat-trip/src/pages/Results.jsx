import { useLocation, useNavigate } from "react-router-dom";
import MapView from "../components/Map/MapView";
import GuidancePanel from "../components/Map/GuidancePanel";
import { DAY_COLORS } from "../constants/dayColors";
import PlaceImage from "../components/PlaceImage";
import "./results.css";
import { useState, useEffect, useMemo, useContext } from "react";
import { useSettings } from "../context/SettingsContext";
import { AuthContext } from "../context/AuthContext";
import { auth } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";

const API = import.meta.env.VITE_API_URL;

const THINKING_MESSAGES = [
  "Analyzing your preferences...",
  "Optimizing travel routes...",
  "Balancing your budget...",
  "Designing your experience...",
  "Curating local secrets...",
  "Finalizing your odyssey..."
];

function Results() {
  const navigate = useNavigate();
  const loc = useLocation();
  const { formatPrice, t, currency } = useSettings();
  const { user } = useContext(AuthContext);

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // AI Generation States
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStep, setGenStep] = useState("thinking"); // thinking, summary, done
  const [messageIdx, setMessageIdx] = useState(0);

  const [tripTitle, setTripTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [isGuidanceMode, setIsGuidanceMode] = useState(false);
  const [hoveredPlace, setHoveredPlace] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(() => {
    const savedIdx = localStorage.getItem("tripCurrentIndex");
    return savedIdx ? parseInt(savedIdx, 10) : 0;
  });
  const [userLocation, setUserLocation] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

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
            totalBudget: data.totalBudget,
            remainingBudget: data.remainingBudget,
            perDayBudget: data.perDayBudget,
            travelerType: data.travelerType,
            pace: data.pace,
            summary: data.summary || "A custom-crafted journey designed just for you."
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
      if (loc.state?.isNew) {
        setIsGenerating(true);
        setCurrentIndex(0);
        localStorage.setItem("tripCurrentIndex", 0);
      }
      setLoading(false);
    } else {
      const savedPlanStr = localStorage.getItem("tripPlan");
      if (savedPlanStr) {
        setPlan(JSON.parse(savedPlanStr));
      }
      setLoading(false);
    }
  }, [loc.search, loc.state]);

  // AI Generation sequence logic
  useEffect(() => {
    if (!isGenerating) return;

    // Phase 1: Message Rotation
    const msgInterval = setInterval(() => {
      setMessageIdx((prev) => (prev + 1) % THINKING_MESSAGES.length);
    }, 700);

    // Phase 2: Move to Summary (after 2s)
    const summaryTimeout = setTimeout(() => {
      setGenStep("summary");
      clearInterval(msgInterval);
    }, 2000);

    // Phase 3: Finalize (after 4s total)
    const doneTimeout = setTimeout(() => {
      setIsGenerating(false);
      setGenStep("done");
    }, 4500);

    return () => {
      clearInterval(msgInterval);
      clearTimeout(summaryTimeout);
      clearTimeout(doneTimeout);
    };
  }, [isGenerating]);

  const optimizeItinerary = async () => {
    if (!plan || !plan.itinerary || isOptimizing) return;
    setIsOptimizing(true);
    // Optimization logic here...
    setTimeout(() => setIsOptimizing(false), 1500);
  };

  const handleResetProgress = () => {
    if (window.confirm("Are you sure you want to reset your trip progress?")) {
      setCurrentIndex(0);
      localStorage.setItem("tripCurrentIndex", 0);
    }
  };

  const allPlaces = useMemo(() => {
    if (!plan || !plan.itinerary) return [];
    const days = Object.keys(plan.itinerary);
    const city = plan.city || "Bangalore";
    return days.flatMap(d => (plan.itinerary[d]?.places || []).map(p => ({ ...p, city })));
  }, [plan?.itinerary, plan?.city]);

  if (loading) {
    return (
      <div className="res-loading-screen">
        <div className="res-spinner"></div>
        <h2>Initializing Odyssey...</h2>
      </div>
    );
  }

  // Generation Overlay
  if (isGenerating && plan) {
    return (
      <div className="ai-gen-overlay">
        <AnimatePresence mode="wait">
          {genStep === "thinking" && (
            <motion.div 
              key="thinking"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="ai-gen-content"
            >
              <div className="ai-pulse-ring">
                <div className="ai-pulse-dot"></div>
              </div>
              <motion.h2
                key={messageIdx}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
              >
                {THINKING_MESSAGES[messageIdx]}
              </motion.h2>
              <div className="ai-loading-bar-wrap">
                <motion.div 
                  className="ai-loading-bar-fill"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, ease: "linear" }}
                />
              </div>
            </motion.div>
          )}

          {genStep === "summary" && (
            <motion.div 
              key="summary"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, filter: "blur(10px)" }}
              className="ai-gen-summary-box"
            >
              <span className="ai-sparkle-tag">✨ Why this plan works</span>
              <h2>Your Custom Itinerary is Ready</h2>
              <p className="ai-summary-text-large">{plan.summary}</p>
              <div className="ai-countdown-loader"></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
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
  const totalTripCost = plan.totalTripCost || 0;

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
          console.warn("Failed to get Firebase token, using stored token:", tokenErr);
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
          budget: plan.totalBudget,
          interests: plan.interests,
          itinerary: plan.itinerary,
          totalCost: totalTripCost,
          totalBudget: plan.totalBudget,
          remainingBudget: plan.remainingBudget,
          perDayBudget: plan.perDayBudget,
          travelerType: plan.travelerType,
          pace: plan.pace,
          summary: plan.summary
        })
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => navigate("/profile"), 1500);
      } else {
        const errorData = await res.json().catch(() => ({}));
        if (res.status === 401) {
          alert("Your session has expired. Please log in again.");
          navigate("/login");
        } else {
          alert(`Failed to save trip: ${errorData.error || "Unknown server error"}`);
        }
        setSaving(false);
      }
    } catch (err) {
      console.error("Save trip error:", err);
      alert("Network error. Please try again.");
      setSaving(false);
    }
  };

  const progressPercent = Math.round((currentIndex / (allPlaces.length || 1)) * 100);

  return (
    <div className="anchored-planner-root">
      <aside className="premium-itinerary-sidebar">
        <div className="sidebar-header-premium">
          <div className="header-top-row">
            <div className="premium-brand">
              <div className="brand-dot"></div>
              <span className="brand-text">Bharat Trip</span>
            </div>
            <button className="back-control" onClick={() => navigate("/planner")}>← Edit Plan</button>
          </div>
          <div className="trip-hero-info">
            <h1>{tripTitle || `${totalDays} Days in ${plan.city || "India"}`}</h1>
            <div className="trip-meta-pills">
              <span className="meta-pill">✨ {plan.travelerType || "Solo"}</span>
              <span className="meta-pill">⚡ {plan.pace || "Moderate"} Pace</span>
              <span className="meta-pill">📅 {totalDays} Days</span>
              <button className="meta-pill optimize-pill" onClick={optimizeItinerary}>🚀 Optimize Route</button>
            </div>
          </div>
        </div>

        <div className="sidebar-scroll-content">
          {plan.summary && (
            <div className="plan-summary-card">
              <h4 className="summary-title">Why this plan works</h4>
              <p className="summary-text">{plan.summary}</p>
            </div>
          )}

          {plan.totalBudget && (
            <div className="journey-progress-card budget-intelligence">
              <div className="progress-header">
                <span className="progress-label">Budget Intelligence</span>
                <span className="progress-val">{Math.round((totalTripCost / (plan.totalBudget || 1)) * 100)}%</span>
              </div>
              <div className="budget-stats-grid">
                <div className="budget-stat-item">
                  <span className="stat-label">Total Budget</span>
                  <span className="stat-val">{formatPrice(plan.totalBudget)}</span>
                </div>
                <div className="budget-stat-item">
                  <span className="stat-label">Est. Cost</span>
                  <span className="stat-val">{formatPrice(totalTripCost)}</span>
                </div>
                <div className="budget-stat-item">
                  <span className="stat-label">Remaining</span>
                  <span className="stat-val" style={{ color: (plan.totalBudget - totalTripCost) >= 0 ? 'var(--accent-green)' : '#ef4444' }}>
                    {formatPrice(plan.totalBudget - totalTripCost)}
                  </span>
                </div>
              </div>
              <div className="progress-track-premium" style={{ marginTop: '12px' }}>
                <div 
                  className="progress-fill-premium" 
                  style={{ 
                    width: `${Math.min((totalTripCost / (plan.totalBudget || 1)) * 100, 100)}%`,
                    background: totalTripCost > plan.totalBudget ? '#ef4444' : 'linear-gradient(to right, var(--accent-blue), var(--accent-green))'
                  }}
                ></div>
              </div>
            </div>
          )}

          <div className="journey-progress-card">
            <div className="progress-header">
              <span className="progress-label">Journey Progress</span>
              <span className="progress-val">{progressPercent}%</span>
            </div>
            <div className="progress-track-premium">
              <div className="progress-fill-premium" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>

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

                  return (
                    <div key={idx} className={`premium-stop-card-v2 ${isVisited ? "visited" : ""} ${isCurrent ? "active" : "upcoming"}`} onClick={() => setHoveredPlace(place)}>
                      <div className="stop-marker-v2"></div>
                      <div className="stop-card-inner">
                        <div className="stop-top-row">
                          <PlaceImage placeName={place.name} city={plan.city} className="stop-image-v2" />
                          <div className="stop-details-v2">
                            <h4>{place.name}</h4>
                            <div className="stop-trust-layer">
                              ⭐ {place.rating || "4.2"} • {typeof place.reviews === 'number' ? place.reviews.toLocaleString() : "1,200+"} reviews • <span className="trust-tag">{place.tag || "Popular Spot"}</span>
                            </div>
                            <div className="stop-pills-v2">
                              <span className="stop-pill-v2">{place.category || "Sight"}</span>
                              <span className="stop-pill-v2">{formatPrice(place.estimatedCost || 200)}</span>
                            </div>
                          </div>
                        </div>
                        {isCurrent && (
                          <div className="active-action-pane">
                            <p className="stop-insight-v2">{place.reason || "Discover the beauty of this location."}</p>
                            <button className="premium-action-btn" onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx + 1); }}>Mark as Visited →</button>
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
            <button className="save-journey-btn" onClick={handleSaveTrip} disabled={saving || saved}>
              {saved ? "✓ Saved" : "Save to Profile"}
            </button>
          </div>
        </div>
      </aside>

      <div className="planner-map-foundation">
        <MapView plan={plan} isTracking={isTracking} onHover={setHoveredPlace} currentIndex={currentIndex} />
        <div className="floating-map-controls">
          <button className={`map-control-btn ${isTracking ? "active" : ""}`} onClick={() => setIsTracking(!isTracking)}>📍</button>
        </div>
      </div>
    </div>
  );
}

export default Results;