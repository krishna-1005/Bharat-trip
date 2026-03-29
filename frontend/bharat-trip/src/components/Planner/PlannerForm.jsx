import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { generatePlan } from "../../services/api";
import { useSettings } from "../../context/SettingsContext";
import "../Planner/plannerForm.css";

function PlannerForm({ onPlanGenerated }) {
  const { formatPrice } = useSettings();
  const loc = useLocation();
  const [step, setStep] = useState(1);
  const [city, setCity] = useState("Bengaluru");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const indianCities = [
    "Bengaluru", "Mumbai", "Delhi", "Jaipur", "Goa", "Hyderabad", "Chennai", "Kolkata", 
    "Agra", "Udaipur", "Varanasi", "Kochi", "Shimla", "Manali", "Rishikesh", "Amritsar", 
    "Pune", "Ahmedabad", "Darjeeling", "Pondicherry", "Mysuru", "Chandigarh", "Lucknow"
  ];

  const filteredCities = indianCities.filter(c => 
    c.toLowerCase().includes(city.toLowerCase()) && c.toLowerCase() !== city.toLowerCase()
  );

  useEffect(() => {
    const params = new URLSearchParams(loc.search);
    const destParam = params.get("destination");
    if (destParam) setCity(decodeURIComponent(destParam));
  }, [loc.search]);

  const [days, setDays] = useState(2);
  const [budget, setBudget] = useState("low");
  const [interests, setInterests] = useState([]);
  const [travelerType, setTravelerType] = useState("solo");
  const [pace, setPace] = useState("moderate");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalSteps = 3;

  const handleSubmit = async () => {
    if (interests.length === 0) {
      setError("Please select at least one interest to build your journey.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await generatePlan({ city, days, budget, interests, travelerType, pace });
      if (onPlanGenerated && result?.itinerary) onPlanGenerated(result);
    } catch {
      setError("We encountered an issue. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (value) => {
    setInterests(prev => prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value]);
  };

  const budgetOptions = [
    { value: "low", label: "Budget", icon: "💸", desc: "Economy focused" },
    { value: "medium", label: "Standard", icon: "✈️", desc: "Balanced comfort" },
    { value: "high", label: "Luxury", icon: "💎", desc: "Premium experience" },
  ];

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
    const base = budget === 'low' ? 1500 : budget === 'medium' ? 4000 : 10000;
    return base * days;
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
              <label className="pf-label">Destination</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  className="pf-city-input" 
                  placeholder="Enter city name..." 
                  value={city} 
                  onChange={(e) => { setCity(e.target.value); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                {showSuggestions && filteredCities.length > 0 && (
                  <ul className="pf-suggestions">
                    {filteredCities.map(c => (
                      <li key={c} onMouseDown={() => { setCity(c); setShowSuggestions(false); }}>{c}</li>
                    ))}
                  </ul>
                )}
              </div>
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
              <label className="pf-label">Budget Tier</label>
              <div className="pf-selection-grid">
                {budgetOptions.map(opt => (
                  <button 
                    key={opt.value} 
                    type="button"
                    className={`pf-choice-card ${budget === opt.value ? "active" : ""}`} 
                    onClick={() => setBudget(opt.value)}
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
              <h2>The Soul of the Trip</h2>
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
          <span className="pf-est-val">{formatPrice(getEstimate())}</span>
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
