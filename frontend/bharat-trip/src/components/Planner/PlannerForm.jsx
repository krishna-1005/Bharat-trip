import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { generatePlan } from "../../services/api";
import { useSettings } from "../../context/SettingsContext";
import PlaceSearch from "../PlaceSearch";
import "../Planner/plannerForm.css";

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "");

function PlannerForm({ onPlanGenerated }) {
  const { formatPrice, formatSelectedCurrency, currency, setCurrency, currencySymbols, toINR } = useSettings();
  const loc = useLocation();
  const [step, setStep] = useState(1);
  const [city, setCity] = useState("Bengaluru");
  const [coordinates, setCoordinates] = useState({ lat: 12.9716, lng: 77.5946 });

  useEffect(() => {
    const params = new URLSearchParams(loc.search);
    const destParam = params.get("destination");
    const daysParam = params.get("days");
    const budgetParam = params.get("budget");
    const interestsParam = params.get("interests");

    if (destParam) setCity(decodeURIComponent(destParam));
    if (daysParam) setDays(Number(daysParam));
    if (budgetParam) setBudget(Number(budgetParam));
    if (interestsParam) setInterests(decodeURIComponent(interestsParam).split(','));
  }, [loc.search]);

  const [days, setDays] = useState(2);
  const [budget, setBudget] = useState(5000);
  const [interests, setInterests] = useState([]);
  const [travelerType, setTravelerType] = useState("solo");
  const [pace, setPace] = useState("moderate");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPersonalizedPrefill, setIsPersonalizedPrefill] = useState(false);

  const handlePlaceSelect = (place) => {
    setCity(place.shortName);
    setCoordinates({ lat: place.lat, lng: place.lng });
  };

  // Prefill from user preferences
  useEffect(() => {
    const fetchPrefs = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(`${API}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.user?.preferences) {
          const { interests: uInterests, preferredBudget } = data.user.preferences;
          if (uInterests?.length > 0) {
            setInterests(uInterests);
            setIsPersonalizedPrefill(true);
          }
          if (preferredBudget) {
             setIsPersonalizedPrefill(true);
          }
        }
      } catch (err) {
        console.warn("Could not fetch user preferences for prefill", err);
      }
    };
    fetchPrefs();
  }, []);

  const totalSteps = 3;

  const handleSubmit = async () => {
    if (interests.length === 0) {
      setError("Please select at least one interest to build your journey.");
      return;
    }
    if (!budget || budget <= 0) {
      setError("Please enter a valid total budget.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      // Convert budget to INR before sending to backend
      const budgetInINR = toINR(Number(budget), currency);
      
      const res = await fetch(`${API}/api/plan/generate`, {
        method: "POST",
        headers,
        body: JSON.stringify({ 
          city, 
          lat: coordinates.lat,
          lng: coordinates.lng,
          days, 
          budget: Math.round(budgetInINR), 
          interests, 
          travelerType, 
          pace 
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate plan");
      }

      if (onPlanGenerated && data.plan?.itinerary) {
        onPlanGenerated(data.plan);
      } else {
        setError("Plan generation failed. Please try again.");
      }
    } catch (err) {
      console.error("Plan Gen Error:", err);
      setError(err.message || "We encountered an issue. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (value) => {
    setInterests(prev => prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value]);
  };

  const paceOptions = [
    { value: "relaxed", label: "Relaxed", icon: "🧘", desc: "Slow and steady" },
    { value: "moderate", label: "Moderate", icon: "🚶", desc: "Standard sightseeing" },
    { value: "fast", label: "Fast", icon: "🏃", desc: "Cover everything" },
  ];

  const travelerOptions = [
    { value: "solo", label: "Solo", icon: "👤" },
    { value: "couple", label: "Couple", icon: "👫" },
    { value: "family", label: "Family", icon: "👨‍👩‍👧‍👦" },
    { value: "friends", label: "Friends", icon: "👯‍♂️" },
  ];

  const interestOptions = [
    { value: "Nature", icon: "🌿" },
    { value: "Food", icon: "🍜" },
    { value: "Culture", icon: "🏛️" },
    { value: "Adventure", icon: "🏔️" },
    { value: "Shopping", icon: "🛍️" },
    { value: "Nightlife", icon: "🍸" },
  ];

  const getEstimate = () => {
    return Number(budget);
  };

  const formatWithSymbol = (val) => {
    const symbol = currencySymbols[currency] || "₹";
    return `${symbol}${Number(val).toLocaleString()}`;
  };

  return (
    <div className="pf-wrap">
      {/* Stepped Progress */}
      <div className="pf-progress-container">
        {[1, 2, 3].map(s => (
          <div key={s} className={`pf-step-dot ${step === s ? 'active' : step > s ? 'completed' : ''}`} />
        ))}
      </div>

      <div className={`pf-step-container ${loading ? 'pf-fade-out' : ''}`}>
        
        {step === 1 && (
          <div className="pf-step animate-in">
            <div className="pf-step-header">
              <p>Step 01</p>
              <h2>Foundational Intel</h2>
            </div>

            <div className="pf-field">
              <PlaceSearch 
                initialValue={city} 
                onSelect={handlePlaceSelect} 
              />
            </div>

            <div className="pf-field">
              <label className="pf-label">Duration (Days)</label>
              <div className="pf-days-row">
                {[1,2,3,5,7].map(d => (
                  <button 
                    key={d} 
                    type="button"
                    className={`pf-day-btn ${days === d ? "active" : ""}`} 
                    onClick={() => setDays(d)}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="pf-field">
              <label className="pf-label">Traveler Type</label>
              <div className="pf-selection-grid">
                {travelerOptions.map(opt => (
                  <button 
                    key={opt.value} 
                    type="button"
                    className={`pf-choice-card ${travelerType === opt.value ? "active" : ""}`} 
                    onClick={() => setTravelerType(opt.value)}
                  >
                    <span className="pf-choice-icon">{opt.icon}</span>
                    <span className="pf-choice-label">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="pf-step animate-in">
            <div className="pf-step-header">
              <p>Step 02</p>
              <h2>Sculpting the Vibe</h2>
            </div>

            <div className="pf-field">
              <div className="pf-budget-header">
                <label className="pf-label">Total Budget</label>
                <div className="pf-per-day-badge">
                  {formatWithSymbol(Math.round(budget / days))} / day
                </div>
              </div>

              <div className="pf-premium-budget-card">
                <div className="pf-currency-rail">
                  {Object.keys(currencySymbols).map(c => (
                    <button
                      key={c}
                      type="button"
                      className={`pf-currency-chip ${currency === c ? 'active' : ''}`}
                      onClick={() => setCurrency(c)}
                    >
                      <span className="pf-chip-symbol">{currencySymbols[c]}</span>
                      <span className="pf-chip-code">{c}</span>
                    </button>
                  ))}
                </div>

                <div className="pf-budget-display">
                  <input 
                    type="number" 
                    className="pf-budget-numeric-input" 
                    value={budget} 
                    onChange={(e) => setBudget(e.target.value)} 
                  />
                </div>
                
                <div className="pf-slider-container">
                  <input 
                    type="range" 
                    min={currency === 'INR' ? 1000 : 50} 
                    max={currency === 'INR' ? 50000 : 1000} 
                    step={currency === 'INR' ? 500 : 10}
                    value={budget} 
                    onChange={(e) => setBudget(e.target.value)}
                    className="pf-premium-slider"
                  />
                  <div className="pf-slider-labels">
                    <span>{formatWithSymbol(currency === 'INR' ? 1000 : 50)}</span>
                    <span>{formatWithSymbol(currency === 'INR' ? 50000 : 1000)}</span>
                  </div>
                </div>

                <div className="pf-budget-presets">
                  {(currency === 'INR' ? [2000, 5000, 10000, 20000] : [50, 100, 250, 500]).map(val => (
                    <button 
                      key={val} 
                      type="button" 
                      className={`pf-preset-pill ${Number(budget) === val ? 'active' : ''}`}
                      onClick={() => setBudget(val)}
                    >
                      {val >= 1000 ? `${val/1000}K` : val}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pf-field">
              <label className="pf-label">Trip Pace</label>
              <div className="pf-selection-grid">
                {paceOptions.map(opt => (
                  <button 
                    key={opt.value} 
                    type="button"
                    className={`pf-choice-card ${pace === opt.value ? "active" : ""}`} 
                    onClick={() => setPace(opt.value)}
                  >
                    <span className="pf-choice-icon">{opt.icon}</span>
                    <div style={{ textAlign: 'left' }}>
                        <div className="pf-choice-label">{opt.label}</div>
                        <div className="pf-choice-desc">{opt.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="pf-step animate-in">
            <div className="pf-step-header">
              <p>Step 03</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2>The Soul of the Trip</h2>
                {isPersonalizedPrefill && (
                  <span className="pf-personalized-badge">✨ Personalized for you</span>
                )}
              </div>
            </div>

            <div className="pf-interest-grid">
              {interestOptions.map(opt => (
                <button 
                  key={opt.value} 
                  type="button"
                  className={`pf-interest-card ${interests.includes(opt.value) ? "active" : ""}`} 
                  onClick={() => toggleInterest(opt.value)}
                >
                  <span className="pf-interest-icon">{opt.icon}</span>
                  <span className="pf-interest-label">{opt.value}</span>
                  {interests.includes(opt.value) && <span className="pf-interest-check">✓</span>}
                </button>
              ))}
            </div>
            {error && <p className="pf-error-msg">{error}</p>}
          </div>
        )}

      </div>

      <div className="pf-footer-sleek">
        <div className="pf-estimate-box">
          <span className="pf-est-label">Est. Value</span>
          <span className="pf-est-val">{formatSelectedCurrency(getEstimate())}</span>
        </div>
        <div className="pf-btn-group">
          {step > 1 && (
            <button 
              type="button" 
              className="pf-secondary-btn" 
              onClick={() => setStep(step - 1)}
              disabled={loading}
            >
              Back
            </button>
          )}
          {step < totalSteps ? (
            <button 
              type="button" 
              className="pf-primary-btn" 
              onClick={() => setStep(step + 1)}
            >
              Next
            </button>
          ) : (
            <button 
              type="button" 
              className={`pf-primary-btn ${loading ? 'loading' : ''}`} 
              onClick={handleSubmit} 
              disabled={loading}
            >
              {loading ? <span className="pf-spinner"></span> : "Generate"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlannerForm;
