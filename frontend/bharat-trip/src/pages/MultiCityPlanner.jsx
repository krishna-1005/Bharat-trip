import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PlaceSearch from '../components/PlaceSearch';
import './tripType.css';
import './planner.css';
import '../components/Planner/plannerForm.css';

const MultiCityPlanner = () => {
  const navigate = useNavigate();
  const [stops, setStops] = useState([
    { city: "", lat: null, lng: null },
    { city: "", lat: null, lng: null }
  ]);
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState(10000);
  const [interests, setInterests] = useState([]);
  const [error, setError] = useState("");

  const handleAddStop = () => {
    setStops([...stops, { city: "", lat: null, lng: null }]);
  };

  const handleRemoveStop = (idx) => {
    if (stops.length <= 2) return;
    setStops(stops.filter((_, i) => i !== idx));
  };

  const handlePlaceSelect = (idx, place) => {
    const newStops = [...stops];
    newStops[idx] = {
      city: place.shortName,
      lat: place.lat,
      lng: place.lng
    };
    setStops(newStops);
  };

  const toggleInterest = (value) => {
    setInterests(prev => prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value]);
  };

  const interestOptions = [
    { value: "Nature", icon: "🌿" },
    { value: "Food", icon: "🍜" },
    { value: "Culture", icon: "🏛️" },
    { value: "Adventure", icon: "🏔️" },
    { value: "Shopping", icon: "🛍️" },
    { value: "Nightlife", icon: "🍸" },
  ];

  const distributeDays = (n, totalDays) => {
    const baseDays = new Array(n).fill(1);
    let remaining = totalDays - n;
    let i = 0;
    while (remaining > 0) {
      baseDays[i % n]++;
      remaining--;
      i++;
    }
    return baseDays;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    
    const validStops = stops.filter(s => s.city.trim() !== "");
    if (validStops.length < 2) { 
      setError("Please select at least 2 destinations."); 
      return; 
    }
    
    if (days < validStops.length) { 
      setError(`Minimum ${validStops.length} days required for ${validStops.length} stops.`); 
      return; 
    }

    const dayDistribution = distributeDays(validStops.length, days);
    const budgetPerCity = Math.round(budget / validStops.length);
    
    const tripStructure = validStops.map((s, idx) => ({
      city: s.city,
      lat: s.lat,
      lng: s.lng,
      days: dayDistribution[idx],
      budget: budgetPerCity,
      interests: interests
    }));

    navigate('/multi-city-overview', { state: { tripStructure, totalDays: days, totalBudget: budget } });
  };

  return (
    <div className="tt-premium-root" style={{ alignItems: 'flex-start', paddingTop: '120px', overflowY: 'auto' }}>
      <div className="tt-bg-ambient">
        <div className="tt-blob tt-blob-1" style={{ background: 'var(--accent-purple)', top: '10%', right: '10%', left: 'auto' }}></div>
        <div className="tt-blob tt-blob-2" style={{ background: 'var(--accent-blue)', bottom: '10%', left: '10%' }}></div>
        <div className="tt-grid-overlay"></div>
      </div>

      <motion.div className="tt-container" style={{ maxWidth: '900px', marginBottom: '100px' }}>
        <motion.div className="tt-header" style={{ marginBottom: '50px' }}>
          <div className="tt-badge-ai">ADVANCED CONFIGURATION</div>
          <h1 className="tt-main-title">Map your <span>Nodes</span></h1>
          <p className="tt-subtitle">Define individual stops for your multi-city odyssey. Each stop will feature real-time search suggestions.</p>
        </motion.div>

        <motion.div className="planner-glass-card" style={{ padding: '40px', background: 'var(--bg-card)', border: '1px solid var(--border-main)' }}>
          <form onSubmit={handleSubmit} className="pf-wrap">
            
            <div className="stops-config-area" style={{ marginBottom: '40px' }}>
              <label className="pf-label" style={{ display: 'block', marginBottom: '20px' }}>SYNCHRONIZATION PATH</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <AnimatePresence>
                  {stops.map((stop, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}
                    >
                      <div style={{ flex: 1 }}>
                        <PlaceSearch 
                          onSelect={(place) => handlePlaceSelect(idx, place)}
                          initialValue={stop.city}
                        />
                      </div>
                      {stops.length > 2 && (
                        <button 
                          type="button" 
                          onClick={() => handleRemoveStop(idx)}
                          style={{ 
                            background: 'rgba(239, 68, 68, 0.1)', 
                            color: '#ef4444', 
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            height: '55px',
                            width: '55px',
                            borderRadius: '14px',
                            cursor: 'pointer',
                            fontSize: '18px',
                            marginBottom: '1px'
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              
              <button 
                type="button" 
                onClick={handleAddStop}
                style={{ 
                  marginTop: '20px',
                  background: 'rgba(59, 130, 246, 0.1)', 
                  color: 'var(--accent-blue)', 
                  border: '1px dashed rgba(59, 130, 246, 0.4)',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontWeight: '800',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                + ADD ANOTHER NODE
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '35px' }}>
              <div className="pf-field">
                <label className="pf-label">TEMPORAL SCOPE (DAYS)</label>
                <input 
                  type="number" 
                  className="pf-city-input" 
                  min={stops.length}
                  value={days} 
                  onChange={(e) => setDays(Number(e.target.value))}
                  required
                />
              </div>
              <div className="pf-field">
                <label className="pf-label">RESOURCE ALLOCATION (INR)</label>
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

            <div className="pf-field" style={{ marginBottom: '40px' }}>
              <label className="pf-label">PREFERENCE VECTORS</label>
              <div className="pf-interest-grid" style={{ marginTop: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
                {interestOptions.map(opt => (
                  <button 
                    key={opt.value} 
                    type="button"
                    className={`pf-interest-card ${interests.includes(opt.value) ? "active" : ""}`} 
                    onClick={() => toggleInterest(opt.value)}
                  >
                    <span className="pf-interest-icon">{opt.icon}</span>
                    <span className="pf-interest-label">{opt.value}</span>
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="pf-error-msg" style={{ color: '#ff4d4d', textAlign: 'center', background: 'rgba(255,77,77,0.05)', padding: '12px', borderRadius: '10px' }}>{error}</p>}

            <div style={{ display: 'flex', gap: '20px', marginTop: '40px' }}>
              <button type="button" onClick={() => navigate('/trip-type')} className="pf-secondary-btn" style={{ flex: 1 }}>ABORT</button>
              <button type="submit" className="pf-primary-btn" style={{ flex: 2, background: 'var(--accent-blue)' }}>INITIALIZE ODYSSEY</button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MultiCityPlanner;
