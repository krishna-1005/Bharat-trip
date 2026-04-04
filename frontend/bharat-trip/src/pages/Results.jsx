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
  
  // FIXED: Initialize isGenerating immediately to prevent Map race conditions
  const [isGenerating, setIsGenerating] = useState(() => loc.state?.isNew || false);
  
  const [genStep, setGenStep] = useState("thinking");
  const [messageIdx, setMessageIdx] = useState(0);
  const [tripTitle, setTripTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shareStatus, setShareStatus] = useState(false);
  
  const [currentIndex, setCurrentIndex] = useState(() => {
    const savedIdx = localStorage.getItem("tripCurrentIndex");
    const parsed = parseInt(savedIdx, 10);
    return isNaN(parsed) ? 0 : parsed;
  });

  const [activePlace, setActivePlace] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const [isTracking, setIsTracking] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

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
            setPlan({ ...data.trip, itinerary: data.trip.itinerary || [], isShared: true });
            setTripTitle(data.trip.title || "");
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
    if (plan && !user && !plan.isShared) {
      try { localStorage.setItem("tripPlan", JSON.stringify(plan)); } catch(e) {}
    }
  }, [plan, user]);

  useEffect(() => {
    if (!isGenerating) return;
    const msgInterval = setInterval(() => setMessageIdx(prev => (prev + 1) % THINKING_MESSAGES.length), 800);
    const summaryTimeout = setTimeout(() => setGenStep("summary"), 2000);
    const doneTimeout = setTimeout(() => setIsGenerating(false), 5000);
    return () => { clearInterval(msgInterval); clearTimeout(summaryTimeout); clearTimeout(doneTimeout); };
  }, [isGenerating]);

  // ── HANDLERS ──
  const handleVisited = (idx) => {
    setCurrentIndex(idx + 1);
    localStorage.setItem("tripCurrentIndex", idx + 1);
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
          totalCost: plan.totalTripCost,
          totalBudget: plan.totalBudget,
          summary: plan.summary
        })
      });
      if (res.ok) setSaved(true);
    } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/trip/${plan?.id || routeTripId}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareStatus(true);
      setTimeout(() => setShareStatus(false), 2000);
    } catch (err) { alert(url); }
  };

  // ── MEMOS ──
  const normalizedItinerary = useMemo(() => {
    if (!plan || !plan.itinerary) return [];
    return Array.isArray(plan.itinerary) ? plan.itinerary : Object.entries(plan.itinerary).map(([day, data]) => ({ day, ...data }));
  }, [plan]);

  const allPlaces = useMemo(() => normalizedItinerary.flatMap(d => (d.places || []).map(p => ({ ...p, day: d.day }))), [normalizedItinerary]);

  const budgetData = useMemo(() => {
    if (!plan) return { total: 0, target: 0, percent: 0, isOver: false };
    const total = plan.totalTripCost || 0;
    const target = plan.totalBudget || 0;
    const max = Math.max(total, target, 1);
    return { total, target, percent: (total / max) * 100, isOver: total > target };
  }, [plan]);

  // ── RENDERS ──
  if (loading) return (
    <div className="ai-gen-overlay center-fixed">
      <div className="premium-pulse-ring"></div>
      <h2 className="ai-loader-text">Loading Your Odyssey...</h2>
    </div>
  );

  if (isGenerating && plan) return (
    <div className="ai-gen-overlay center-fixed">
      <AnimatePresence mode="wait">
        {genStep === "thinking" ? (
          <motion.div key="think" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="ai-loader-container">
            <div className="premium-pulse-ring"></div>
            <h2 className="ai-loader-text">{THINKING_MESSAGES[messageIdx]}</h2>
          </motion.div>
        ) : (
          <motion.div key="sum" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="ai-gen-summary-box">
            <span className="ai-sparkle-badge">✨ AI Complete</span>
            <h2 style={{ color: '#fff', fontSize: '28px', margin: '15px 0' }}>Odyssey Ready</h2>
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
      <button className="primary-action-btn" onClick={() => navigate("/")}>Return to Planner</button>
    </div>
  );

  const currentStop = allPlaces[currentIndex];
  const nextStop = allPlaces[currentIndex + 1];
  const progress = Math.round((currentIndex / (allPlaces.length || 1)) * 100);

  // MOBILE MAP VIEW
  if (isMobile && isMapViewRoute) {
    return (
      <div className="anchored-planner-root mobile-map-mode">
        <div className="map-half">
          <MapView plan={plan} currentIndex={currentIndex} activePlace={activePlace} onHover={setActivePlace} isTracking={isTracking} userLocation={userLocation} />
          <button className="back-to-itin-btn" onClick={() => navigate("/results")}>📋 VIEW PLAN</button>
          <div className="map-stats-overlay">
            <div className="stat-pill">📍 {allPlaces.length - currentIndex} Left</div>
          </div>
        </div>

        <div className="live-guide-half">
          <div className="ai-insight-box">
            <div className="insight-header">
              <span className="ai-brain-icon">🧠</span>
              <span className="insight-label">AI TRAVEL INSIGHT</span>
            </div>
            <p className="insight-text">
              {currentStop ? `Tip: ${currentStop.name} is stunning right now. Head to the higher vantage points for the best panoramic views!` : "You've successfully completed your odyssey!"}
            </p>
          </div>

          {currentStop ? (
            <div className="focus-card-premium">
              <div className="status-indicator-row">
                <span className="live-dot-pulse"></span>
                <span className="status-label">NOW VISITING</span>
              </div>
              <PlaceImage placeName={currentStop.name} city={plan.city} className="card-hero-img" />
              <h3 className="card-title-premium">{currentStop.name}</h3>
              <p className="description-text">{currentStop.reason}</p>
              <div className="card-actions-grid">
                <button className="action-main-btn" onClick={() => handleVisited(currentIndex)}>Visited</button>
                <button className="action-sub-btn" onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${currentStop.lat},${currentStop.lng}`, '_blank')}>Navigate</button>
              </div>
            </div>
          ) : (
            <div style={{textAlign:'center', padding:'40px 0'}}><h2>Odyssey Complete! 🏁</h2></div>
          )}

          {nextStop && (
            <div className="next-stop-card-upgraded">
              <span className="next-tag">UP NEXT</span>
              <div className="next-content-inner">
                <PlaceImage placeName={nextStop.name} city={plan.city} className="next-img" />
                <h4>{nextStop.name}</h4>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // DEFAULT VIEW
  return (
    <div className={`anchored-planner-root ${isMobile ? "mobile-itinerary-mode" : ""}`}>
      <aside className="premium-itinerary-sidebar">
        <div className="sidebar-header-premium">
          <div className="header-top-row">
            <div className="premium-brand"><div className="brand-glow-dot"></div><span className="brand-text">Bharat Trip</span></div>
            <button className="back-control" onClick={() => navigate("/planner")}>← Edit</button>
          </div>
          <h1>{tripTitle || `${plan.city} Odyssey`}</h1>
        </div>

        <div className="sidebar-scroll-content">
          <BudgetPanel budgetData={budgetData} formatPrice={formatPrice} />
          {normalizedItinerary.map((day, dIdx) => (
            <div key={dIdx} className="premium-day-section">
              <div className="day-title-row">
                <div className="day-badge">{dIdx + 1}</div>
                <h3>Day {dIdx + 1}: {day.day}</h3>
              </div>
              {day.places?.map((place, pIdx) => {
                const gIdx = allPlaces.indexOf(place);
                return (
                  <div key={pIdx} className={`premium-stop-card-v2 ${gIdx === currentIndex ? "active" : ""} ${gIdx < currentIndex ? "visited" : ""}`}>
                    <div className="stop-card-image-wrap">
                      <PlaceImage placeName={place.name} city={plan.city} className="stop-image-v2" />
                    </div>
                    <div className="stop-info-v2">
                      <div style={{display:'flex', justifyContent:'space-between'}}>
                        <span className="stop-tag-v2">{place.category}</span>
                        <span style={{fontSize:'12px', fontWeight:'700', color:'var(--accent-success)'}}>₹{place.estimatedCost}</span>
                      </div>
                      <h4>{place.name}</h4>
                      <p className="stop-reason-text">{place.reason}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="sidebar-footer-premium">
          {!isMobile && (
            <div className="action-btn-group">
              <button className="primary-action-btn" onClick={handleSaveTrip} disabled={saved || saving}>{saved ? "Saved ✓" : "Save Journey"}</button>
              <button className="secondary-action-btn" onClick={handleShare}>Share</button>
            </div>
          )}
          {isMobile && (
            <button className="mobile-view-switcher" onClick={() => navigate("/map")}>🗺️ START GUIDED TRIP</button>
          )}
        </div>
      </aside>

      {!isMobile && (
        <main className="planner-map-foundation">
          <MapView plan={plan} currentIndex={currentIndex} activePlace={activePlace} onHover={setActivePlace} isTracking={isTracking} userLocation={userLocation} />
        </main>
      )}
    </div>
  );
}

export default Results;
