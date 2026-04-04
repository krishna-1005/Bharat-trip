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
  "AI is analyzing your travel preferences...",
  "Crafting a bespoke itinerary for you...",
  "Our AI engine is optimizing your route...",
  "Synchronizing local narrative layers...",
  "Finalizing your high-fidelity odyssey...",
  "Almost there! AI is polishing your plan..."
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
  const [isGenerating, setIsGenerating] = useState(() => loc.state?.isNew || false);
  const [genStep, setGenStep] = useState("thinking");
  const [messageIdx, setMessageIdx] = useState(0);
  const [tripTitle, setTripTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shareStatus, setShareStatus] = useState(false);
  
  const [currentIndex, setCurrentIndex] = useState(() => {
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

  // ── MEMOS ──
  const normalizedItinerary = useMemo(() => {
    if (!plan || !plan.itinerary) return [];
    try {
      return Array.isArray(plan.itinerary) 
        ? plan.itinerary 
        : Object.entries(plan.itinerary).map(([day, data]) => ({ day, ...data }));
    } catch (e) {
      console.error("Failed to normalize itinerary:", e);
      return [];
    }
  }, [plan]);

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
      targetPercent: isNaN(targetPercent) ? 100 : targetPercent
    };
  }, [plan]);

  // ── EFFECTS ──
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const loadPlan = async () => {
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
  }, [loc.state, routeTripId, loc.search]);

  useEffect(() => {
    if (!isGenerating) return;
    const maxSafetyTimeout = setTimeout(() => setIsGenerating(false), 8000);
    const msgInterval = setInterval(() => setMessageIdx(prev => (prev + 1) % THINKING_MESSAGES.length), 1200);
    const summaryTimeout = setTimeout(() => setGenStep("summary"), 2500);
    const doneTimeout = setTimeout(() => setIsGenerating(false), 5500);
    return () => { 
      clearInterval(msgInterval); 
      clearTimeout(summaryTimeout); 
      clearTimeout(doneTimeout);
      clearTimeout(maxSafetyTimeout);
    };
  }, [isGenerating]);

  // ── HANDLERS ──
  const handleVisited = (idx) => {
    const nextIdx = idx + 1;
    setCurrentIndex(nextIdx);
    localStorage.setItem("tripCurrentIndex", nextIdx);
  };

  const handleSaveTrip = async () => {
    if (saving || saved || !plan) return;
    if (!user) { setShowAuthModal(true); return; }
    setSaving(true);
    try {
      const token = await auth.currentUser?.getIdToken(true);
      const res = await fetch(`${API}/api/profile/trips`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: tripTitle || `${plan.city} Trip`,
          city: plan.city,
          days: plan.days || 1,
          itinerary: plan.itinerary,
          totalCost: plan.totalTripCost || plan.totalCost,
          totalBudget: plan.totalBudget,
          summary: plan.summary
        })
      });
      if (res.ok) setSaved(true);
    } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/trip/${plan?.id || routeTripId || ''}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareStatus(true);
      setTimeout(() => setShareStatus(false), 2000);
    } catch (err) { alert(url); }
  };

  // ── RENDERS ──
  if (loading) return (
    <div className="ai-gen-overlay">
      <div className="premium-pulse-ring">
        <div className="brand-glow-dot"></div>
      </div>
      <h2 className="ai-loader-text">Summoning Your Odyssey...</h2>
    </div>
  );

  if (isGenerating && plan) return (
    <div className="ai-gen-overlay">
      <AnimatePresence mode="wait">
        {genStep === "thinking" ? (
          <motion.div key="think" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="ai-loader-container">
            <div className="premium-pulse-ring"></div>
            <h2 className="ai-loader-text">{THINKING_MESSAGES[messageIdx]}</h2>
          </motion.div>
        ) : (
          <motion.div key="sum" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="ai-gen-summary-box">
            <span className="ai-sparkle-badge">✨ AI Synthesis Complete</span>
            <h2 style={{ color: '#fff', fontSize: '32px', margin: '20px 0', fontWeight: 800 }}>Your Odyssey is Ready</h2>
            <p className="ai-summary-text-large">{plan.summary}</p>
            <div className="ai-countdown-loader"></div>
          </motion.div>
        )}
      </AnimatePresence>
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
          
          <div className="itinerary-days-container">
            {normalizedItinerary.map((day, dIdx) => (
              <motion.div 
                key={dIdx} 
                className="premium-day-section"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + dIdx * 0.1 }}
              >
                <div className="day-title-row">
                  <div className="day-badge">{dIdx + 1}</div>
                  <h3>Day {dIdx + 1}: {day.day || day.title || `Exploration`}</h3>
                </div>
                <div className="day-stops-list">
                  {day.places?.map((place, pIdx) => {
                    const gIdx = allPlaces.indexOf(place);
                    const isActive = gIdx === currentIndex;
                    const isVisited = gIdx < currentIndex;
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
                        </div>
                        <div className="stop-info-v3">
                          <div className="stop-meta-v3">
                            <span className="stop-tag-v3">{place.category}</span>
                            <span className="stop-cost-v3">{formatPrice(place.estimatedCost || 0)}</span>
                          </div>
                          <h4>{place.name}</h4>
                          <p className="stop-reason-v3">{place.reason}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
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
          />
        </main>
      )}
    </div>
  );
}

export default Results;