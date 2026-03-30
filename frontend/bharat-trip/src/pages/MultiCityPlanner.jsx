import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './tripType.css'; // Reusing premium root styles
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const toggleInterest = (value) => {
    setInterests(prev => prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value]);
  };

  const distributeDays = (cities, totalDays) => {
    const n = cities.length;
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
    const cities = cityString.split(',').map(c => c.trim()).filter(c => c !== "");
    if (cities.length < 2) { setError("Please enter at least 2 cities."); return; }
    if (days < cities.length) { setError(`Minimum ${cities.length} days required for ${cities.length} cities.`); return; }
    if (budget <= 0) { setError("Budget must be greater than 0."); return; }

    const dayDistribution = distributeDays(cities, days);
    const budgetPerCity = Math.round(budget / cities.length);
    const tripStructure = cities.map((city, idx) => ({
      city,
      days: dayDistribution[idx],
      budget: budgetPerCity,
      interests: interests
    }));

    navigate('/multi-city-overview', { state: { tripStructure, totalDays: days, totalBudget: budget } });
  };

  return (
    <div className="tt-premium-root" style={{ alignItems: 'flex-start', paddingTop: '120px' }}>
      {/* Dynamic Background */}
      <div className="tt-bg-ambient">
        <div className="tt-blob tt-blob-1" style={{ background: '#8b5cf6', top: '10%', right: '10%', left: 'auto' }}></div>
        <div className="tt-blob tt-blob-2" style={{ background: '#3b82f6', bottom: '10%', left: '10%' }}></div>
        <div className="tt-grid-overlay"></div>
      </div>

      <motion.div 
        className="tt-container" 
        style={{ maxWidth: '900px' }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="tt-header" variants={itemVariants} style={{ marginBottom: '50px' }}>
          <div className="tt-badge-ai">ADVANCED CONFIGURATION</div>
          <h1 className="tt-main-title" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
            Map your <span>Nodes</span>
          </h1>
          <p className="tt-subtitle">
            Define the geographical markers for your multi-city synchronization. 
            Our AI will handle the logistical continuity and regional transitions.
          </p>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="planner-glass-card" 
          style={{ width: '100%', padding: '50px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <form onSubmit={handleSubmit} className="pf-wrap">
            <div className="pf-field" style={{ marginBottom: '35px' }}>
              <label className="pf-label" style={{ color: 'rgba(255,255,255,0.6)', letterSpacing: '1px' }}>SYNCHRONIZATION PATH</label>
              <input 
                type="text" 
                className="pf-city-input" 
                placeholder="e.g. Bangalore, Mysore, Ooty" 
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', height: '65px', fontSize: '18px' }}
                value={cityString} 
                onChange={(e) => setCityString(e.target.value)}
                required
              />
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '12px', fontWeight: '600' }}>
                SEPARATE NODES WITH COMMAS. ORDER DEFINES TRANSIT SEQUENCE.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '35px' }}>
              <div className="pf-field">
                <label className="pf-label" style={{ color: 'rgba(255,255,255,0.6)', letterSpacing: '1px' }}>TEMPORAL SCOPE (DAYS)</label>
                <input 
                  type="number" 
                  className="pf-city-input" 
                  min="2"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', height: '60px' }}
                  value={days} 
                  onChange={(e) => setDays(Number(e.target.value))}
                  required
                />
              </div>

              <div className="pf-field">
                <label className="pf-label" style={{ color: 'rgba(255,255,255,0.6)', letterSpacing: '1px' }}>RESOURCE ALLOCATION (INR)</label>
                <input 
                  type="number" 
                  className="pf-city-input" 
                  min="1"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', height: '60px' }}
                  value={budget} 
                  onChange={(e) => setBudget(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="pf-field" style={{ marginBottom: '40px' }}>
              <label className="pf-label" style={{ color: 'rgba(255,255,255,0.6)', letterSpacing: '1px' }}>PREFERENCE VECTORS</label>
              <div className="pf-interest-grid" style={{ marginTop: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
                {interestOptions.map(opt => (
                  <button 
                    key={opt.value} 
                    type="button"
                    style={{ 
                      background: interests.includes(opt.value) ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.02)',
                      border: interests.includes(opt.value) ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(255,255,255,0.05)',
                      height: '50px',
                      borderRadius: '14px'
                    }}
                    className={`pf-interest-card ${interests.includes(opt.value) ? "active" : ""}`} 
                    onClick={() => toggleInterest(opt.value)}
                  >
                    <span className="pf-interest-icon" style={{ fontSize: '16px' }}>{opt.icon}</span>
                    <span className="pf-interest-label" style={{ fontSize: '13px', fontWeight: '700' }}>{opt.value}</span>
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="pf-error-msg" style={{ color: '#ff4d4d', marginBottom: '25px', fontWeight: '700', fontSize: '13px', textAlign: 'center', background: 'rgba(255,77,77,0.05)', padding: '12px', borderRadius: '10px' }}>{error}</p>}

            <div style={{ display: 'flex', gap: '20px', marginTop: '40px', paddingTop: '30px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <button 
                type="button" 
                onClick={() => navigate('/trip-type')} 
                className="pf-secondary-btn"
                style={{ height: '60px', borderRadius: '18px', flex: 1, fontWeight: '800' }}
              >
                ABORT
              </button>
              <button 
                type="submit" 
                className="pf-primary-btn" 
                style={{ 
                  height: '60px', 
                  borderRadius: '18px', 
                  flex: 2, 
                  fontWeight: '900', 
                  background: 'var(--accent-blue)',
                  boxShadow: '0 15px 30px rgba(59, 130, 246, 0.3)'
                }}
              >
                INITIALIZE ODYSSEY
              </button>
            </div>
          </form>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          style={{ marginTop: '50px', opacity: 0.2, fontSize: '10px', letterSpacing: '3px', fontWeight: '800', textAlign: 'center' }}
        >
          NEURAL NETWORK SYNC ACTIVE
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MultiCityPlanner;
