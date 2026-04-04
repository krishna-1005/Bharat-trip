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
  const { user } = useContext(AuthContext);

  const isMapViewRoute = loc.pathname === "/map";

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStep, setGenStep] = useState("thinking");
  const [messageIdx, setMessageIdx] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(() => {
    const savedIdx = localStorage.getItem("tripCurrentIndex");
    return savedIdx ? parseInt(savedIdx, 10) : 0;
  });

  const [activePlace, setActivePlace] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const [isTracking, setIsTracking] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const loadPlan = async () => {
      setLoading(true);
      try {
        if (loc.state?.plan) {
          setPlan(loc.state.plan);
          if (loc.state?.isNew) setIsGenerating(true);
        } else {
          const saved = localStorage.getItem("tripPlan");
          if (saved && saved !== "undefined") setPlan(JSON.parse(saved));
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    loadPlan();
  }, [loc.state]);

  useEffect(() => {
    if (!isGenerating) return;
    const msgInterval = setInterval(() => setMessageIdx(prev => (prev + 1) % THINKING_MESSAGES.length), 800);
    const summaryTimeout = setTimeout(() => setGenStep("summary"), 2000);
    const doneTimeout = setTimeout(() => setIsGenerating(false), 5000);
    return () => { clearInterval(msgInterval); clearTimeout(summaryTimeout); clearTimeout(doneTimeout); };
  }, [isGenerating]);

  const handleVisited = (idx) => {
    setCurrentIndex(idx + 1);
    localStorage.setItem("tripCurrentIndex", idx + 1);
  };

  const normalizedItinerary = useMemo(() => {
    if (!plan || !plan.itinerary) return [];
    return Array.isArray(plan.itinerary) ? plan.itinerary : Object.entries(plan.itinerary).map(([day, data]) => ({ day, ...data }));
  }, [plan]);

  const allPlaces = useMemo(() => normalizedItinerary.flatMap(d => (d.places || []).map(p => ({ ...p, day: d.day }))), [normalizedItinerary]);

  if (loading) return <div className="ai-gen-overlay"><div className="premium-pulse-ring"></div><h2 className="ai-loader-text">Loading...</h2></div>;

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
            <span className="ai-sparkle-badge">✨ AI Ready</span>
            <h2>Journey Initialized</h2>
            <p className="ai-summary-text-large">{plan.summary}</p>
            <div className="ai-countdown-loader"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const currentStop = allPlaces[currentIndex];
  const nextStop = allPlaces[currentIndex + 1];
  const progress = Math.round((currentIndex / (allPlaces.length || 1)) * 100);

  // ── RENDER MOBILE MAP VIEW (HIGH-FIDELITY HUB) ──
  if (isMobile && isMapViewRoute) {
    return (
      <div className="anchored-planner-root mobile-map-mode">
        <div className="map-half">
          <MapView plan={plan} currentIndex={currentIndex} activePlace={activePlace} onHover={setActivePlace} isTracking={isTracking} userLocation={userLocation} />
          <button className="back-to-itin-btn" onClick={() => navigate("/results")}>📋 VIEW PLAN</button>
          
          <div className="map-stats-overlay">
            <div className="stat-pill">📍 {allPlaces.length - currentIndex} Stays Left</div>
            <div className="stat-pill">🕒 45m Estimated</div>
          </div>
        </div>

        <div className="live-guide-half">
          {/* AI INSIGHT: Glassmorphic Overlay */}
          <motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="ai-insight-box">
            <div className="insight-header">
              <span className="ai-brain-icon">🧠</span>
              <span className="insight-label">AI TRAVEL INSIGHT</span>
            </div>
            <p className="insight-text">
              {currentStop ? `Tip: ${currentStop.name} is stunning right now. Head to the higher vantage points for the best panoramic views of ${plan.city}!` : "Odyssey completed. Ready for the next one?"}
            </p>
          </motion.div>

          {/* CURRENT STOP: Focus Card */}
          {currentStop ? (
            <div className="focus-card-premium">
              <div className="status-indicator-row">
                <span className="live-dot-pulse"></span>
                <span className="status-label">NOW VISITING</span>
              </div>
              
              <PlaceImage placeName={currentStop.name} city={plan.city} className="card-hero-img" />
              <h3 className="card-title-premium">{currentStop.name}</h3>
              
              <div className="card-meta-row">
                <span className="meta-pill-premium">{currentStop.category}</span>
                <span className="meta-pill-premium success">₹{currentStop.estimatedCost}</span>
              </div>

              <p className="description-text">{currentStop.reason}</p>

              <div className="card-actions-grid">
                <button className="action-main-btn" onClick={() => handleVisited(currentIndex)}>Mark Visited</button>
                <button className="action-sub-btn" onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${currentStop.lat},${currentStop.lng}`, '_blank')}>Navigate</button>
              </div>
            </div>
          ) : (
            <div className="focus-card-premium" style={{textAlign:'center', padding: '40px 20px'}}>
              <div style={{fontSize: '40px', marginBottom:'15px'}}>🏆</div>
              <h2>Odyssey Finished!</h2>
              <button className="action-main-btn" style={{width:'100%', marginTop:'20px'}} onClick={() => navigate("/")}>Plan New Journey</button>
            </div>
          )}

          {/* NEXT UP: Minimal Preview */}
          {nextStop && (
            <div className="next-stop-card-upgraded">
              <div className="next-label-group">
                <span className="next-tag">UP NEXT</span>
                <span className="time-tag">~15m away</span>
              </div>
              <div className="next-content-inner">
                <PlaceImage placeName={nextStop.name} city={plan.city} className="next-img" />
                <div className="next-info">
                  <h4>{nextStop.name}</h4>
                </div>
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
          <BudgetPanel budgetData={{total: plan.totalTripCost, target: plan.totalBudget, percent: 70}} formatPrice={formatPrice} />
          {normalizedItinerary.map((day, dIdx) => (
            <div key={dIdx} className="premium-day-section">
              <div className="day-title-row">
                <div className="day-badge">{dIdx + 1}</div>
                <div className="day-label-group"><h3>Day {dIdx + 1}: {day.day}</h3></div>
              </div>
              {day.places?.map((place, pIdx) => (
                <div key={pIdx} className="premium-stop-card-v2">
                  <div className="stop-card-image-wrap"><PlaceImage placeName={place.name} city={plan.city} className="stop-image-v2" /></div>
                  <div className="stop-info-v2">
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                      <span className="stop-tag-v2">{place.category}</span>
                      <span style={{fontSize:'12px', fontWeight:'700', color:'var(--accent-success)'}}>₹{place.estimatedCost}</span>
                    </div>
                    <h4>{place.name}</h4>
                    <p className="stop-reason-text">{place.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="sidebar-footer-premium">
          <button className="mobile-view-switcher" onClick={() => navigate("/map")}>🗺️ START GUIDED TRIP</button>
        </div>
      </aside>

      {!isMobile && (
        <main className="planner-map-foundation">
          <MapView plan={plan} currentIndex={currentIndex} activePlace={activePlace} onHover={setActivePlace} />
        </main>
      )}
    </div>
  );
}

export default Results;
