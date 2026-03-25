import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { generatePlan } from "../../services/api";
import { useSettings } from "../../context/SettingsContext";
import "../Planner/plannerForm.css";

function PlannerForm({ onPlanGenerated }) {
  const { t, formatPrice } = useSettings();
  const loc = useLocation();
  const [step, setStep] = useState(1);
  const [city, setCity] = useState("Bengaluru");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const indianCities = [
    "Bengaluru", "Mumbai", "Delhi", "Jaipur", "Goa", "Hyderabad", "Chennai", "Kolkata", 
    "Agra", "Udaipur", "Varanasi", "Kochi", "Shimla", "Manali", "Rishikesh", "Amritsar", 
    "Pune", "Ahmedabad", "Darjeeling", "Pondicherry", "Mysuru", "Chandigarh", "Lucknow",
    "Indore", "Guwahati", "Bhubaneswar", "Dehradun", "Jodhpur", "Jaisalmer", "Leh", "Srinagar"
  ];

  const filteredCities = indianCities.filter(c => 
    c.toLowerCase().includes(city.toLowerCase()) && c.toLowerCase() !== city.toLowerCase()
  );

  useEffect(() => {
    const params = new URLSearchParams(loc.search);
    const destParam = params.get("destination");
    
    if (destParam) {
      setCity(decodeURIComponent(destParam));
    } else if (loc.state?.prefilledCity) {
      setCity(loc.state.prefilledCity);
    }
  }, [loc.state, loc.search]);
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
      setError("Please select at least one interest to build your perfect trip.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await generatePlan({ 
        city,
        days, 
        budget, 
        interests,
        travelerType,
        pace 
      });
      if (onPlanGenerated && result?.itinerary) {
        onPlanGenerated(result);
      }
    } catch {
      setError("We encountered a hitch. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const cityOptions = [
    "Bengaluru", "Mumbai", "Delhi", "Jaipur", "Goa", 
    "Hyderabad", "Chennai", "Kolkata", "Agra", "Udaipur"
  ];

  const toggleInterest = (value) => {
    setInterests(prev =>
      prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value]
    );
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const budgetOptions = [
    { value: "low",    label: "Budget",  icon: "💸", desc: "Economy" },
    { value: "medium", label: "Standard", icon: "✈️", desc: "Balanced" },
    { value: "high",   label: "Luxury",   icon: "💎", desc: "Premium" },
  ];

  const interestOptions = [
    { value: "Nature",  icon: "🌿", label: "Nature"  },
    { value: "Food",    icon: "🍜", label: "Food"    },
    { value: "Culture", icon: "🏛️", label: "Culture" },
    { value: "Adventure", icon: "🏔️", label: "Adventure" },
    { value: "Shopping", icon: "🛍️", label: "Shopping" },
    { value: "Nightlife", icon: "🍸", label: "Nightlife" },
  ];

  const travelerOptions = [
    { value: "solo", label: "Solo", icon: "👤" },
    { value: "couple", label: "Couple", icon: "👫" },
    { value: "family", label: "Family", icon: "👨‍👩‍👧‍👦" },
    { value: "friends", label: "Friends", icon: "👯‍♂️" },
  ];

  const paceOptions = [
    { value: "relaxed", label: "Relaxed", icon: "🧘", desc: "Slow & steady" },
    { value: "moderate", label: "Moderate", icon: "🚶", desc: "Standard flow" },
    { value: "fast", label: "Fast", icon: "🏃", desc: "Cover everything" },
  ];

  const applyTheme = (tName) => {
    const themes = {
      spiritual: { days: 3, budget: "low", interests: ["Culture"], travelerType: "solo", pace: "relaxed" },
      foodie: { days: 2, budget: "medium", interests: ["Food", "Nightlife"], travelerType: "friends", pace: "moderate" },
      adventure: { days: 5, budget: "medium", interests: ["Adventure", "Nature"], travelerType: "friends", pace: "fast" },
      heritage: { days: 3, budget: "high", interests: ["Culture", "History"], travelerType: "family", pace: "relaxed" }
    };
    const tData = themes[tName];
    if (tData) {
      setDays(tData.days);
      setBudget(tData.budget);
      setInterests(tData.interests);
      setTravelerType(tData.travelerType);
      setPace(tData.pace);
      setStep(1);
    }
  };

  const getEstimate = () => {
    const dailyBase = budget === 'low' ? 1500 : budget === 'medium' ? 4000 : 10000;
    const total = dailyBase * days;
    return `~ ${formatPrice(total * 0.8)} - ${formatPrice(total * 1.2)}`;
  };

  return (
    <div className="pf-wrap" style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', top: '-25px', right: 0, color: 'var(--accent-blue)', fontSize: '10px', fontWeight: '800' }}>
        AI ENHANCED
      </div>

      {/* QUICK THEMES */}
      <div className="pf-themes-row">
        <button onClick={() => applyTheme('spiritual')} className="pf-theme-chip">🧘 Spiritual</button>
        <button onClick={() => applyTheme('foodie')} className="pf-theme-chip">🍜 Foodie</button>
        <button onClick={() => applyTheme('adventure')} className="pf-theme-chip">🏔️ Adventure</button>
        <button onClick={() => applyTheme('heritage')} className="pf-theme-chip">🏛️ Heritage</button>
      </div>

      <div className="pf-progress-bar">
        <div className="pf-progress-fill" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
      </div>

      <div className={`pf-step-container ${loading ? 'pf-fade-out' : ''}`}>
        
        {step === 1 && (
          <div className="pf-step animate-in">
            <div className="pf-step-header">
              <span className="pf-step-num">01</span>
              <h2>The Basics</h2>
              <p>How long is your journey and who's coming along?</p>
            </div>

            <div className="pf-field">
              <label className="pf-label">Destination City</label>
              <div className="pf-search-wrap">
                <input 
                  type="text"
                  className="pf-city-input"
                  placeholder="Search any city in India (e.g. Mumbai, Shimla...)"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                {showSuggestions && filteredCities.length > 0 && (
                  <ul className="pf-suggestions">
                    {filteredCities.map(c => (
                      <li key={c} onClick={() => {
                        setCity(c);
                        setShowSuggestions(false);
                      }}>
                        {c}
                      </li>
                    ))}
                  </ul>
                )}
                <span className="pf-search-hint">Works for any location in India</span>
              </div>
            </div>

            <div className="pf-field">
              <label className="pf-label">Duration</label>
              <div className="pf-days-row">
                {[1,2,3,5,7].map(d => (
                  <button
                    key={d}
                    className={`pf-day-btn ${days === d ? "active" : ""}`}
                    onClick={() => setDays(d)}
                    type="button"
                  >
                    {d}
                  </button>
                ))}
                <div className="pf-custom-days">
                  <input 
                    type="number" 
                    min="1" max="30" 
                    value={days} 
                    onChange={(e) => setDays(parseInt(e.target.value) || 1)}
                    className="pf-days-input"
                  />
                  <span>days</span>
                </div>
              </div>
            </div>

            <div className="pf-field">
              <label className="pf-label">Traveler Type</label>
              <div className="pf-traveler-grid">
                {travelerOptions.map(opt => (
                  <button
                    key={opt.value}
                    className={`pf-traveler-card ${travelerType === opt.value ? "active" : ""}`}
                    onClick={() => setTravelerType(opt.value)}
                    type="button"
                  >
                    <span className="pf-card-icon">{opt.icon}</span>
                    <span className="pf-card-label">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="pf-step animate-in">
            <div className="pf-step-header">
              <span className="pf-step-num">02</span>
              <h2>Pace & Budget</h2>
              <p>Tailor the intensity and cost of your trip.</p>
            </div>

            <div className="pf-field">
              <label className="pf-label">Budget Tier</label>
              <div className="pf-budget-grid">
                {budgetOptions.map(opt => (
                  <button
                    key={opt.value}
                    className={`pf-budget-card ${budget === opt.value ? "active" : ""}`}
                    onClick={() => setBudget(opt.value)}
                    type="button"
                  >
                    <span className="pf-card-icon">{opt.icon}</span>
                    <div className="pf-card-text">
                      <span className="pf-card-label">{opt.label}</span>
                      <span className="pf-card-desc">{opt.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pf-field">
              <label className="pf-label">Trip Pace</label>
              <div className="pf-pace-grid">
                {paceOptions.map(opt => (
                  <button
                    key={opt.value}
                    className={`pf-pace-card ${pace === opt.value ? "active" : ""}`}
                    onClick={() => setPace(opt.value)}
                    type="button"
                  >
                    <span className="pf-card-icon">{opt.icon}</span>
                    <div className="pf-card-text">
                      <span className="pf-card-label">{opt.label}</span>
                      <span className="pf-card-desc">{opt.desc}</span>
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
              <span className="pf-step-num">03</span>
              <h2>Interests</h2>
              <p>What kind of experiences do you crave?</p>
            </div>

            <div className="pf-interest-grid">
              {interestOptions.map(opt => (
                <button
                  key={opt.value}
                  className={`pf-interest-pill ${interests.includes(opt.value) ? "active" : ""}`}
                  onClick={() => toggleInterest(opt.value)}
                  type="button"
                >
                  <span className="pf-pill-icon">{opt.icon}</span>
                  <span className="pf-pill-label">{opt.label}</span>
                  {interests.includes(opt.value) && <span className="pf-pill-check">✓</span>}
                </button>
              ))}
            </div>

            {error && <p className="pf-error-msg">{error}</p>}
          </div>
        )}

      </div>

      <div className="pf-footer">
        <div className="pf-live-estimate">
          <span className="est-label">Est. Budget</span>
          <span className="est-value">{getEstimate()}</span>
        </div>
        <div className="pf-footer-btns">
          {step > 1 && (
            <button className="pf-back-btn" onClick={prevStep} disabled={loading}>
              Back
            </button>
          )}
          
          {step < totalSteps ? (
            <button className="pf-next-btn" onClick={nextStep}>
              Continue
            </button>
          ) : (
            <button 
              className={`pf-gen-btn ${loading ? 'loading' : ''}`} 
              onClick={handleSubmit} 
              disabled={loading}
            >
              {loading ? <span className="pf-spinner"></span> : "Generate Itinerary"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlannerForm;
