import { useLocation, useNavigate, useParams } from "react-router-dom";
import MapView from "../components/Map/MapView";
import PlaceImage from "../components/PlaceImage";
import "./results.css";
import { useState, useEffect, useMemo, useContext, useCallback } from "react";
import { useSettings } from "../context/SettingsContext";
import { AuthContext } from "../context/AuthContext";
import { auth } from "../firebase";
import { AnimatePresence, motion } from "framer-motion";

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "");

const THINKING_MESSAGES = [
  "Initializing Neural Path Optimization...",
  "Synchronizing Geospatial Datasets...",
  "Analyzing User Preference Vectors...",
  "Executing Multi-Objective Route Balancing...",
  "Applying Climatic Alignment Algorithms...",
  "Synthesizing Local Narrative Layers...",
  "Finalizing High-Fidelity Odyssey..."
];

function Results() {
  const navigate = useNavigate();
  const loc = useLocation();
  const { id: routeTripId } = useParams();
  const { formatPrice, t } = useSettings();
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
  const [shareStatus, setShareStatus] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(() => {
    const savedIdx = localStorage.getItem("tripCurrentIndex");
    return savedIdx ? parseInt(savedIdx, 10) : 0;
  });
  const [isPublic, setIsPublic] = useState(false);
  const [isExecuting, setIsExecuting] = useState(() => {
    return localStorage.getItem("tripExecuting") === "true";
  });

  const [multiCityContext, setMultiCityContext] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [showMapOnMobile, setShowMapOnMobile] = useState(false);
  const isMobile = window.innerWidth <= 900;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(loc.search);
    const sharedTripId = params.get("sharedTripId") || routeTripId;

    const fetchSharedTrip = async (id) => {
      try {
        const res = await fetch(`${API}/api/public/trips/${id}`);
        const data = await res.json();
        if (res.ok) {
          const t = data.trip;
          const formattedPlan = {
            id: t._id,
            city: t.destination || "India",
            coordinates: t.coordinates,
            days: t.days,
            itinerary: t.itinerary,
            isShared: true,
            totalTripCost: t.totalTripCost,
            totalBudget: t.totalBudget,
            travelerType: t.travelerType,
            pace: t.pace,
            summary: t.summary || "A custom-crafted journey designed just for you."
          };
          setPlan(formattedPlan);
          setTripTitle(t.title);
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
      if (loc.state?.multiCityContext) {
        setMultiCityContext(loc.state.multiCityContext);
      }
      if (loc.state?.isNew) {
        setIsGenerating(true);
        setCurrentIndex(0);
        localStorage.setItem("tripCurrentIndex", 0);
      } else {
        setIsGenerating(false);
      }
      setLoading(false);
    } else {
      const savedPlanStr = localStorage.getItem("tripPlan");
      if (savedPlanStr) {
        setPlan(JSON.parse(savedPlanStr));
      }
      setLoading(false);
    }
  }, [loc.search, loc.state, routeTripId]);

  const handleSaveTrip = useCallback(async (isAutoSave = false) => {
    if (saving || saved || !plan) return;
    if (!isAutoSave) setSaving(true);
    try {
      if (!user) {
        if (!isAutoSave) alert("Please login to save your trip plan.");
        return;
      }
      let token = localStorage.getItem("token");
      if (auth.currentUser) {
        token = await auth.currentUser.getIdToken(true);
        localStorage.setItem("token", token);
      }
      if (!token) return;

      const res = await fetch(`${API}/api/profile/trips`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: tripTitle || `${plan.days || Object.keys(plan.itinerary).length}-Day ${plan.city} Trip`,
          city: plan.city,
          days: plan.days || Object.keys(plan.itinerary).length,
          itinerary: plan.itinerary,
          totalCost: plan.totalTripCost,
          totalBudget: plan.totalBudget,
          summary: plan.summary,
          isPublic: isPublic
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSaved(true);
        if (data.trip?._id) setPlan(prev => ({ ...prev, id: data.trip._id }));
        if (!isAutoSave) setTimeout(() => navigate("/trips"), 1500);
      }
    } catch (err) {
      console.error("Save trip error:", err);
    } finally {
      if (!isAutoSave) setSaving(false);
    }
  }, [saving, saved, user, plan, tripTitle, navigate, isPublic]);

  useEffect(() => {
    if (!isGenerating) return;
    const msgInterval = setInterval(() => setMessageIdx((prev) => (prev + 1) % THINKING_MESSAGES.length), 700);
    const summaryTimeout = setTimeout(() => { setGenStep("summary"); clearInterval(msgInterval); }, 2000);
    const doneTimeout = setTimeout(() => { setIsGenerating(false); setGenStep("done"); }, 4500);
    return () => { clearInterval(msgInterval); clearTimeout(summaryTimeout); clearTimeout(doneTimeout); };
  }, [isGenerating]);

  useEffect(() => {
    if (!isGenerating && genStep === "done" && user && plan && loc.state?.isNew && !saved && !saving) {
      handleSaveTrip(true);
    }
  }, [isGenerating, genStep, user, plan, loc.state, saved, saving, handleSaveTrip]);

  const handleSkip = (dayLabel, placeName) => {
    setPlan(prev => {
      const isArr = Array.isArray(prev.itinerary);
      const newItinerary = isArr ? [...prev.itinerary] : { ...prev.itinerary };
      const dayKey = isArr ? prev.itinerary.findIndex(d => d.day === dayLabel) : dayLabel;
      if (dayKey === -1 && isArr) return prev;

      const currentDay = isArr ? { ...newItinerary[dayKey] } : { ...newItinerary[dayKey] };
      currentDay.places = currentDay.places.filter(p => p.name !== placeName);
      newItinerary[dayKey] = currentDay;
      return { ...prev, itinerary: newItinerary };
    });
  };

  const handleVisited = (idx) => {
    setCurrentIndex(idx + 1);
    localStorage.setItem("tripCurrentIndex", idx + 1);
  };

  const handleStartTrip = () => {
    setIsExecuting(true);
    localStorage.setItem("tripExecuting", "true");
    setSidebarTab("live");
  };

  const normalizedItinerary = useMemo(() => {
    if (!plan || !plan.itinerary) return [];
    if (Array.isArray(plan.itinerary)) return plan.itinerary;
    return Object.entries(plan.itinerary).map(([dayLabel, dayData]) => ({
      day: dayLabel,
      ...dayData
    }));
  }, [plan]);

  const allPlaces = useMemo(() => {
    return normalizedItinerary.flatMap(d => (d.places || []).map(p => ({ ...p, dayLabel: d.day })));
  }, [normalizedItinerary]);

  const getBestVisitTimeFallback = (category, index) => {
    const cat = (category || "").toLowerCase();
    const isEven = index % 2 === 0;
    if (["nature", "park", "garden", "hill", "lake", "beach"].some(kw => cat.includes(kw))) {
      return { time: isEven ? "Morning" : "Evening", reason: "Pleasant weather and soft sunlight" };
    }
    if (["temple", "church", "mosque", "spiritual", "monument", "museum", "history", "cultural"].some(kw => cat.includes(kw))) {
      return { time: "Morning", reason: "Peaceful atmosphere and fewer crowds" };
    }
    if (["cafe", "restaurant", "dining", "food", "bakery"].some(kw => cat.includes(kw))) {
      return { time: isEven ? "Afternoon" : "Evening", reason: "Ideal for a relaxed meal" };
    }
    return { time: ["Morning", "Afternoon", "Evening"][index % 3], reason: "Great time to explore" };
  };

  const [sidebarTab, setSidebarTab] = useState(isExecuting ? "live" : "plan");

  const handleShare = async () => {
    if (!plan?.id && !saved) {
      if (window.confirm("Save trip before sharing?")) await handleSaveTrip();
      return;
    }
    const shareUrl = `${window.location.origin}/trip/${plan?.id || routeTripId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareStatus(true);
      setTimeout(() => setShareStatus(false), 2000);
    } catch (err) { alert("Link: " + shareUrl); }
  };

  if (loading) return <div className="res-loading-screen"><div className="res-spinner"></div><h2>Initializing Odyssey...</h2></div>;

  if (isGenerating && plan) {
    return (
      <div className="ai-gen-overlay">
        <AnimatePresence mode="wait">
          {genStep === "thinking" && (
            <motion.div key="thinking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="ai-gen-content">
              <div className="ai-pulse-ring"><div className="ai-pulse-dot"></div></div>
              <motion.h2 key={messageIdx}>{THINKING_MESSAGES[messageIdx]}</motion.h2>
              <div className="ai-loading-bar-wrap"><motion.div className="ai-loading-bar-fill" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 2 }} /></div>
            </motion.div>
          )}
          {genStep === "summary" && (
            <motion.div key="summary" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="ai-gen-summary-box">
              <span className="ai-sparkle-tag">✨ AI Insight</span>
              <h2>Itinerary Ready</h2>
              <p className="ai-summary-text-large">{plan.summary}</p>
              <div className="ai-countdown-loader"></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (!plan || !plan.itinerary) return <div className="res-empty"><h2>{t("no_trip")}</h2><button onClick={() => navigate("/planner")}>Back</button></div>;

  const progressPercent = Math.round((currentIndex / (allPlaces.length || 1)) * 100);

  return (
    <div className={`anchored-planner-root ${showMapOnMobile ? 'show-map-mobile' : ''}`}>
      <aside className={`premium-itinerary-sidebar ${showMapOnMobile ? 'hidden-mobile' : ''}`}>
        <div className="sidebar-header-premium">
          <div className="header-top-row">
            <div className="premium-brand"><div className="brand-dot"></div><span className="brand-text">Bharat Trip</span></div>
            <button className="back-control" onClick={() => navigate("/planner")}>← Edit</button>
          </div>
          
          <div className="trip-hero-info">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
              <h1 style={{ fontSize: '22px' }}>{tripTitle || `${normalizedItinerary.length} Days in ${plan.city}`}</h1>
              {!isExecuting && <button className="start-trip-btn" onClick={handleStartTrip}>🚀 Guide Me</button>}
            </div>
            
            <div className="sidebar-mode-tabs">
              <button className={`mode-tab ${sidebarTab === 'plan' ? 'active' : ''}`} onClick={() => setSidebarTab('plan')}>📋 Plan</button>
              <button className={`mode-tab ${sidebarTab === 'live' ? 'active' : ''}`} onClick={() => { setSidebarTab('live'); if(!isExecuting) handleStartTrip(); }}>🧭 Live</button>
            </div>
          </div>
        </div>

        <div className="sidebar-scroll-content">
          {sidebarTab === 'live' ? (
            <div className="execution-mode-focused animate-in">
              <div className="exec-progress-summary">
                <div className="exec-stat"><span className="exec-stat-val">{currentIndex}</span><span className="exec-stat-label">Visited</span></div>
                <div className="exec-stat"><span className="exec-stat-val">{allPlaces.length - currentIndex}</span><span className="exec-stat-label">Left</span></div>
                <div className="exec-progress-track"><div className="exec-progress-fill" style={{ width: `${progressPercent}%` }}></div></div>
              </div>

              {currentIndex < allPlaces.length ? (
                <div className="focused-stop-card current">
                  <span className="stop-status-tag current">CURRENT STOP</span>
                  <PlaceImage placeName={allPlaces[currentIndex].name} city={plan.city} className="focused-stop-img" />
                  <div className="focused-stop-body">
                    <h2>{allPlaces[currentIndex].name}</h2>
                    <button className="exec-action-btn complete" onClick={() => handleVisited(currentIndex)}>✅ Completed</button>
                  </div>
                </div>
              ) : (
                <div className="focused-stop-card completed"><h2>Trip Completed! 🎉</h2><button className="pf-secondary-btn" onClick={() => setSidebarTab('plan')}>View Full Plan</button></div>
              )}
            </div>
          ) : (
            <div className="plan-mode-content animate-in">
              <div className="journey-progress-card">
                <div className="progress-header"><span className="progress-label">Journey Progress</span><span className="progress-val">{progressPercent}%</span></div>
                <div className="progress-track-premium"><div className="progress-fill-premium" style={{ width: `${progressPercent}%` }}></div></div>
              </div>

              <div className="premium-itinerary-list">
                {normalizedItinerary.map((dayObj, dIdx) => (
                  <div key={dIdx} className="premium-day-section">
                    <div className="day-header-premium">
                      <div className="day-circle">{dIdx + 1}</div>
                      <div className="day-info"><h3>{dayObj.day}</h3><span>{dayObj.places.length} Places</span></div>
                    </div>
                    
                    <div className="stops-container-premium">
                      {dayObj.places.map((place, pIdx) => {
                        let globalIdx = 0;
                        for (let i = 0; i < dIdx; i++) globalIdx += (normalizedItinerary[i]?.places.length || 0);
                        const currentIdx = globalIdx + pIdx;
                        const isVisited = currentIdx < currentIndex;
                        const isCurrent = currentIdx === currentIndex;
                        const timing = place.bestTime ? { time: place.bestTime, reason: place.timeReason } : getBestVisitTimeFallback(place.category, currentIdx);

                        return (
                          <div key={currentIdx} className={`premium-stop-card-v2 ${isVisited ? "visited" : ""} ${isCurrent ? "active" : "upcoming"}`}>
                            <div className="stop-marker-v2">{isVisited && <span className="visited-tick">✓</span>}</div>
                            <div className="stop-card-inner">
                              <div className="stop-top-row">
                                <PlaceImage placeName={place.name} city={plan.city} className="stop-image-v2" />
                                <div className="stop-details-v2">
                                  <div className="stop-title-row">
                                    <h4>{place.name}</h4>
                                    {!isVisited && <button className="skip-btn" onClick={() => handleSkip(dayObj.day, place.name)}>✕</button>}
                                  </div>
                                  <div className="stop-timing-info" style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                                    <span style={{ color: 'var(--accent-blue)', fontWeight: '700' }}>🕒 {timing.time}</span> • {timing.reason}
                                  </div>
                                  <div className="stop-pills-v2">
                                    <span className="stop-pill-v2">{place.category}</span>
                                    <span className="stop-pill-v2">{formatPrice(place.estimatedCost || 200)}</span>
                                  </div>
                                </div>
                              </div>
                              {isCurrent && <button className="premium-action-btn" style={{ marginTop: '15px', width: '100%' }} onClick={() => handleVisited(currentIdx)}>Mark Visited →</button>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="sidebar-footer-premium">
          <div className="footer-summary-row" style={{ flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <div className="budget-estimate">
                <span className="budget-label">Target Budget</span>
                <span className="budget-value" style={{ opacity: 0.7, fontSize: '14px' }}>{formatPrice(plan.totalBudget || 0)}</span>
              </div>
              <div className="budget-estimate" style={{ textAlign: 'right' }}>
                <span className="budget-label">Final Est. Total</span>
                <span className="budget-value" style={{ color: 'var(--accent-green)' }}>{formatPrice(plan.totalTripCost || 0)}</span>
              </div>
            </div>
            <div className="footer-action-group" style={{ width: '100%', justifyContent: 'stretch' }}>
              <button className="share-journey-btn" style={{ flex: 1 }} onClick={handleShare}>{shareStatus ? "✓ Link" : "Share"}</button>
              <button className="save-journey-btn" style={{ flex: 1 }} onClick={() => handleSaveTrip()} disabled={saving || saved}>{saved ? "✓ Saved" : "Save Plan"}</button>
            </div>
          </div>
        </div>
      </aside>

      {isMobile && (
        <button className="mobile-view-toggle" onClick={() => setShowMapOnMobile(!showMapOnMobile)}>
          {showMapOnMobile ? "📋 View Plan" : "🗺️ View Map"}
        </button>
      )}

      <div className="planner-map-foundation">
        <MapView plan={plan} isTracking={isTracking} currentIndex={currentIndex} />
        <div className="floating-map-controls">
          <button className={`map-control-btn ${isTracking ? "active" : ""}`} onClick={() => setIsTracking(!isTracking)}>📍</button>
        </div>
      </div>
    </div>
  );
}

export default Results;
