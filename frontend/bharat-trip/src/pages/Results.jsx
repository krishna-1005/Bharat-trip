import { useLocation, useNavigate, useParams } from "react-router-dom";
import MapView from "../components/Map/MapView";
import PlaceImage from "../components/PlaceImage";
import CategoryCostBreakdown from "../components/CategoryCostBreakdown";
import BudgetPanel from "../components/BudgetPanel";
import { calculateDistance, calculateTravelCost, filterAndSortPlaces } from "../utils/travelUtils";
import "./results.css";
import { useState, useEffect, useMemo, useContext, useCallback } from "react";
import { useSettings } from "../context/SettingsContext";
import { AuthContext } from "../context/AuthContext";
import { auth } from "../firebase";
import { AnimatePresence, motion } from "framer-motion";

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "");

const THINKING_MESSAGES = [
  "Scouting for hidden local gems...",
  "Mapping out the most scenic routes...",
  "Consulting local experts and datasets...",
  "Balancing your daily travel pace...",
  "Finding the best food and culture spots...",
  "Optimizing your travel itinerary...",
  "Selecting iconic landmarks for you...",
  "Crafting your personalized odyssey...",
  "Polishing your bespoke travel plan...",
  "Finalizing your dream adventure..."
];

const INTERACTIVE_QUESTIONS = [
  {
    id: "morning",
    question: "What's your ideal travel morning?",
    options: ["Sunrise trek", "Lazy brunch", "Local markets", "Yoga session"]
  },
  {
    id: "transport",
    question: "Preferred way to get around?",
    options: ["Walking", "Local Rickshaw", "Rental Bike", "Metro/Bus"]
  },
  {
    id: "experience",
    question: "Must-have travel experience?",
    options: ["Street Food", "Historic Sites", "Nature/Parks", "Shopping"]
  },
  {
    id: "packing",
    question: "Packing style?",
    options: ["Light & Fast", "Carry-all", "Tech-heavy", "Essentialist"]
  }
];

function Results() {
  const navigate = useNavigate();
  const loc = useLocation();
  const { id: routeTripId } = useParams();
  const { formatPrice } = useSettings();
  const { user, setShowAuthModal } = useContext(AuthContext);

  const isMapViewRoute = loc.pathname === "/map";

  // ── STATE ──
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(() => {
    // Only enter generation mode if it's a 'new' request AND we have params to generate from
    const isNew = (loc.state?.isNew && loc.state?.planParams) || false;
    
    if (isNew) {
      // Clear the state so refresh doesn't trigger "isNew" logic again
      window.history.replaceState({ ...loc.state, isNew: false }, "");
    }
    return isNew;
  });
  const [genStep, setGenStep] = useState("thinking"); // "thinking" | "summary"
  const [apiStatus, setApiStatus] = useState("idle"); // "idle" | "requesting" | "success" | "error"
  const [messageIdx, setMessageIdx] = useState(0);
  const [tripTitle, setTripTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shareStatus, setShareStatus] = useState(false);

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userPreferences, setUserPreferences] = useState({
    morning: "",
    transport: "",
    experience: "",
    packing: ""
  });
  const [genProgress, setGenProgress] = useState(0);

  const [currentIndex, setCurrentIndex] = useState(() => {
    if (loc.state?.isNew) {
      localStorage.setItem("tripCurrentIndex", 0);
      return 0;
    }
    try {
      const savedIdx = localStorage.getItem("tripCurrentIndex");
      const parsed = parseInt(savedIdx, 10);
      return isNaN(parsed) ? 0 : parsed;
    } catch (e) {
      return 0;
    }
  });

  const [activePlace, setActivePlace] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const [userLocation, setUserLocation] = useState(null);

  const [aiLogs, setAiLogs] = useState([]);

  useEffect(() => {
    if (!isGenerating) return;

    const logInterval = setInterval(() => {
        const logPrefixes = ["> [SCOUT]", "> [ROUTE]", "> [LOCAL]", "> [MAP]"];
        const logMsgs = [
            "Hidden cafe found in Old Town",
            "Optimizing walking distance...",
            "Checking local opening hours...",
            "Scenic viewpoint added to Day 2",
            "Matching budget with local prices",
            "Selecting premium photo spots",
            "Validating transit connections"
        ];
        const newLog = `${logPrefixes[Math.floor(Math.random()*logPrefixes.length)]} ${logMsgs[Math.floor(Math.random()*logMsgs.length)]}`;
        setAiLogs(prev => [newLog, ...prev.slice(0, 5)]);
    }, 2000);

    return () => clearInterval(logInterval);
  }, [isGenerating]);

  // ── MEMOS ──

  const normalizedItinerary = useMemo(() => {
    if (!plan || !plan.itinerary) return [];
    try {
      const rawItin = Array.isArray(plan.itinerary) 
        ? plan.itinerary 
        : Object.entries(plan.itinerary).map(([day, data]) => ({ day, ...data }));

      // Determine if we should apply distance filtering
      // Only filter if user is within 100km of the destination city center
      let shouldFilter = false;
      if (userLocation && plan.coordinates) {
        const distToCity = calculateDistance(
          userLocation.lat, userLocation.lng, 
          plan.coordinates.lat, plan.coordinates.lng
        );
        if (distToCity !== null && distToCity < 100) {
          shouldFilter = true;
        }
      }

      return rawItin.map(day => ({
        ...day,
        places: shouldFilter ? filterAndSortPlaces(day.places, userLocation) : day.places
      }));
    } catch (e) {
      console.error("Failed to normalize itinerary:", e);
      return [];
    }
  }, [plan, userLocation]);

  const allPlaces = useMemo(() => {
    try {
      return normalizedItinerary.flatMap(d => (d?.places || []).map(p => ({ ...p, day: d?.day })));
    } catch (e) {
      console.error("Failed to flatten allPlaces:", e);
      return [];
    }
  }, [normalizedItinerary]);

  const budgetData = useMemo(() => {
    if (!plan) return { total: 0, target: 0, percent: 0, isOver: false, targetPercent: 100 };
    const total = Number(plan.totalTripCost || plan.totalCost) || 0;
    const target = Number(plan.totalBudget) || 0;
    const max = Math.max(total, target, 1);
    const percent = (total / max) * 100;
    const targetPercent = (target / max) * 100;

    return { 
      total, 
      target, 
      percent: isNaN(percent) ? 0 : percent, 
      isOver: total > target,
      targetPercent: isNaN(targetPercent) ? 100 : targetPercent,
      breakdown: plan.costBreakdown || null
    };
  }, [plan]);

  const [guideMode, setGuideMode] = useState(false);

  // ── EFFECTS ──
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Request user location for filtering
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn("Geolocation denied, filtering disabled.", err)
      );
    }
  }, []);

  useEffect(() => {
    const loadPlan = async () => {
      // If we are generating a new plan, we don't "load" an existing one yet
      if (isGenerating) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const params = new URLSearchParams(loc.search);
      const sharedId = params.get("sharedTripId") || routeTripId;

      try {
        if (sharedId) {
          const res = await fetch(`${API}/api/public/trips/${sharedId}`);
          const data = await res.json();
          if (res.ok && data.trip) {
            const p = data.trip;
            setPlan({ ...p, itinerary: p.itinerary || [] });
            setTripTitle(p.title || "");
            setLoading(false);
            return;
          }
        }

        if (loc.state?.plan) {
          setPlan(loc.state.plan);
          setTripTitle(loc.state.plan.title || "");
        } else {
          const savedPlanStr = localStorage.getItem("tripPlan");
          if (savedPlanStr && savedPlanStr !== "undefined") {
            const parsed = JSON.parse(savedPlanStr);
            setPlan(parsed);
            setTripTitle(parsed.title || "");
          }
        }
      } catch (err) {
        console.error("Plan loading error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadPlan();
  }, [loc.state, routeTripId, loc.search, isGenerating]);

  // ── GENERATION LOGIC ──

  const triggerPlanGeneration = useCallback(async (prefs) => {
    if (apiStatus !== "idle" || !loc.state?.planParams) return;
    
    setApiStatus("requesting");
    try {
      const token = await auth.currentUser?.getIdToken(true);
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API}/api/plan/generate`, {
        method: "POST",
        headers,
        body: JSON.stringify({ 
          ...loc.state.planParams,
          userPreferences: prefs // Send the collected preferences
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate plan");

      setPlan(data.plan);
      setTripTitle(data.plan.title || "");
      localStorage.setItem("tripPlan", JSON.stringify(data.plan));
      setApiStatus("success");
      setGenStep("summary");
      
      // Auto-exit generation mode after summary
      setTimeout(() => setIsGenerating(false), 5000);
    } catch (err) {
      console.error("Generation error:", err);
      setApiStatus("error");
      // Fallback: stop generation mode so user can see error or return
      setIsGenerating(false);
    }
  }, [loc.state, apiStatus]);

  // Trigger API Call when quiz finishes OR timeout reaches
  useEffect(() => {
    if (!isGenerating || apiStatus !== "idle") return;

    // Timeout fallback (8 seconds)
    const timeout = setTimeout(() => {
      if (apiStatus === "idle") {
        triggerPlanGeneration(userPreferences);
      }
    }, 10000);

    // If all questions are answered, trigger immediately
    const allAnswered = Object.values(userPreferences).every(v => v !== "");
    if (allAnswered) {
      triggerPlanGeneration(userPreferences);
    }

    return () => clearTimeout(timeout);
  }, [userPreferences, isGenerating, apiStatus, triggerPlanGeneration]);

  // Visual Progress Simulation
  useEffect(() => {
    if (!isGenerating || apiStatus === "success") return;

    const progressInterval = setInterval(() => {
      setGenProgress(prev => {
        if (prev >= 95 && apiStatus !== "success") return prev;
        return Math.min(prev + 0.5, 100);
      });
      
      setMessageIdx(prev => (prev + 1) % THINKING_MESSAGES.length);
    }, 800);

    return () => clearInterval(progressInterval);
  }, [isGenerating, apiStatus]);

  // ── HANDLERS ──
  const handleAnswer = (questionId, option) => {
    setUserPreferences(prev => ({ ...prev, [questionId]: option }));
    if (currentQuestionIdx < INTERACTIVE_QUESTIONS.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    }
  };

  const handleVisited = (idx) => {
    const nextIdx = idx + 1;
    setCurrentIndex(nextIdx);
    localStorage.setItem("tripCurrentIndex", nextIdx);
  };

  const handleSaveTrip = useCallback(async () => {
    if (saving || saved) return;
    
    // Fallback: if plan state is lost but we have a pending one in localStorage
    let planToSave = plan;
    if (!planToSave) {
      const pending = localStorage.getItem("pendingGuestTrip");
      if (pending) {
        try {
          planToSave = JSON.parse(pending);
        } catch (e) {
          console.error("Failed to parse pending plan", e);
        }
      }
    }

    if (!planToSave) {
      console.warn("Save attempted but no plan found.");
      return;
    }
    
    if (!user) { 
      console.log("Guest mode: caching plan for lazy save");
      localStorage.setItem("pendingGuestTrip", JSON.stringify(planToSave));
      setShowAuthModal(true); 
      return; 
    }

    setSaving(true);
    try {
      // Ensure we have a fresh token
      const token = await auth.currentUser?.getIdToken(true);
      if (!token) {
        console.error("Save failed: No Firebase token available.");
        setSaving(false);
        return;
      }

      console.log("Saving trip to profile...");
      const res = await fetch(`${API}/api/profile/trips`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          title: tripTitle || `${planToSave.city} Trip`,
          city: planToSave.city,
          days: planToSave.days || 1,
          itinerary: planToSave.itinerary,
          totalCost: planToSave.totalTripCost || planToSave.totalCost,
          totalBudget: planToSave.totalBudget,
          summary: planToSave.summary
        })
      });

      const data = await res.json();

      if (res.ok) {
        console.log("Trip saved successfully:", data);
        setSaved(true);
        setSaving(false); // Immediate reset
        localStorage.removeItem("pendingGuestTrip"); // Clear if saved
      } else {
        console.error("Backend save error:", data.error || "Unknown error");
        setSaving(false);
      }
    } catch (err) { 
      console.error("Save fetch error:", err); 
      setSaving(false);
    }
  }, [saving, saved, plan, user, tripTitle, setShowAuthModal]);

  // ── LAZY SAVE EFFECT ──
  useEffect(() => {
    if (user && !saved && !saving) {
      const pending = localStorage.getItem("pendingGuestTrip");
      if (pending) {
        console.log("Detected pending guest trip, triggering auto-save...");
        handleSaveTrip();
      }
    }
  }, [user, saved, saving, handleSaveTrip]);

  const handleShare = async () => {
    const url = `${window.location.origin}/trip/${plan?.id || routeTripId || ''}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareStatus(true);
      setTimeout(() => setShareStatus(false), 2000);
    } catch (err) { alert(url); }
  };

  // ── RENDERS ──
  if (loading || (isGenerating && genStep === "thinking")) return (
    <div className="ai-gen-overlay">
      <div className="ai-gen-grid"></div>
      <div className="ai-gen-blobs">
        <div className="gen-blob blob-1"></div>
        <div className="gen-blob blob-2"></div>
      </div>
      
      <div className="ai-gen-centered-v2">
        <div className="ai-neural-container">
            <div className="ai-neural-core">
                <div className="neural-orbit orbit-1"></div>
                <div className="neural-orbit orbit-2"></div>
                <div className="neural-orbit orbit-3"></div>
                <div className="neural-center-glow"></div>
                <div className="neural-brain-icon">🧭</div>
            </div>

            <div className="ai-status-panel">
                <h2 className="ai-loader-text-v2">
                    {THINKING_MESSAGES[messageIdx]}
                </h2>
                
                <div className="ai-processing-log">
                    {aiLogs.map((log, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1 - (i * 0.15), x: 0 }}
                            className="ai-log-entry"
                        >
                            {log}
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>

        {/* INTERACTIVE QUIZ SECTION */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentQuestionIdx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="ai-interactive-quiz"
          >
            <span className="quiz-badge">WHILE YOU WAIT</span>
            <h3 className="quiz-question">{INTERACTIVE_QUESTIONS[currentQuestionIdx].question}</h3>
            <div className="quiz-options">
              {INTERACTIVE_QUESTIONS[currentQuestionIdx].options.map((opt, i) => (
                <button 
                  key={i} 
                  className={`quiz-opt-btn ${userPreferences[INTERACTIVE_QUESTIONS[currentQuestionIdx].id] === opt ? "selected" : ""}`}
                  onClick={() => handleAnswer(INTERACTIVE_QUESTIONS[currentQuestionIdx].id, opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
            <div className="quiz-dots">
                {INTERACTIVE_QUESTIONS.map((_, i) => (
                  <div key={i} className={`quiz-dot ${i === currentQuestionIdx ? "active" : ""} ${userPreferences[INTERACTIVE_QUESTIONS[i].id] ? "completed" : ""}`}></div>
                ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      <div className="ai-progress-wrap">
          <div className="ai-progress-bar">
              <motion.div 
                className="ai-progress-fill"
                initial={{ width: "0%" }}
                animate={{ width: `${genProgress}%` }}
              ></motion.div>
          </div>
          <span className="ai-perc-text">{Math.floor(genProgress)}% ANALYZING DESTINATIONS</span>
      </div>
    </div>
  );

  if (isGenerating && plan && genStep === "summary") return (
    <div className="ai-gen-overlay summary-reveal">
      <div className="ai-gen-grid"></div>
      <div className="ai-gen-blobs">
        <div className="gen-blob blob-1"></div>
        <div className="gen-blob blob-3"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        className="ai-gen-summary-box-v2"
      >
        <motion.div 
          initial={{ rotate: -180, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="ai-success-icon"
        >
          ✨
        </motion.div>
        <span className="ai-sparkle-badge-v2">Neural Synthesis Complete</span>
        <h2>Your Odyssey is Ready</h2>
        <div className="ai-summary-divider"></div>
        <p className="ai-summary-text-v2">{plan.summary}</p>
        <div className="ai-entry-button-wrap">
            <div className="ai-countdown-loader-v2"></div>
            <span>ENTERING ODYSSEY...</span>
        </div>
      </motion.div>
    </div>
  );

  if (!plan) return (
    <div className="res-empty" style={{height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px'}}>
      <h2>No plan found</h2>
      <button className="primary-action-btn" onClick={() => navigate("/planner")}>Return to Planner</button>
    </div>
  );

  const currentStop = allPlaces[currentIndex];
  const nextStop = allPlaces[currentIndex + 1];

  // MOBILE MAP VIEW
  if (isMobile && isMapViewRoute) {
    return (
      <div className="anchored-planner-root mobile-map-mode">
        <div className="map-half">
          <MapView plan={plan} currentIndex={currentIndex} activePlace={activePlace} onHover={setActivePlace} userLocation={userLocation} setUserLocation={setUserLocation} />
          <button className="back-to-itin-btn" onClick={() => navigate("/results")}>✕ CLOSE MAP</button>
        </div>

        <div className="live-guide-half">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="ai-insight-box"
          >
            <div className="insight-header">
              <span className="insight-label">✨ AI INSIGHT</span>
            </div>
            <p className="insight-text">
              {currentStop ? `${currentStop.name} is best experienced right now. Keep an eye out for local artisans nearby!` : "You've reached the end of your scheduled odyssey!"}
            </p>
          </motion.div>

          {currentStop ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="focus-card-premium"
            >
              <PlaceImage placeName={currentStop.name} city={plan.city} className="card-hero-img" />
              <h3 className="card-title-premium">{currentStop.name}</h3>
              <p className="description-text">{currentStop.reason}</p>
              <div className="card-actions-grid">
                <button className="action-main-btn" onClick={() => handleVisited(currentIndex)}>Visited</button>
                <button className="action-sub-btn" onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${currentStop.lat},${currentStop.lng}`, '_blank')}>🛰️ Live Track</button>
              </div>
            </motion.div>
          ) : (
            <div style={{textAlign:'center', padding:'40px 0'}}><h2>Odyssey Complete! 🏁</h2></div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="anchored-planner-root">
      <aside className="premium-itinerary-sidebar">
        <div className="sidebar-header-premium">
          <div className="header-top-row">
            <div className="premium-brand">
              <div className="brand-glow-dot"></div>
              <span className="brand-text">Bharat Trip</span>
            </div>
            <button className="back-control" onClick={() => navigate("/planner")}>← Edit Plan</button>
          </div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {tripTitle || `${plan.city} Odyssey`}
          </motion.h1>
        </div>

        <div className="sidebar-scroll-content">
          <motion.div 
            className="trip-overview-premium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="stat-label-small">Experience Overview</div>
            <div className="overview-stats">
              <div className="stat-box">
                <span className="stat-label-small">Duration</span>
                <span className="stat-value-mid">{plan.days} Days</span>
              </div>
              <div className="stat-box">
                <span className="stat-label-small">Stops</span>
                <span className="stat-value-mid">{allPlaces.length} Places</span>
              </div>
              <div className="stat-box">
                <span className="stat-label-small">Budget</span>
                <span className="stat-value-mid">{formatPrice(budgetData.total)}</span>
              </div>
            </div>
          </motion.div>

          <BudgetPanel budgetData={budgetData} formatPrice={formatPrice} variant="inline" />

          <div className="guide-mode-toggle-wrap">
            <button 
              className={`guide-mode-btn ${guideMode ? "active" : ""}`}
              onClick={() => setGuideMode(!guideMode)}
            >
              {guideMode ? "✨ Guide Me: ON" : "🧭 Enable Guide Mode"}
            </button>
          </div>
          
          <div className="itinerary-days-container">
            {(() => {
              let globalStopIdx = 0;
              return normalizedItinerary.map((day, dIdx) => {
                const isLocked = !user && dIdx > 0;
                
                return (
                  <motion.div 
                    key={dIdx} 
                    className={`premium-day-section ${isLocked ? "guest-locked" : ""}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + dIdx * 0.1 }}
                  >
                    <div className="day-title-row">
                      <div className="day-badge">{dIdx + 1}</div>
                      <h3>
                        Day {dIdx + 1}: {
                          (day.title && day.title !== (dIdx + 1).toString()) 
                            ? day.title 
                            : (day.label && day.label !== `Day ${dIdx + 1}`)
                              ? day.label
                              : `Exploration`
                        }
                      </h3>
                    </div>

                    {isLocked && (
                      <div className="glass-lock-overlay">
                        <div className="lock-content">
                          <span className="lock-icon">🔒</span>
                          <h4>Full Odyssey Locked</h4>
                          <p>Sign in to unlock the remaining {normalizedItinerary.length - 1} days and save this trip to your profile.</p>
                          <button className="unlock-btn" onClick={() => handleSaveTrip()}>
                            Unlock Full Itinerary
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="day-stops-list">
                    {day.places?.map((place, pIdx) => {
                      const currentIdx = globalStopIdx++;
                      const isActive = currentIdx === currentIndex;
                      const isVisited = currentIdx < currentIndex;
                      return (
                        <motion.div 
                          key={pIdx} 
                          className={`premium-stop-card-v3 ${isActive ? "active" : ""} ${isVisited ? "visited" : ""}`}
                          whileHover={{ x: 8 }}
                          onMouseEnter={() => setActivePlace(place)}
                          onMouseLeave={() => setActivePlace(null)}
                          onClick={() => {
                            setActivePlace(place);
                            if (isMobile) navigate("/map");
                          }}
                        >
                          <div className="stop-image-wrap-v3">
                            <PlaceImage placeName={place.name} city={plan.city} className="stop-image-v3" />
                            {isVisited && <div className="visited-check-v3">✓</div>}
                            {isActive && <div className="active-glow-v3"></div>}
                          </div>
                          <div className="stop-info-v3">
                            <div className="stop-meta-v3">
                              <span className="stop-tag-v3">{place.category}</span>
                              <div className="stop-trust-v3">
                                <span className="star-v3">⭐</span>
                                <span className="rating-v3">{place.rating || "4.5"}</span>
                                <span className="reviews-v3">({place.reviews || "1.2k"})</span>
                              </div>
                            </div>
                            <h4>{place.name}</h4>
                            
                            <div className="stop-details-v3">
                              <span className="detail-item-v3">🕒 {place.timeHours || 2}h visit</span>
                              <span className="detail-item-v3">💰 {formatPrice(place.estimatedCost || 0)}</span>
                            </div>

                            <p className="stop-reason-v3">
                              {guideMode && isActive ? (
                                <span className="guide-insight">✨ {place.reason}</span>
                              ) : place.reason}
                            </p>

                            {place.tags && place.tags.length > 0 && (
                              <div className="stop-tags-list-v3">
                                {place.tags.slice(0, 2).map((t, ti) => (
                                  <span key={ti} className="mini-tag-v3">#{t}</span>
                                ))}
                              </div>
                            )}

                            {isActive && (
                              <div className="stop-actions-v3">
                                <button 
                                  className="live-track-btn-v3" 
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`, '_blank');
                                  }}
                                >
                                  🛰️ Live Track
                                </button>
                                <button className="mark-done-btn-v3" onClick={(e) => { e.stopPropagation(); handleVisited(currentIdx); }}>
                                  Mark as Visited
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            });
          })()}
        </div>
        </div>

        <div className="sidebar-footer-premium">
          {!isMobile ? (
            <div className="action-btn-group">
              <button className="primary-action-btn" onClick={handleSaveTrip} disabled={saved || saving}>
                {saving ? "Saving..." : saved ? "Journey Saved ✓" : "Save to Profile"}
              </button>
              <button className="secondary-action-btn" onClick={handleShare}>
                {shareStatus ? "Link Copied!" : "Share Journey"}
              </button>
            </div>
          ) : (
            <button className="mobile-view-switcher" onClick={() => navigate("/map")}>
              🗺️ Open Interactive Map
            </button>
          )}
        </div>
      </aside>

      {!isMobile && (
        <main className="planner-map-foundation">
          <MapView 
            plan={plan} 
            currentIndex={currentIndex} 
            activePlace={activePlace} 
            onHover={setActivePlace} 
            userLocation={userLocation} 
            setUserLocation={setUserLocation} 
          />
        </main>
      )}

      {isMobile && !isMapViewRoute && (
        <motion.button 
          className="mobile-floating-map-btn"
          onClick={() => navigate("/map")}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="map-btn-icon">🗺️</span>
          <span className="map-btn-text">View Map</span>
        </motion.button>
      )}
    </div>
  );
}

export default Results;