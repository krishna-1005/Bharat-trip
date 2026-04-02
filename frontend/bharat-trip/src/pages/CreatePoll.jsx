import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import "./poll.css";

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "");

export default function CreatePoll() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [tripName, setTripName] = useState("");
  const [totalMembers, setTotalMembers] = useState(1);
  const [option, setOption] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pollCreated, setPollCreated] = useState(false);
  const [createdPollId, setCreatedPollId] = useState("");
  const navigate = useNavigate();

  const cityDataMap = {
    "Goa": { tags: ["Beach", "Nightlife", "Party"], vibe: "Chill & Vibrant" },
    "Bangalore": { tags: ["IT Hub", "Nightlife", "Weather"], vibe: "Modern & Green" },
    "Bengaluru": { tags: ["IT Hub", "Nightlife", "Weather"], vibe: "Modern & Green" },
    "Mumbai": { tags: ["Metropolis", "Ocean", "Food"], vibe: "Energetic & Coastal" },
    "Jaipur": { tags: ["Heritage", "Culture", "Architecture"], vibe: "Royal & Historic" },
    "Delhi": { tags: ["History", "Food", "Shopping"], vibe: "Historic & Intense" },
    "Udaipur": { tags: ["Lakes", "Romantic", "Palaces"], vibe: "Serene & Royal" },
    "Manali": { tags: ["Adventure", "Mountains", "Snow"], vibe: "Adventurous & Scenic" },
    "Shimla": { tags: ["Mountains", "Heritage", "Colonial"], vibe: "Scenic & Nostalgic" },
    "Kochi": { tags: ["Coastal", "Culture", "History"], vibe: "Relaxed & Cultural" },
    "Varanasi": { tags: ["Spiritual", "Culture", "Ghats"], vibe: "Mystical & Ancient" },
    "Agra": { tags: ["Heritage", "Iconic", "History"], vibe: "Historic & Iconic" },
    "Hyderabad": { tags: ["Food", "History", "Pearls"], vibe: "Vibrant & Historic" },
    "Pondicherry": { tags: ["Coastal", "French", "Yoga"], vibe: "Quiet & Colonial" },
    "Gokarna": { tags: ["Beach", "Peaceful", "Trekking"], vibe: "Bohemian & Natural" },
    "Rishikesh": { tags: ["Spiritual", "Adventure", "Yoga"], vibe: "Spiritual & Active" },
    "Mysore": { tags: ["Heritage", "Palace", "Culture"], vibe: "Royal & Traditional" },
    "Ooty": { tags: ["Mountains", "Tea Gardens", "Weather"], vibe: "Scenic & Refreshing" },
    "Coorg": { tags: ["Nature", "Coffee", "Mountains"], vibe: "Green & Serene" },
    "Munnar": { tags: ["Nature", "Tea Gardens", "Weather"], vibe: "Emerald & Quiet" },
    "Alleppey": { tags: ["Backwaters", "Nature", "Coastal"], vibe: "Liquid & Serene" },
    "Leh": { tags: ["Mountains", "Adventure", "Culture"], vibe: "Epic & Stark" },
    "Hampi": { tags: ["Heritage", "History", "Ruins"], vibe: "Ancient & Unique" }
  };

  const addOption = () => {
    if (option.trim() && !options.includes(option.trim())) {
      const cityInfo = cityDataMap[option.trim()] || { tags: ["Explore"], vibe: "New Discovery" };
      setOptions([...options, { name: option.trim(), ...cityInfo }]);
      setOption("");
    }
  };

  const removeOption = (name) => {
    setOptions(options.filter(o => o.name !== name));
  };

  const createPoll = async () => {
    setLoading(true);
    try {
      const payload = { 
        tripName, 
        totalMembers,
        options: options.map(o => ({ name: o.name, city: o.name, tags: o.tags, vibe: o.vibe })), 
        userId: user?.uid || user?.id 
      };
      
      const res = await fetch(`${API}/api/polls/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setCreatedPollId(data.pollId);
        setPollCreated(true);
      } else {
        alert(data.error || "Failed to create poll.");
      }
    } catch (err) {
      console.error(err);
      alert("Server error.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    const url = `${window.location.origin}/vote/${createdPollId}`;
    navigator.clipboard.writeText(url);
    alert("Poll link copied! ✨");
  };

  if (pollCreated) {
    return (
      <div className="poll-page-container">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="poll-glass-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '5rem', marginBottom: '24px' }}>🚀</div>
          <h1 className="poll-title">Poll <span className="gradient-text">Launched!</span></h1>
          <p className="poll-subtitle">Your group decision hub is ready. Share the link below.</p>
          
          <div className="link-copy-container" style={{ textAlign: 'left' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--dash-primary)', marginBottom: '12px', textTransform: 'uppercase' }}>Shareable Voting Link</p>
            <div className="link-input-group">
              <input readOnly value={`${window.location.origin}/vote/${createdPollId}`} className="link-input" />
              <button className="btn-premium primary" onClick={copyToClipboard} style={{ height: 'auto', borderRadius: '12px', padding: '0 20px' }}>Copy</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '40px' }}>
            <button className="btn-premium outline" onClick={() => window.location.reload()}>Create New</button>
            <button className="btn-premium primary" onClick={() => navigate(`/vote/${createdPollId}`)}>View Poll ➔</button>
          </div>
        </motion.div>
      </div>
    );
  }

  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="poll-page-container">
      <div className="poll-dashboard-wrapper">
        
        <header className="dashboard-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 className="dashboard-title">Create a Travel Poll</h1>
            <p className="dashboard-subtitle">Let others help you decide your next destination</p>
        </header>

        <div className="step-indicator-container">
            <div className="step-progress-bar">
                <div className="step-progress-fill" style={{ width: `${(step / 3) * 100}%` }}></div>
            </div>
            <div className="step-labels">
                <span className={`step-label ${step >= 1 ? 'active' : ''}`}>Question</span>
                <span className={`step-label ${step >= 2 ? 'active' : ''}`}>Add Cities</span>
                <span className={`step-label ${step >= 3 ? 'active' : ''}`}>Review</span>
            </div>
        </div>

        <AnimatePresence mode="wait">
            {step === 1 && (
                <motion.div key="step1" {...stepVariants} className="create-poll-step-container">
                    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div>
                            <input 
                                type="text" 
                                className="huge-poll-input" 
                                placeholder="Where should I travel next?"
                                value={tripName}
                                onChange={(e) => setTripName(e.target.value)}
                                autoFocus
                            />
                            <p style={{ marginTop: '12px', color: 'var(--dash-muted)', fontSize: '14px' }}>Enter your main poll question or trip name</p>
                        </div>

                        <div style={{ maxWidth: '300px', margin: '0 auto', width: '100%' }}>
                            <p style={{ fontSize: '12px', fontWeight: '800', color: 'var(--dash-primary)', marginBottom: '12px', textTransform: 'uppercase' }}>Number of Members</p>
                            <input 
                                type="number" 
                                className="auth-input-styled" 
                                style={{ textAlign: 'center', fontSize: '1.5rem' }}
                                min="1"
                                value={totalMembers}
                                onChange={(e) => setTotalMembers(Math.max(1, parseInt(e.target.value) || 1))}
                            />
                            <p style={{ marginTop: '8px', color: 'var(--dash-muted)', fontSize: '12px' }}>How many people are in this group?</p>
                        </div>
                    </div>
                    <button 
                        className="btn-premium primary" 
                        style={{ width: '100%', height: '60px', marginTop: 'auto' }}
                        disabled={!tripName.trim()}
                        onClick={() => setStep(2)}
                    >
                        Next: Add Destinations ➔
                    </button>
                </motion.div>
            )}

            {step === 2 && (
                <motion.div key="step2" {...stepVariants} className="create-poll-step-container">
                    <div className="add-city-input-group">
                        <input 
                            className="add-city-input" 
                            placeholder="Type a city (e.g., Goa, Manali...)" 
                            value={option}
                            onChange={(e) => setOption(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addOption()}
                        />
                        <button className="btn-premium primary" onClick={addOption} style={{ height: 'auto', borderRadius: '12px' }}>Add</button>
                    </div>

                    <div className="results-grid">
                        {options.map((opt) => (
                            <motion.div layout key={opt.name} className="city-option-card">
                                <div className="city-card-info">
                                    <span className="city-card-name">{opt.name}</span>
                                    <div className="option-tags">
                                        {opt.tags.map(t => <span key={t} className="dash-tag">{t}</span>)}
                                    </div>
                                </div>
                                <button className="remove-city-btn" onClick={() => removeOption(opt.name)}>×</button>
                            </motion.div>
                        ))}
                        {options.length < 2 && (
                            <div className="empty-dashboard" style={{ padding: '40px', borderStyle: 'dashed' }}>
                                <p style={{ color: 'var(--dash-muted)', margin: 0 }}>Add at least 2 destinations to continue</p>
                            </div>
                        )}
                    </div>

                    <div className="step-nav-buttons">
                        <button className="btn-back" onClick={() => setStep(1)}>Back</button>
                        <button 
                            className="btn-premium primary" 
                            style={{ flex: 1, height: '54px' }}
                            disabled={options.length < 2}
                            onClick={() => setStep(3)}
                        >
                            Review Poll ➔
                        </button>
                    </div>
                </motion.div>
            )}

            {step === 3 && (
                <motion.div key="step3" {...stepVariants} className="create-poll-step-container">
                    <div className="review-section">
                        <p style={{ fontSize: '12px', color: 'var(--dash-primary)', fontWeight: '800', marginBottom: '8px', textTransform: 'uppercase' }}>Poll Summary</p>
                        <h2 className="review-question">{tripName}</h2>
                        
                        <div className="review-cities-grid">
                            {options.map(opt => (
                                <div key={opt.name} className="dash-tag" style={{ padding: '10px 16px', fontSize: '14px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px' }}>
                                    {opt.name}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="step-nav-buttons">
                        <button className="btn-back" onClick={() => setStep(2)}>Back</button>
                        <button 
                            className="btn-premium primary" 
                            style={{ flex: 1, height: '54px' }}
                            onClick={createPoll}
                            disabled={loading}
                        >
                            {loading ? "Creating Poll..." : "Create Poll 🚀"}
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

      </div>
    </div>
  );
}