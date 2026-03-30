import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './planner.css';
import '../components/Planner/plannerForm.css';

const MultiCityPlanner = () => {
  const navigate = useNavigate();
  const [cityString, setCityString] = useState("");
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState(10000);
  const [interests, setInterests] = useState([]);
  const [error, setError] = useState("");

  const interestOptions = [
    { value: "Nature", icon: "🌿" },
    { value: "Food", icon: "🍜" },
    { value: "Culture", icon: "🏛️" },
    { value: "Adventure", icon: "🏔️" },
    { value: "Shopping", icon: "🛍️" },
    { value: "Nightlife", icon: "🍸" },
  ];

  const toggleInterest = (value) => {
    setInterests(prev => prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const cities = cityString.split(',').map(c => c.trim()).filter(c => c !== "");

    if (cities.length < 2) {
      setError("Please enter at least 2 cities.");
      return;
    }

    if (days < cities.length) {
      setError(`Minimum ${cities.length} days required for ${cities.length} cities.`);
      return;
    }

    if (budget <= 0) {
      setError("Budget must be greater than 0.");
      return;
    }

    const data = {
      cities,
      days,
      budget,
      interests
    };

    console.log("Multi-City Trip Data:", data);
    alert("Data logged to console. Check browser console for details.");
  };

  return (
    <div className="planner-container" style={{ paddingTop: '80px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <button onClick={() => navigate('/trip-type')} className="pf-secondary-btn">← Back</button>
        <h1 className="planner-title" style={{ margin: 0 }}>Multi-City Odyssey</h1>
        <div style={{ width: '80px' }}></div>
      </div>

      <form onSubmit={handleSubmit} className="pf-wrap" style={{ background: 'rgba(255,255,255,0.02)', padding: '40px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
        
        <div className="pf-field">
          <label className="pf-label">Route Plan (Comma-separated cities)</label>
          <input 
            type="text" 
            className="pf-city-input" 
            placeholder="e.g. Bangalore, Mysore, Ooty" 
            value={cityString} 
            onChange={(e) => setCityString(e.target.value)}
            required
          />
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>
            Enter the cities you want to visit in order.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="pf-field">
            <label className="pf-label">Total Duration (Days)</label>
            <input 
              type="number" 
              className="pf-city-input" 
              min="2"
              value={days} 
              onChange={(e) => setDays(Number(e.target.value))}
              required
            />
          </div>

          <div className="pf-field">
            <label className="pf-label">Total Budget (INR)</label>
            <input 
              type="number" 
              className="pf-city-input" 
              min="1"
              value={budget} 
              onChange={(e) => setBudget(Number(e.target.value))}
              required
            />
          </div>
        </div>

        <div className="pf-field">
          <label className="pf-label">Your Interests</label>
          <div className="pf-interest-grid" style={{ marginTop: '15px' }}>
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
        </div>

        {error && <p className="pf-error-msg" style={{ color: '#ff4d4d', marginTop: '20px', fontWeight: '600' }}>{error}</p>}

        <div className="pf-footer-sleek" style={{ marginTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '30px' }}>
          <div></div>
          <button type="submit" className="pf-primary-btn" style={{ padding: '15px 40px' }}>
            Analyze Route
          </button>
        </div>
      </form>
    </div>
  );
};

export default MultiCityPlanner;
