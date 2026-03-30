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
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [isExecuting, setIsExecuting] = useState(() => {
    return localStorage.getItem("tripExecuting") === "true";
  });

  const [multiCityContext, setMultiCityContext] = useState(null);

  const [currentTime, setCurrentTime] = useState(new Date());

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
            city: t.destination || "Bangalore",
            coordinates: t.coordinates,
            days: t.days,
            itinerary: t.itinerary,
            isShared: true,
            totalTripCost: t.totalTripCost,
            totalBudget: t.totalBudget,
            remainingBudget: t.remainingBudget,
            perDayBudget: t.perDayBudget,
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
        try {
          token = await auth.currentUser.getIdToken(true);
          localStorage.setItem("token", token);
        } catch (tokenErr) {
          console.warn("Firebase token refresh failed, using stored token", tokenErr);
        }
      }

      if (!token) {
        if (!isAutoSave) alert("Authentication error. Please login again.");
        return;
      }

      const daysKeys = Object.keys(plan.itinerary);
      const totalDays = daysKeys.length;
      const totalTripCost = plan.totalTripCost || 0;

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
          summary: plan.summary,
          isPublic: isPublic
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSaved(true);
        if (data.trip && data.trip._id) {
          setPlan(prev => ({ ...prev, id: data.trip._id }));
        }
        if (!isAutoSave) {
           setTimeout(() => navigate("/trips"), 1500);
        }
      } else {
        if (!isAutoSave) {
          if (res.status === 401) {
            alert("Your session has expired. Please log in again.");
            navigate("/login");
          } else {
            const errorData = await res.json().catch(() => ({}));
            alert(`Failed to save trip: ${errorData.error || "Unknown server error"}`);
          }
        }
      }
    } catch (err) {
      console.error("Save trip error:", err);
      if (!isAutoSave) alert("Network error. Please try again.");
    } finally {
      if (!isAutoSave) setSaving(false);
    }
  }, [saving, saved, user, plan, tripTitle, navigate]);

  // AI Generation sequence logic
  useEffect(() => {
    if (!isGenerating) return;

    const msgInterval = setInterval(() => {
      setMessageIdx((prev) => (prev + 1) % THINKING_MESSAGES.length);
    }, 700);

    const summaryTimeout = setTimeout(() => {
      setGenStep("summary");
      clearInterval(msgInterval);
    }, 2000);

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

  // Handle auto-save after generation
  useEffect(() => {
    if (!isGenerating && genStep === "done" && user && plan && loc.state?.isNew && !saved && !saving) {
      handleSaveTrip(true);
    }
  }, [isGenerating, genStep, user, plan, loc.state, saved, saving, handleSaveTrip]);

  /* ── ADAPTIVE LOGIC UTILS ── */
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const reorderDayByDistance = (places) => {
    if (places.length <= 1) return places;
    const sorted = [places[0]];
    const remaining = [...places.slice(1)];
    while (remaining.length > 0) {
      const last = sorted[sorted.length - 1];
      let nearestIdx = 0;
      let minDist = getDistance(last.lat, last.lng, remaining[0].lat, remaining[0].lng);
      for (let i = 1; i < remaining.length; i++) {
        const d = getDistance(last.lat, last.lng, remaining[i].lat, remaining[i].lng);
        if (d < minDist) { minDist = d; nearestIdx = i; }
      }
      sorted.push(remaining.splice(nearestIdx, 1)[0]);
    }
    return sorted;
  };

  const handleSkip = (dayKey, placeName) => {
    const placeToSkip = plan.itinerary[dayKey].places.find(p => p.name === placeName);
    if (placeToSkip && user) {
      // Track skip action for personalization
      trackPreference(placeToSkip.category, "skip");
    }

    setPlan(prev => {
      const newItinerary = { ...prev.itinerary };
      newItinerary[dayKey].places = newItinerary[dayKey].places.filter(p => p.name !== placeName);
      newItinerary[dayKey].places = reorderDayByDistance(newItinerary[dayKey].places);
      newItinerary[dayKey].estimatedCost = newItinerary[dayKey].places.reduce((sum, p) => sum + (p.estimatedCost || 200), 0) + (newItinerary[dayKey].dayMealCost || 500);
      
      const newTotalCost = Object.values(newItinerary).reduce((sum, d) => sum + d.estimatedCost, 0);
      return { ...prev, itinerary: newItinerary, totalTripCost: newTotalCost };
    });
  };

  const trackPreference = async (category, action) => {
    const token = localStorage.getItem("token");
    if (!token || !category) return;
    try {
      await fetch(`${API}/api/profile/preferences/track`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ category, action })
      });
    } catch (err) {
      console.warn("Preference tracking failed", err);
    }
  };

  const handleRunningLate = () => {
    if (!window.confirm("This will remove low-priority places to save time. Continue?")) return;
    setPlan(prev => {
      const newItinerary = { ...prev.itinerary };
      Object.keys(newItinerary).forEach(dayKey => {
        newItinerary[dayKey].places = newItinerary[dayKey].places.filter(p => (p.priority || 5) >= 7);
        newItinerary[dayKey].places = reorderDayByDistance(newItinerary[dayKey].places);
      });
      const newTotalCost = Object.values(newItinerary).reduce((sum, d) => sum + d.estimatedCost, 0);
      return { ...prev, itinerary: newItinerary, totalTripCost: newTotalCost };
    });
  };

  const handleRelaxMode = () => {
    if (!window.confirm("This will limit daily stops to 3 for a more relaxed experience. Continue?")) return;
    setPlan(prev => {
      const newItinerary = { ...prev.itinerary };
      Object.keys(newItinerary).forEach(dayKey => {
        newItinerary[dayKey].places = [...newItinerary[dayKey].places]
          .sort((a, b) => (b.priority || 5) - (a.priority || 5))
          .slice(0, 3);
        newItinerary[dayKey].places = reorderDayByDistance(newItinerary[dayKey].places);
      });
      const newTotalCost = Object.values(newItinerary).reduce((sum, d) => sum + d.estimatedCost, 0);
      return { ...prev, itinerary: newItinerary, totalTripCost: newTotalCost, pace: "Relaxed" };
    });
  };

  const optimizeItinerary = async () => {
    if (!plan || !plan.itinerary || isOptimizing) return;
    setIsOptimizing(true);
    setPlan(prev => {
      const newItinerary = { ...prev.itinerary };
      Object.keys(newItinerary).forEach(dayKey => {
        newItinerary[dayKey].places = reorderDayByDistance(newItinerary[dayKey].places);
      });
      return { ...prev, itinerary: newItinerary };
    });
    setTimeout(() => setIsOptimizing(false), 1000);
  };

  const handleVisited = (dayKey, place, idx) => {
    if (user) {
      trackPreference(place.category, "visit");
    }
    setCurrentIndex(idx + 1);
    localStorage.setItem("tripCurrentIndex", idx + 1);
  };

  const handleStartTrip = () => {
    setIsExecuting(true);
    localStorage.setItem("tripExecuting", "true");
    if (currentIndex >= allPlaces.length) {
      setCurrentIndex(0);
      localStorage.setItem("tripCurrentIndex", 0);
    }
  };

  const handleCompleteStop = () => {
    const currentPlace = allPlaces[currentIndex];
    if (currentPlace) {
      handleVisited(null, currentPlace, currentIndex);
    }
  };

  const handleSkipStop = () => {
    setCurrentIndex(prev => {
      const next = prev + 1;
      localStorage.setItem("tripCurrentIndex", next);
      return next;
    });
  };

  const handleJumpToNext = () => {
    // Already same as skip in simple sequential mode
    handleSkipStop();
  };

  const getDayGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getTimeAwareSuggestion = () => {
    const hour = currentTime.getHours();
    if (hour >= 7 && hour < 10) return "Perfect time for a morning walk or spiritual visit.";
    if (hour >= 12 && hour < 14) return "Ideal time to explore local lunch spots.";
    if (hour >= 17 && hour < 19) return "Great time for sunset views or evening markets.";
    if (hour >= 20) return "Time to relax and enjoy the city's nightlife.";
    return "Keep exploring the hidden gems!";
  };

  const handleShare = async () => {
    if (!plan?.id && !saved) {
      const shouldSave = window.confirm("You need to save this trip to your profile before sharing. Save now?");
      if (shouldSave) {
        await handleSaveTrip();
      }
      return;
    }

    const shareUrl = `${window.location.origin}/trip/${plan?.id || routeTripId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My Trip to ${plan?.city}`,
          text: `Check out my travel plan for ${plan?.city} on Bharat Trip!`,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShareStatus(true);
        setTimeout(() => setShareStatus(false), 2000);
      } catch (err) {
        alert("Could not copy link. Manually copy: " + shareUrl);
      }
    }
  };

  const handleCloneTrip = () => {
    if (!plan) return;
    const clonedPlan = { ...plan, id: null, isShared: false, isNew: true };
    localStorage.setItem("tripPlan", JSON.stringify(clonedPlan));
    localStorage.setItem("tripCurrentIndex", 0);
    navigate("/results", { state: { plan: clonedPlan, isNew: true } });
    window.location.reload(); // Refresh to reset state
  };

  const allPlaces = useMemo(() => {
    if (!plan || !plan.itinerary) return [];
    const days = Object.keys(plan.itinerary);
    const city = plan.city || "Bangalore";
    return days.flatMap(d => (plan.itinerary[d]?.places || []).map(p => ({ ...p, city })));
  }, [plan]);

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
  const progressPercent = Math.round((currentIndex / (allPlaces.length || 1)) * 100);

  const handleCitySwitch = (idx) => {
    if (!multiCityContext) return;
    const selected = multiCityContext.tripStructure[idx];
    if (selected && selected.plan) {
      setPlan(selected.plan);
      setMultiCityContext(prev => ({ ...prev, currentIndex: idx }));
      setCurrentIndex(0);
      localStorage.setItem("tripCurrentIndex", 0);
    }
  };

  return (
    <div className="anchored-planner-root">
      <aside className="premium-itinerary-sidebar">
        <div className="sidebar-header-premium">
          <div className="header-top-row">
            <div className="premium-brand">
              <div className="brand-dot"></div>
              <span className="brand-text">Bharat Trip</span>
            </div>
            <button className="back-control" onClick={() => {
              if (isExecuting) {
                setIsExecuting(false);
                localStorage.setItem("tripExecuting", "false");
              } else if (multiCityContext) {
                navigate("/multi-city-overview", { state: { tripStructure: multiCityContext.tripStructure } });
              } else {
                navigate("/planner");
              }
            }}>
              {isExecuting ? "← Full Plan" : multiCityContext ? "← Trip Overview" : "← Edit Plan"}
            </button>
          </div>
          
          {multiCityContext && !isExecuting && (
            <div className="multi-city-nav-tabs">
              {multiCityContext.tripStructure.map((item, idx) => (
                <button 
                  key={idx}
                  className={`city-nav-tab ${multiCityContext.currentIndex === idx ? 'active' : ''}`}
                  onClick={() => handleCitySwitch(idx)}
                >
                  {item.city}
                </button>
              ))}
            </div>
          )}
          
          {!isExecuting ? (
            <div className="trip-hero-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
                <h1>{tripTitle || `${totalDays} Days in ${plan.city || "India"}`}</h1>
                <button className="start-trip-btn" onClick={handleStartTrip}>🚀 Start Trip</button>
              </div>
              <div className="trip-meta-pills">
                <span className="meta-pill">✨ {plan.travelerType || "Solo"}</span>
                <span className="meta-pill">⚡ {plan.pace || "Moderate"} Pace</span>
                <span className="meta-pill">📅 {totalDays} Days</span>
                <button className="meta-pill optimize-pill" onClick={optimizeItinerary}>🚀 Optimize Route</button>
              </div>
            </div>
          ) : (
            <div className="trip-hero-info execution-header">
              <div className="exec-greeting-row">
                <span className="exec-greeting">{getDayGreeting()}, {user?.name?.split(' ')[0] || "Traveler"}!</span>
                <span className="exec-time">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <p className="exec-suggestion">{getTimeAwareSuggestion()}</p>
            </div>
          )}
        </div>

        <div className="sidebar-scroll-content">
          {isExecuting ? (
            <div className="execution-mode-focused animate-in">
              {/* Progress Summary */}
              <div className="exec-progress-summary">
                <div className="exec-stat">
                  <span className="exec-stat-val">{currentIndex}</span>
                  <span className="exec-stat-label">Visited</span>
                </div>
                <div className="exec-stat">
                  <span className="exec-stat-val">{allPlaces.length - currentIndex}</span>
                  <span className="exec-stat-label">Remaining</span>
                </div>
                <div className="exec-progress-track">
                   <div className="exec-progress-fill" style={{ width: `${progressPercent}%` }}></div>
                </div>
              </div>

              {/* Current Stop Card */}
              {currentIndex < allPlaces.length ? (
                <div className="focused-stop-card current">
                  <span className="stop-status-tag current">CURRENT STOP</span>
                  <PlaceImage placeName={allPlaces[currentIndex].name} city={plan.city} className="focused-stop-img" />
                  <div className="focused-stop-body">
                    <h2>{allPlaces[currentIndex].name}</h2>
                    <p className="focused-stop-insight">{allPlaces[currentIndex].reason}</p>
                    
                    <div className="focused-action-row">
                      <button className="exec-action-btn complete" onClick={handleCompleteStop}>✅ Mark Completed</button>
                      <button className="exec-action-btn skip" onClick={handleSkipStop}>⏭️ Skip</button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="focused-stop-card completed">
                   <div className="confetti-icon">🎉</div>
                   <h2>Trip Completed!</h2>
                   <p>You've explored all planned destinations. Hope you had an amazing journey!</p>
                   <button className="btn-premium primary" onClick={() => setIsExecuting(false)}>View Summary</button>
                </div>
              )}

              {/* Next Stop Preview */}
              {currentIndex + 1 < allPlaces.length && (
                <div className="next-stop-preview">
                  <span className="stop-status-tag next">UP NEXT</span>
                  <div className="next-stop-row">
                    <div className="next-stop-info">
                      <h4>{allPlaces[currentIndex + 1].name}</h4>
                      <span>📍 {allPlaces[currentIndex + 1].category}</span>
                    </div>
                    <button className="exec-action-btn jump" onClick={handleJumpToNext}>Jump to →</button>
                  </div>
                </div>
              )}

              {/* Upcoming Queue */}
              {currentIndex + 2 < allPlaces.length && (
                <div className="upcoming-queue-section">
                  <h4 className="queue-title">Remaining stops today</h4>
                  <div className="queue-list">
                    {allPlaces.slice(currentIndex + 2).map((place, qIdx) => (
                      <div key={qIdx} className="queue-item">
                        <div className="queue-dot"></div>
                        <div className="queue-info">
                          <span className="queue-name">{place.name}</span>
                          <span className="queue-cat">{place.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {plan.summary && (
                <div className="plan-summary-card">
                  <h4 className="summary-title">Adaptive Intelligence</h4>
                  <p className="summary-text">{plan.summary}</p>
                  <div className="adaptive-controls">
                    <button className="adaptive-btn late" onClick={handleRunningLate}>🏃 Running Late</button>
                    <button className="adaptive-btn relax" onClick={handleRelaxMode}>🧘 Relax Mode</button>
                  </div>
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
                      for (let i = 0; i < dIdx; i++) globalIdx += (plan.itinerary[daysKeys[i]]?.places.length || 0);
                      const idx = globalIdx + pIdx;
                      const isVisited = idx < currentIndex;
                      const isCurrent = idx === currentIndex;

                      return (
                        <div key={idx} className={`premium-stop-card-v2 ${isVisited ? "visited" : ""} ${isCurrent ? "active" : "upcoming"}`}>
                          <div className="stop-marker-v2"></div>
                          <div className="stop-card-inner">
                            <div className="stop-top-row">
                              <PlaceImage placeName={place.name} city={plan.city} className="stop-image-v2" />
                              <div className="stop-details-v2">
                                <div className="stop-title-row">
                                  <h4>{place.name}</h4>
                                  {!isVisited && (
                                    <button className="skip-btn" onClick={(e) => { e.stopPropagation(); handleSkip(day, place.name); }} title="Skip Place">✕</button>
                                  )}
                                </div>
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
                                <button className="premium-action-btn" onClick={(e) => { e.stopPropagation(); handleVisited(day, place, idx); }}>Mark as Visited →</button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="sidebar-footer-premium">
          {!saved && !plan?.isShared && (
            <div className="public-toggle-row">
              <label className="public-switch">
                <input 
                  type="checkbox" 
                  checked={isPublic} 
                  onChange={(e) => setIsPublic(e.target.checked)} 
                />
                <span className="public-slider round"></span>
              </label>
              <span className="public-label">Make this trip public 🌍</span>
            </div>
          )}
          
          <div className="footer-summary-row">
            <div className="budget-estimate">
              <span className="budget-label">Est. Total Budget</span>
              <span className="budget-value">{formatPrice(totalTripCost)}</span>
            </div>
            <div className="footer-action-group">
              {plan?.isShared ? (
                <button className="save-journey-btn clone-btn" onClick={handleCloneTrip}>
                  ✨ Use This Plan
                </button>
              ) : (
                <>
                  <button 
                    className="share-journey-btn" 
                    onClick={handleShare}
                  >
                    {shareStatus ? "✅ Copied" : "🔗 Share"}
                  </button>
                  <button className="save-journey-btn" onClick={() => handleSaveTrip()} disabled={saving || saved}>
                    {saved ? "✓ Saved" : saving ? "Saving Journey..." : "Save Journey"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </aside>

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