import { useLocation, useNavigate, useParams } from "react-router-dom";
import MapView from "../components/Map/MapView";
import PlaceImage from "../components/PlaceImage";
import CategoryCostBreakdown from "../components/CategoryCostBreakdown";
import BudgetPanel from "../components/BudgetPanel";
import { calculateDistance, calculateTravelCost } from "../utils/travelUtils";
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

// Fallback for timing logic if not provided by backend
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

const LockedDayOverlay = ({ onUnlock, dayCount }) => (
  <div className="locked-day-overlay">
    <div className="lock-icon-wrap">🔒</div>
    <h3>Itinerary Locked</h3>
    <p>Unlock your personalized {dayCount}-day journey with a free account.</p>
    <button className="unlock-cta-btn" onClick={onUnlock}>Unlock Full Plan in 1 Click</button>
  </div>
);

function Results() {
  const navigate = useNavigate();
  const loc = useLocation();
  const { id: routeTripId } = useParams();
  const { formatPrice, t } = useSettings();
  const { user, setShowAuthModal } = useContext(AuthContext);

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
  const [userLocation, setUserLocation] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(() => {
    const savedIdx = localStorage.getItem("tripCurrentIndex");
    const parsed = savedIdx ? parseInt(savedIdx, 10) : 0;
    return isNaN(parsed) ? 0 : parsed;
  });
  const [isPublic, setIsPublic] = useState(false);
  const [isExecuting, setIsExecuting] = useState(() => {
    return localStorage.getItem("tripExecuting") === "true";
  });

  const [multiCityContext, setMultiCityContext] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [sidebarTab, setSidebarTab] = useState(isExecuting ? "live" : "plan");
  const [activePlace, setActivePlace] = useState(null);
  const [showMapOnMobile, setShowMapOnMobile] = useState(false);
  const [isGuidanceMode, setIsGuidanceMode] = useState(false);
  const [mobileView, setMobileView] = useState("plan"); // 'plan' or 'map'
  
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // If we were executing, default to live/map view on mobile? 
    // User asked for Itinerary first, so we stay on 'plan'.
  }, []);

  useEffect(() => {
    let watchId = null;
    if (isTracking && navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            heading: position.coords.heading
          });
        },
        (error) => console.warn("Location tracking error:", error),
        { enableHighAccuracy: true, maximumAge: 10000 }
      );
    } else if (!isTracking && !userLocation && navigator.geolocation) {
      // Get initial position once if not tracking
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (err) => console.warn("Geolocation initial error:", err)
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isTracking]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Force a window resize event to trigger Leaflet's invalidateSize
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 500);
    return () => clearTimeout(timer);
  }, [showMapOnMobile, plan, mobileView]);

  useEffect(() => {
    const params = new URLSearchParams(loc.search);
    const sharedTripId = params.get("sharedTripId") || routeTripId;

    const loadPlan = async () => {
      setLoading(true);
      
      try {
        // Case 1: Shared Trip (via URL ID)
        if (sharedTripId) {
          const res = await fetch(`${API}/api/public/trips/${sharedTripId}`);
          const data = await res.json();
          if (res.ok && data.trip) {
            setPlan({
              ...data.trip,
              id: data.trip._id,
              city: data.trip.destination || "India",
              itinerary: data.trip.itinerary || [],
              isShared: true
            });
            setTripTitle(data.trip.title);
            return;
          }
        }

        // Case 2: Router State (Primary for new generations)
        if (loc.state?.plan) {
          setPlan(loc.state.plan);
          if (loc.state?.isNew) {
            setIsGenerating(true);
            setCurrentIndex(0);
          }
          return;
        }

        // Case 3: LocalStorage Fallback (For refresh or lost mobile state)
        const saved = localStorage.getItem("tripPlan");
        if (saved && saved !== "undefined" && saved !== "null") {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.itinerary) {
            setPlan(parsed);
          }
        }
      } catch (err) {
        console.error("Critical plan loading error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPlan();
  }, [loc.search, loc.state, routeTripId]);

  const handleSaveTrip = useCallback(async (isAutoSave = false) => {
    if (saving || saved || !plan) return;
    if (!isAutoSave) setSaving(true);
    try {
      if (!user) {
        if (!isAutoSave) setShowAuthModal(true);
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
  }, [saving, saved, user, plan, tripTitle, navigate, isPublic, setShowAuthModal]);

  useEffect(() => {
    if (!isGenerating) return;
    
    // Safety timeout: force close overlay after 6 seconds if it gets stuck
    const safetyTimer = setTimeout(() => {
      setIsGenerating(false);
      setGenStep("done");
      setLoading(false);
    }, 6000);

    const msgInterval = setInterval(() => setMessageIdx((prev) => (prev + 1) % THINKING_MESSAGES.length), 600);
    const summaryTimeout = setTimeout(() => { setGenStep("summary"); clearInterval(msgInterval); }, 1500);
    const doneTimeout = setTimeout(() => { setIsGenerating(false); setGenStep("done"); }, 3500);
    
    return () => { 
      clearInterval(msgInterval); 
      clearTimeout(summaryTimeout); 
      clearTimeout(doneTimeout); 
      clearTimeout(safetyTimer);
    };
  }, [isGenerating]);

  useEffect(() => {
    if (!isGenerating && genStep === "done" && user && plan && loc.state?.isNew && !saved && !saving) {
      handleSaveTrip(true);
    }
  }, [isGenerating, genStep, user, plan, loc.state, saved, saving, handleSaveTrip]);

  useEffect(() => {
    if (plan && !user && !plan.isShared) {
      try {
        localStorage.setItem("tripPlan", JSON.stringify(plan));
      } catch (err) {
        console.warn("Storage quota exceeded, could not persist plan", err);
      }
    }
  }, [plan, user]);

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

  const handleUnlock = () => {
    setShowAuthModal(true);
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
    return normalizedItinerary.flatMap(d => (d.places || []).map(p => ({ ...p, dayLabel: d.label || d.day })));
  }, [normalizedItinerary]);

  const handleAddPlace = (dayLabel) => {
    const newPlaceName = window.prompt("Enter the name of the place to add:");
    if (!newPlaceName) return;

    setPlan(prev => {
      const newItinerary = Array.isArray(prev.itinerary) ? [...prev.itinerary] : { ...prev.itinerary };

      const updateDay = (dayObj) => {
        const newPlace = {
          name: newPlaceName,
          category: "Other",
          rating: 4.5,
          reviews: 100,
          estimatedCost: 200,
          timeHours: 2,
          tag: "Added by you",
          reason: "Manually added stop."
        };
        return { ...dayObj, places: [...(dayObj.places || []), newPlace] };
      };

      if (Array.isArray(newItinerary)) {
        const dayIdx = newItinerary.findIndex(d => (d.label || d.day) === dayLabel);
        if (dayIdx !== -1) {
          newItinerary[dayIdx] = updateDay(newItinerary[dayIdx]);
        }
      } else {
        if (newItinerary[dayLabel]) {
          newItinerary[dayLabel] = updateDay(newItinerary[dayLabel]);
        }
      }

      return { ...prev, itinerary: newItinerary };
    });
  };

  const handleStopClick = (place) => {
    setActivePlace(place);
    if (isMobile) {
      setShowMapOnMobile(true);
    }
  };

  const handleShowRoute = (place) => {
    if (!place) return;
    const { lat, lng, name } = place;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${name}`;
    window.open(url, "_blank");
  };

  const budgetData = useMemo(() => {
    const total = plan?.totalTripCost || 0;
    const target = plan?.totalBudget || 0;
    const max = Math.max(total, target, 1);
    return {
      total,
      target,
      percent: (total / max) * 100,
      targetPercent: (target / max) * 100,
      isOver: total > target
    };
  }, [plan]);

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

  if (!plan || !plan.itinerary) return (
    <div className="res-empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '20px' }}>
      <h2>{t("no_trip") || "No trip plan found."}</h2>
      <p style={{ color: 'var(--text-muted)' }}>The link might be broken or the trip doesn't exist.</p>
      <button className="pf-primary-btn" style={{ width: '200px' }} onClick={() => navigate("/")}>Back to Home</button>
    </div>
  );

  const progressPercent = Math.round((currentIndex / (allPlaces.length || 1)) * 100);

  const currentStop = allPlaces[currentIndex];
  const nextStop = allPlaces[currentIndex + 1];
  const stopsLeft = Math.max(0, allPlaces.length - currentIndex);

  return (
    <div className={`anchored-planner-root results-page-fixed ${isMobile ? `mobile-view-${mobileView}` : ''}`}>
      <aside className="premium-itinerary-sidebar">
        {isMobile && mobileView === "map" ? (
          /* Specialized Map-Mode Itinerary (Below Map) */
          <div className="compact-live-itinerary">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>📍 LIVE PROGRESS</span>
              <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-blue)' }}>{progressPercent}%</span>
            </div>

            {currentStop ? (
              <div className="simple-stop-card active">
                <PlaceImage placeName={currentStop.name} city={plan.city} className="simple-img" />
                <div className="simple-info">
                  <span className="simple-label">Current Stop</span>
                  <div className="simple-name">{currentStop.name}</div>
                </div>
                <button 
                  className="pf-primary-btn" 
                  style={{ marginLeft: 'auto', padding: '10px 15px', fontSize: '12px' }}
                  onClick={() => handleVisited(currentIndex)}
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="simple-stop-card">
                <div className="simple-name">Journey Completed! 🎉</div>
              </div>
            )}

            {nextStop && (
              <div className="simple-stop-card next">
                <PlaceImage placeName={nextStop.name} city={plan.city} className="simple-img" />
                <div className="simple-info">
                  <span className="simple-label" style={{ color: 'var(--accent-purple)' }}>Next Up</span>
                  <div className="simple-name">{nextStop.name}</div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Full Itinerary Sidebar (Standard Desktop or Mobile Itinerary View) */
          <>
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
                    <div className="exec-stat"><span className="exec-stat-val">{stopsLeft}</span><span className="exec-stat-label">Left</span></div>
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
                    {normalizedItinerary.map((dayObj, dIdx) => {
                      const isLocked = !user && dIdx > 0;
                      return (
                        <div key={dIdx} className={`premium-day-section ${isLocked ? 'is-locked' : ''}`}>
                          {isLocked && <LockedDayOverlay onUnlock={handleUnlock} dayCount={normalizedItinerary.length} />}
                          
                          <div className={isLocked ? 'blurred-day-container' : ''}>
                            <div className="day-header-premium">
                              <div className="day-circle">{dIdx + 1}</div>
                              <div className="day-info">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                  <h3>{dayObj.label || dayObj.day}</h3>
                                  <button 
                                    className="add-place-btn-minimal" 
                                    onClick={() => handleAddPlace(dayObj.label || dayObj.day)}
                                    disabled={isLocked}
                                    title="Add a custom stop to this day"
                                  >
                                    + Add Stop
                                  </button>
                                </div>
                                <span>{dayObj.places?.length || 0} Places</span>
                              </div>
                            </div>

                            <CategoryCostBreakdown 
                              dailyCost={dayObj.places.reduce((sum, p) => sum + (p.estimatedCost || 0), 0) || (plan.totalTripCost / (normalizedItinerary.length || 1))} 
                            />
                            
                            <div className="stops-container-premium">
                              {dayObj.places.map((place, pIdx) => {
                                let globalIdx = 0;
                                for (let i = 0; i < dIdx; i++) globalIdx += (normalizedItinerary[i]?.places.length || 0);
                                const currentIdx = globalIdx + pIdx;
                                const isVisited = currentIdx < currentIndex;
                                const isCurrent = currentIdx === currentIndex;
                                const timing = place.bestTime ? { time: place.bestTime, reason: place.timeReason } : getBestVisitTimeFallback(place.category, currentIdx);

                                // Calculate distance and cost
                                const distance = userLocation ? calculateDistance(userLocation.lat, userLocation.lng, place.lat, place.lng) : null;
                                const travelCost = distance !== null ? calculateTravelCost(distance) : null;

                                return (
                                  <div 
                                    key={currentIdx} 
                                    className={`premium-stop-card-v2 ${isVisited ? "visited" : ""} ${isCurrent ? "active" : "upcoming"}`}
                                    onClick={() => handleStopClick(place)}
                                    style={{ cursor: 'pointer' }}
                                  >
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
                                          
                                          {distance !== null && (
                                            <div className="stop-travel-info" style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '8px', display: 'flex', gap: '10px' }}>
                                              <span>📍 {distance} km away</span>
                                              <span style={{ color: 'var(--accent-green)' }}>🚗 {formatPrice(travelCost)} travel cost</span>
                                            </div>
                                          )}

                                          <div className="stop-pills-v2">
                                            <span className="stop-pill-v2">{place.category}</span>
                                            <span className="stop-pill-v2">{formatPrice(place.estimatedCost || 200)}</span>
                                          </div>

                                          {dayObj.places[pIdx + 1] && (
                                            <div className="next-stop-hint" style={{ fontSize: '10px', color: 'var(--accent-purple)', marginTop: '8px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                              ➔ Next: {dayObj.places[pIdx + 1].name}
                                            </div>
                                          )}

                                          {!isMobile && (
                                            <button 
                                              className="show-route-inline-btn"
                                              onClick={(e) => { e.stopPropagation(); handleShowRoute(place); }}
                                            >
                                              🗺️ Show Route
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                      {isCurrent && <button className="premium-action-btn" style={{ marginTop: '15px', width: '100%' }} onClick={() => handleVisited(currentIdx)}>Mark Visited →</button>}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {/* Spacing for floating budget panel */}
                    <div style={{ height: '120px' }}></div>
                  </div>
                </div>
              )}
            </div>

            <div className="sidebar-footer-premium">
              <BudgetPanel budgetData={budgetData} formatPrice={formatPrice} />
              <div className="footer-summary-row" style={{ flexDirection: 'column', gap: '10px' }}>
                <div className="footer-action-group" style={{ width: '100%', justifyContent: 'stretch' }}>
                  <button className="share-journey-btn" style={{ flex: 1 }} onClick={handleShare}>{shareStatus ? "✓ Link" : "Share"}</button>
                  <button className="save-journey-btn" style={{ flex: 1 }} onClick={() => handleSaveTrip()} disabled={saving || saved}>{saved ? "✓ Saved" : "Save Plan"}</button>
                </div>
              </div>
            </div>
          </>
        )}
      </aside>

      {isMobile && (
        <button 
          className="mobile-view-switcher"
          onClick={() => setMobileView(mobileView === "plan" ? "map" : "plan")}
        >
          {mobileView === "plan" ? (
            <><span style={{ fontSize: '18px' }}>🗺️</span> Explore on Map</>
          ) : (
            <><span style={{ fontSize: '18px' }}>📋</span> Back to Itinerary</>
          )}
        </button>
      )}

      {isMobile && activePlace && mobileView === "map" && (
        <button 
          className="mobile-floating-navigate-cta"
          onClick={() => handleShowRoute(activePlace)}
        >
          🚀 Navigate to {activePlace.name}
        </button>
      )}

      <div className="planner-map-foundation">
        <MapView 
          plan={plan} 
          isTracking={isTracking} 
          currentIndex={currentIndex} 
          setCurrentIndex={setCurrentIndex}
          userLocation={userLocation}
          activePlace={activePlace}
          isGuidanceMode={isGuidanceMode}
          setIsGuidanceMode={setIsGuidanceMode}
          onHover={setActivePlace}
        />
        <div className="floating-map-controls">
          <button className={`map-control-btn ${isTracking ? "active" : ""}`} onClick={() => setIsTracking(!isTracking)}>📍</button>
        </div>
      </div>
    </div>
  );
}

export default Results;