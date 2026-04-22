import React, { useState, useEffect, useContext, useMemo, useCallback, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import MapView from "../components/Map/MapView";
import PlaceImage from "../components/PlaceImage";
import BookingLeadGen from "../components/BookingLeadGen";
import WeatherStrip from "../components/WeatherStrip";
import SkeletonLoader from "../components/SkeletonLoader";
import CategoryCostBreakdown from "../components/CategoryCostBreakdown";
import BudgetPanel from "../components/BudgetPanel";
import { calculateDistance, calculateTravelCost, filterAndSortPlaces } from "../utils/travelUtils";
import { fetchWeatherForecast } from "../services/weatherService";
import "./results.css";
import { useSettings } from "../context/SettingsContext";
import { AuthContext } from "../context/AuthContext";
import { auth } from "../firebase";
import { AnimatePresence, motion } from "framer-motion";
import FloatingToggle from "../components/FloatingToggle";
import ItinerarySlider from "../components/ItinerarySlider";
import SafetyModal from "../components/SafetyModal";
import RebookingModal from "../components/RebookingModal";
import Haptics from "../utils/haptics";
import ReactMarkdown from "react-markdown";

/** ── RIDE MODAL COMPONENT ── **/
const RideModal = ({ isOpen, onClose, destination }) => {
  const { lat, lng, name } = destination || {};

  const handleRide = (e, provider) => {
    e.stopPropagation();
    if (Haptics.medium) Haptics.medium();
    
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (provider === 'uber') {
      const uberUrl = `uber://?action=setPickup&pickup=my_location&dropoff[latitude]=${lat}&dropoff[longitude]=${lng}&dropoff[nickname]=${encodeURIComponent(name)}`;
      window.location.href = uberUrl;
      setTimeout(() => {
        if (document.hasFocus()) {
          window.open(`https://m.uber.com/ul/?action=setPickup&dropoff[latitude]=${lat}&dropoff[longitude]=${lng}`, '_blank');
        }
      }, 1500);
    } else {
      if (isIOS) {
        window.open(`maps://?daddr=${lat},${lng}&dirflg=d`, '_blank');
      } else {
        window.open(`google.navigation:q=${lat},${lng}`, '_blank');
      }
      setTimeout(() => {
        if (document.hasFocus()) {
          window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
        }
      }, 1500);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && destination && (
        <motion.div 
          className="ride-modal-overlay" 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ zIndex: 100000 }}
        >
          <motion.div 
            className="ride-modal-card"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="sheet-pull-handle"></div>
            <div className="ride-modal-header">
              <h3>Ride to {name}</h3>
              <p>Choose your preferred way to travel</p>
            </div>
            <div className="ride-options-grid">
              <button type="button" className="ride-opt-btn uber" onClick={(e) => handleRide(e, 'uber')}>
                <span className="ride-icon">🚗</span>
                <div className="ride-info">
                  <strong>Uber</strong>
                  <span>Direct deep-link</span>
                </div>
              </button>
              <button type="button" className="ride-opt-btn maps" onClick={(e) => handleRide(e, 'maps')}>
                <span className="ride-icon">🗺️</span>
                <div className="ride-info">
                  <strong>Maps</strong>
                  <span>Navigation & Rickshaws</span>
                </div>
              </button>
            </div>
            <button type="button" className="ride-cancel-btn" onClick={(e) => { e.stopPropagation(); onClose(); }}>Cancel</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

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

const TrendingTrips = ({ formatPrice }) => {
  const [trips, setTrips] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API}/api/public/featured-trips`)
      .then(res => res.json())
      .then(data => setTrips(data.trips?.slice(0, 4) || []))
      .catch(() => {});
  }, []);

  if (trips.length === 0) return null;

  return (
    <div className="trending-sidebar-section">
      <div className="section-header-mini">
        <span className="sh-badge">DISCOVER</span>
        <h3>Trending Discoveries</h3>
      </div>
      <div className="trending-scroll-row">
        {trips.map(trip => (
          <div key={trip.id} className="trending-mini-card" onClick={() => navigate(`/trip/${trip.id}`)}>
            <div className="tm-img">
              <PlaceImage placeName={trip.destination} city={trip.destination} />
              <div className="tm-days">{trip.days}d</div>
            </div>
            <div className="tm-info">
              <h4>{trip.title}</h4>
              <div className="tm-meta">
                <span>📍 {trip.destination}</span>
                <span className="tm-price">{formatPrice(trip.cost)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

function Results() {
  const navigate = useNavigate();
  const loc = useLocation();
  const { id: routeTripId } = useParams();
  const { formatPrice, language } = useSettings();
  const { user, setShowAuthModal } = useContext(AuthContext);

  const isMapViewRoute = loc.pathname === "/map";

  // ── STATE ──
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(() => {
    // Only enter generation mode if it's a 'new' request AND we have params to generate from
    return (loc.state?.isNew && loc.state?.planParams) || false;
  });
  const [genStep, setGenStep] = useState("thinking"); // "thinking" | "summary"
  const [apiStatus, setApiStatus] = useState("idle"); // "idle" | "requesting" | "success" | "error"
  const [messageIdx, setMessageIdx] = useState(0);
  const [tripTitle, setTripTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shareStatus, setShareStatus] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [rideModalConfig, setRideModalConfig] = useState({ isOpen: false, destination: null });

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${window.location.origin}/trip/${plan?.id || routeTripId || ''}`)}`;


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
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const [userLocation, setUserLocation] = useState(null);

  const [aiLogs, setAiLogs] = useState([]);
  const [weatherData, setWeatherData] = useState(null);

  useEffect(() => {
    if (!plan || !plan.coordinates) return;
    const loadWeather = async () => {
      const data = await fetchWeatherForecast(plan.coordinates.lat, plan.coordinates.lng);
      if (data && data.list && data.list.length > 0) {
        setWeatherData(data.list[0]); // Current or near-future forecast
      }
    };
    loadWeather();
  }, [plan]);

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
    
    // Robust target budget detection
    const target = [
      plan.totalBudget,
      plan.targetBudget,
      plan.budget,
      loc.state?.planParams?.budget
    ].find(val => val !== undefined && val !== null && Number(val) > 0) || 0;
    
    const max = Math.max(total, target, 1);
    const percent = target > 0 ? (total / target) * 100 : 100;
    const targetPercent = (target / max) * 100;

    return { 
      total, 
      target: Number(target), 
      percent: isNaN(percent) ? 0 : percent, 
      isOver: target > 0 && total > target,
      targetPercent: isNaN(targetPercent) ? 100 : targetPercent,
      breakdown: plan.costBreakdown || null
    };
  }, [plan, loc.state]);

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
            // Robust normalization for saved plans
            let normalizedItin = p.itinerary || [];
            if (!Array.isArray(normalizedItin) && typeof normalizedItin === 'object') {
              normalizedItin = Object.entries(normalizedItin).map(([day, val]) => ({ day, ...val }));
            }
            setPlan({ 
              ...p, 
              itinerary: normalizedItin,
              totalBudget: p.totalBudget || p.budget || p.targetBudget || 0,
              totalTripCost: p.totalTripCost || p.totalCost || p.cost || 0
            });
            setTripTitle(p.title || "");
            setSaved(true);
            setLoading(false);
            return;
          }
        }

        if (loc.state?.plan) {
          // Robust mapping for plan from state (Profile/MyTrips)
          const statePlan = loc.state.plan;
          const normalizedPlan = {
            ...statePlan,
            id: statePlan.id || statePlan._id,
            totalBudget: Number(statePlan.totalBudget || statePlan.budget || statePlan.targetBudget || 0)
          };
          setPlan(normalizedPlan);
          setTripTitle(normalizedPlan.title || "");
          setSaved(true);
        } else {
          const savedPlanStr = localStorage.getItem("tripPlan");
          if (savedPlanStr && savedPlanStr !== "undefined") {
            const parsed = JSON.parse(savedPlanStr);
            const normalizedParsed = {
              ...parsed,
              totalBudget: Number(parsed.totalBudget || parsed.budget || parsed.targetBudget || 0)
            };
            setPlan({
              ...normalizedParsed,
              id: normalizedParsed.id || normalizedParsed._id
            });
            setTripTitle(normalizedParsed.title || "");
            // If it has an ID, it's likely saved
            if (normalizedParsed.id || normalizedParsed._id) setSaved(true);
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

  // Poll for background updates (like rebooking alerts)
  useEffect(() => {
    const sharedId = new URLSearchParams(loc.search).get("sharedTripId") || routeTripId;
    if (!sharedId || isGenerating) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API}/api/public/trips/${sharedId}`);
        const data = await res.json();
        if (res.ok && data.trip) {
          // Only update if there's a change in revision to avoid unnecessary re-renders
          const newRevision = data.trip.pendingRevision;
          const currentRevision = plan?.pendingRevision;
          
          if (JSON.stringify(newRevision) !== JSON.stringify(currentRevision)) {
            console.log("🔍„ Background update: New trip revision detected.");
            setPlan(prev => ({ 
              ...data.trip, 
              // Preserve existing itinerary if not applying revision yet, 
              // but update budget/cost if they are now available in the backend
              itinerary: prev.itinerary,
              totalBudget: data.trip.totalBudget || data.trip.budget || prev.totalBudget,
              totalTripCost: data.trip.totalTripCost || data.trip.totalCost || prev.totalTripCost,
              pendingRevision: newRevision
            }));
          }
        }
      } catch (e) {
        // Silent error for polling
      }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(interval);
  }, [routeTripId, loc.search, isGenerating, plan?.pendingRevision]);

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
          userPreferences: prefs, // Send the collected preferences
          language: language || "English"
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate plan");

      // Ensure data.plan has the budget information we need
      // Prioritize the user's input budget from planParams
      const planWithBudget = {
        ...data.plan,
        totalBudget: Number(loc.state.planParams.budget) || data.plan.totalBudget || data.plan.budget || data.plan.targetBudget || 0
      };

      setPlan(planWithBudget);
      setTripTitle(data.plan.title || "");
      localStorage.setItem("tripPlan", JSON.stringify(planWithBudget));
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
    Haptics.light();
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
      // FORCE get a fresh token from Firebase
      let token = null;
      if (auth.currentUser) {
        token = await auth.currentUser.getIdToken(true);
        console.log("[SAVE TRIP] Fresh Firebase token acquired");
      }
      
      if (!token && user?.token) {
        token = user.token;
        console.log("[SAVE TRIP] Using legacy context token");
      }

      if (!token) {
        throw new Error("No authentication token available. Please log in again.");
      }

      console.log("Saving trip to profile with payload:", {
        title: tripTitle || `${planToSave.city} Trip`,
        city: planToSave.city,
        days: planToSave.days || 1,
        totalCost: planToSave.totalTripCost || planToSave.totalCost || planToSave.cost,
        totalBudget: planToSave.totalBudget || planToSave.budget || planToSave.targetBudget
      });

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
          totalCost: planToSave.totalTripCost || planToSave.totalCost || planToSave.cost,
          totalBudget: planToSave.totalBudget || planToSave.budget || planToSave.targetBudget,
          summary: planToSave.summary
        })
      });

      const data = await res.json();
      console.log("[SAVE TRIP] Backend response:", { status: res.status, data });

      if (res.ok) {
        console.log("Trip saved successfully:", data);
        Haptics.success();
        
        // Update plan state with the new ID from backend
        if (data.trip && data.trip._id) {
          const updatedPlan = { ...plan, id: data.trip._id, isSaved: true };
          setPlan(updatedPlan);
          // Update localStorage so refresh maintains the ID
          localStorage.setItem("tripPlan", JSON.stringify(updatedPlan));
          
          // Use navigate to update URL properly so route params update
          navigate(`/trip/${data.trip._id}`, { replace: true });
        }
        
        setSaved(true);
        setSaving(false); // Immediate reset
        localStorage.removeItem("pendingGuestTrip"); // Clear if saved
      } else {
        console.error("Backend save error:", data.error || "Unknown error");
        Haptics.warning();
        setSaving(false);
      }
    } catch (err) { 
      console.error("Save fetch error:", err); 
      Haptics.error();
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

  // ── WHATSAPP SHARE ──
  const handleWhatsAppShare = () => {
    if (!plan) return;
    
    let text = `*🗺️ My ${plan.city} Odyssey Blueprint*\n\n`;
    text += `Duration: ${plan.days} Days\n`;
    text += `Budget: ${formatPrice(budgetData.total)}\n\n`;
    
    normalizedItinerary.forEach((day, i) => {
      text += `*Day ${i + 1}*\n`;
      day.places?.forEach(p => {
        text += `• ${p.name} (${p.category})\n`;
      });
      text += `\n`;
    });
    
    text += `Plan your own trip at: ${window.location.origin}`;
    
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  // ── PDF EXPORT ──
  const handleExportPDF = async () => {
    const html2pdf = (await import('html2pdf.js')).default;
    const element = document.querySelector('.premium-itinerary-sidebar');
    
    const opt = {
      margin: 10,
      filename: `${plan.city}_Odyssey_GoTripo.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#05070a' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save();
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
                <div className="neural-brain-icon">🧠</div>
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
        <div className="ai-summary-text-v2">
          <ReactMarkdown>{plan.summary}</ReactMarkdown>
        </div>
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
          <MapView 
            plan={plan} 
            currentIndex={currentIndex} 
            activePlace={activePlace} 
            onHover={setActivePlace} 
            userLocation={userLocation} 
            setUserLocation={setUserLocation} 
            selectedDayIdx={selectedDayIdx}
          />
          <button className="back-to-itin-btn" onClick={() => navigate("/results")}>✕ CLOSE MAP</button>
        </div>

        <div className="live-guide-half">
          <div className="sheet-pull-handle"></div>
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
      {plan?.pendingRevision && (
        <RebookingModal 
          trip={{ ...plan, _id: plan.id || routeTripId }} 
          onExecuted={() => {
            // Simply trigger a full refresh of the trip data from the server
            // This is the most reliable way to clear the modal and update the UI
            const sharedId = new URLSearchParams(loc.search).get("sharedTripId") || routeTripId;
            if (sharedId) {
              fetch(`${API}/api/public/trips/${sharedId}`)
                .then(res => res.json())
                .then(data => {
                  if (data.trip) {
                    setPlan(data.trip);
                    setTripTitle(data.trip.title || "");
                    // Update localStorage so refresh maintains the updated itinerary
                    localStorage.setItem("tripPlan", JSON.stringify(data.trip));
                  }
                });
            } else {
              window.location.reload();
            }
          }} 
        />
      )}
      <aside className="premium-itinerary-sidebar">
        <div className="sidebar-header-premium">
          <div className="header-top-row">
            <div className="premium-brand">
              <div className="brand-glow-dot"></div>
              <span className="brand-text">GoTripo</span>
            </div>
            <div className="header-actions-row">
              <button className="safety-trigger-btn" onClick={() => setShowSafetyModal(true)}>
                🚨 <span className="safety-label">Safety</span>
              </button>
              <button className="back-control" onClick={() => navigate("/planner")}>← Edit</button>
            </div>
          </div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {tripTitle || `${plan.city} Odyssey`}
          </motion.h1>
        </div>

        <div className="sidebar-scroll-content">
          {(!plan && loading) ? (
            <SkeletonLoader />
          ) : (
            <>
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
                    <span className="stat-value-mid">{plan?.days} Days</span>
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
                  {guideMode ? "✨ Guide Me: ON" : "🧠 Enable Guide Mode"}
                </button>
              </div>
              
              <div className="itinerary-days-container">
                {isMobile ? (
                  <ItinerarySlider 
                    itinerary={normalizedItinerary}
                    onDayChange={setSelectedDayIdx}
                    planCity={plan.city}
                    formatPrice={formatPrice}
                    currentIndex={currentIndex}
                    handleVisited={handleVisited}
                    guideMode={guideMode}
                    setRideModalConfig={setRideModalConfig}
                  />
                ) : (
                  (() => {
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
                              (day.title && day.title.length > 2 && day.title !== (dIdx + 1).toString()) 
                                ? day.title 
                                : (day.label && day.label !== `Day ${dIdx + 1}`)
                                  ? day.label
                                  : `Exploration`
                            }
                          </h3>
                        </div>

                        {dIdx === 0 && weatherData && <WeatherStrip weatherData={weatherData} />}

                        {isLocked && (
                          <div className="glass-lock-overlay">
                            <div className="lock-content">
                              <span className="lock-icon">🔍’</span>
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
                                  {place.bestTime && (
                                    <span className="detail-item-v3 arrival-time">
                                      ⏰ {place.bestTime}
                                    </span>
                                  )}
                                  <span className="detail-item-v3">🕒 {place.timeHours || 2}h visit</span>
                                  <span className="detail-item-v3">💰 {formatPrice(place.estimatedCost || 0)}</span>
                                </div>

                                {place.timeReason && (
                                  <div className="reschedule-notice-v3">
                                    <span className="reschedule-icon">⚡</span>
                                    {place.timeReason}
                                  </div>
                                )}

                                <div className="stop-reason-v3">
                                  {guideMode && isActive ? (
                                    <span className="guide-insight">
                                      ✨ <ReactMarkdown>{place.reason}</ReactMarkdown>
                                    </span>
                                  ) : <ReactMarkdown>{place.reason}</ReactMarkdown>}
                                </div>

                                {place.tags && place.tags.length > 0 && (
                                  <div className="stop-tags-list-v3">
                                    {place.tags.slice(0, 2).map((t, ti) => (
                                      <span key={ti} className="mini-tag-v3">#{t}</span>
                                    ))}
                                  </div>
                                )}

                                <div className="stop-actions-v3">
                                  <button 
                                    className="live-track-btn-v3" 
                                    style={{ gridColumn: isActive ? "span 1" : "span 2" }}
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`, '_blank');
                                    }}
                                  >
                                    🛰️ Live Track
                                  </button>
                                  <button 
                                    className="ride-there-btn-v3"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setRideModalConfig({ isOpen: true, destination: place });
                                    }}
                                  >
                                    🚗 Ride
                                  </button>
                                  {isActive && (
                                    <button className="mark-done-btn-v3" onClick={(e) => { e.stopPropagation(); handleVisited(currentIdx); }}>
                                      Mark as Visited
                                    </button>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  );
                });
              })()
            )}
            {/* Premium Map Entry Card for Mobile */}
            {isMobile && (
              <motion.div 
                className="mobile-map-entry-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => navigate("/map")}
              >
                <div className="map-card-glow"></div>
                <div className="map-card-content">
                  <div className="map-card-info">
                    <span className="map-badge">SPATIAL VIEW</span>
                    <h3>Explore on Interactive Map</h3>
                    <p>Visualize your odyssey with real-time tracking and routes.</p>
                  </div>
                  <div className="map-card-icon">🗺️</div>
                </div>
              </motion.div>
            )}

            {/* Mobile Action Buttons: Integrated into scroll flow above Trending/Partners */}
            {isMobile && (
              <div className="mobile-integrated-actions">
                <button className="primary-action-btn mobile-save-btn" onClick={handleSaveTrip} disabled={saved || saving}>
                  {saving ? "Saving..." : saved ? "Journey Saved ✓" : "Save to Profile"}
                </button>
                
                <div className="mobile-secondary-grid">
                  <button className="secondary-action-btn" onClick={handleShare}>
                    {shareStatus ? "Copied!" : "Share Link"}
                  </button>
                  <button className="export-btn-pdf" onClick={handleExportPDF}>
                    📄 Export PDF
                  </button>
                  <button className="export-btn-wa" onClick={handleWhatsAppShare}>
                    💬 WhatsApp
                  </button>
                  <button className="qr-share-btn-v2" onClick={() => setShowQRModal(true)}>
                    📲 QR Code
                  </button>
                </div>
              </div>
            )}

            {/* Trending Discoveries Section: Fixed above Premium Partners */}
            <TrendingTrips formatPrice={formatPrice} />

            {/* BookingLeadGen is now always inside the sidebar at the end of content */}
            <BookingLeadGen plan={plan} />

            {/* Mobile Scroll Spacer: ensures last card is visible above BottomNav */}
            {isMobile && <div className="mobile-sidebar-spacer" style={{ height: '100px', width: '100%' }}></div>}
          </div>
        </>
      )}
      </div>

      {!isMobile && (
        <div className="sidebar-footer-premium">
          <div className="action-btn-group-v2">
            <button className="primary-action-btn" onClick={handleSaveTrip} disabled={saved || saving}>
              {saving ? "Saving..." : saved ? "Journey Saved ✓" : "Save to Profile"}
            </button>
            <button className="secondary-action-btn" onClick={handleShare}>
              {shareStatus ? "Link Copied!" : "Share Link"}
            </button>
            <button className="export-btn-pdf" onClick={handleExportPDF}>
              📄 Export PDF
            </button>
            <button className="export-btn-wa" onClick={handleWhatsAppShare}>
              💬 WhatsApp
            </button>
            <button className="qr-share-btn" onClick={() => setShowQRModal(true)}>
              📲 QR Code
            </button>
          </div>
        </div>
      )}
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
            selectedDayIdx={selectedDayIdx}
          />
        </main>
      )}

      {/* Removed separate BookingLeadGen from outside sidebar */}
      {/* Removed FloatingToggle as map entry is now inline */}

      <SafetyModal 
        isOpen={showSafetyModal} 
        onClose={() => setShowSafetyModal(false)} 
        city={plan?.city}
        userLocation={userLocation}
      />

      <RideModal 
        isOpen={rideModalConfig.isOpen}
        onClose={() => setRideModalConfig({ isOpen: false, destination: null })}
        destination={rideModalConfig.destination}
      />

      {/* QR CODE MODAL */}
      <AnimatePresence>
        {showQRModal && (
          <motion.div 
            className="qr-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowQRModal(false)}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1000000, padding: '20px'
            }}
          >
            <motion.div 
              className="qr-modal-card"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)',
                padding: '32px', borderRadius: '24px', textAlign: 'center',
                maxWidth: '350px', width: '100%'
              }}
            >
              <h3 style={{ marginBottom: '8px', color: '#fff' }}>Share Odyssey</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '24px' }}>
                Scan this code to instantly open this itinerary on another device.
              </p>
              
              <div style={{ 
                background: '#fff', padding: '12px', borderRadius: '16px', 
                display: 'inline-block', marginBottom: '24px' 
              }}>
                <img src={qrCodeUrl} alt="Trip QR Code" style={{ display: 'block' }} />
              </div>

              <button 
                onClick={() => setShowQRModal(false)}
                style={{
                  width: '100%', padding: '12px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', cursor: 'pointer', fontWeight: '600'
                }}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Results;