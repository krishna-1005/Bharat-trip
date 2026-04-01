import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import "./poll.css";

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "");

export default function CreatePoll() {
  const { user } = useAuth();
  const [tripName, setTripName] = useState("");
  const [groupSize, setGroupSize] = useState("");
  const [option, setOption] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pollCreated, setPollCreated] = useState(false);
  const [createdPollId, setCreatedPollId] = useState("");
  const navigate = useNavigate();

  const addOption = () => {
    if (option.trim() && !options.includes(option.trim())) {
      setOptions([...options, option.trim()]);
      setOption("");
    }
  };

  const removeOption = (index) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const cityDataMap = {
    "Goa": { tags: ["Beach", "Nightlife", "Party", "Relaxed"], vibe: "Chill & Vibrant" },
    "Bangalore": { tags: ["IT Hub", "Nightlife", "Gardens", "Weather"], vibe: "Modern & Green" },
    "Bengaluru": { tags: ["IT Hub", "Nightlife", "Gardens", "Weather"], vibe: "Modern & Green" },
    "Mumbai": { tags: ["Metropolis", "Ocean", "Food", "Fast-paced"], vibe: "Energetic & Coastal" },
    "Jaipur": { tags: ["Heritage", "Culture", "Architecture", "Shopping"], vibe: "Royal & Historic" },
    "Delhi": { tags: ["History", "Food", "Shopping", "Capital"], vibe: "Historic & Intense" },
    "New Delhi": { tags: ["History", "Food", "Shopping", "Capital"], vibe: "Historic & Intense" },
    "Udaipur": { tags: ["Lakes", "Romantic", "Palaces", "Heritage"], vibe: "Serene & Royal" },
    "Manali": { tags: ["Adventure", "Mountains", "Snow", "Trekking"], vibe: "Adventurous & Scenic" },
    "Shimla": { tags: ["Mountains", "Heritage", "Colonial", "Nature"], vibe: "Scenic & Nostalgic" },
    "Kochi": { tags: ["Coastal", "Culture", "History", "Backwaters"], vibe: "Relaxed & Cultural" },
    "Varanasi": { tags: ["Spiritual", "Culture", "Heritage", "Ghats"], vibe: "Mystical & Ancient" },
    "Agra": { tags: ["Heritage", "Iconic", "History", "Architecture"], vibe: "Historic & Iconic" },
    "Hyderabad": { tags: ["Food", "History", "IT Hub", "Pearls"], vibe: "Vibrant & Historic" },
    "Pondicherry": { tags: ["Coastal", "French", "Peaceful", "Yoga"], vibe: "Quiet & Colonial" },
    "Gokarna": { tags: ["Beach", "Peaceful", "Spiritual", "Trekking"], vibe: "Bohemian & Natural" },
    "Rishikesh": { tags: ["Spiritual", "Adventure", "Ganga", "Yoga"], vibe: "Spiritual & Active" },
    "Mysore": { tags: ["Heritage", "Palace", "Culture", "Yoga"], vibe: "Royal & Traditional" },
    "Ooty": { tags: ["Mountains", "Tea Gardens", "Nature", "Weather"], vibe: "Scenic & Refreshing" },
    "Coorg": { tags: ["Nature", "Coffee", "Mountains", "Weather"], vibe: "Green & Serene" },
    "Munnar": { tags: ["Nature", "Tea Gardens", "Mountains", "Weather"], vibe: "Emerald & Quiet" },
    "Alleppey": { tags: ["Backwaters", "Nature", "Houseboat", "Coastal"], vibe: "Liquid & Serene" },
    "Leh": { tags: ["Mountains", "Adventure", "High Altitude", "Culture"], vibe: "Epic & Stark" },
    "Ladakh": { tags: ["Mountains", "Adventure", "High Altitude", "Culture"], vibe: "Epic & Stark" },
    "Hampi": { tags: ["Heritage", "History", "Architecture", "Ruins"], vibe: "Boulder-strewn & Ancient" }
  };

  const createPoll = async () => {
    if (!tripName.trim() || options.length < 2) {
      alert("Please provide a trip name and at least 2 destinations.");
      return;
    }

    setLoading(true);
    try {
      const enrichedOptions = options.map(opt => {
        const data = cityDataMap[opt] || { tags: ["Explore"], vibe: "New Experience" };
        return {
          name: opt,
          city: opt,
          tags: data.tags,
          vibe: data.vibe
        };
      });

      const payload = { 
        tripName, 
        options: enrichedOptions, 
        groupSize: groupSize === "" ? undefined : parseInt(groupSize),
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
    alert("Poll link copied to clipboard! ✨");
  };

  if (pollCreated) {
    return (
      <div className="poll-page-container">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="poll-glass-card"
          style={{ textAlign: 'center' }}
        >
          <div style={{ fontSize: '5rem', marginBottom: '20px', animation: 'float 3s ease-in-out infinite' }}>🚀</div>
          <div className="poll-badge">POLL CREATED SUCCESSFULLY</div>
          <h1 className="poll-title">Your Trip Poll is <span className="gradient-text">Ready!</span></h1>
          <p className="poll-subtitle">Share this link with your group to start the battle of destinations.</p>
          
          <div className="link-copy-container">
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '12px', textAlign: 'left', fontWeight: '600' }}>Shareable Voting Link</p>
            <div className="link-input-group">
              <input 
                readOnly 
                value={`${window.location.origin}/vote/${createdPollId}`} 
                className="link-input"
              />
              <button 
                className="btn-premium primary" 
                onClick={copyToClipboard}
                style={{ padding: '0 20px', borderRadius: '12px', height: 'auto' }}
              >
                Copy
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '40px' }}>
            <button className="btn-premium outline" onClick={() => setPollCreated(false)} style={{ width: '100%' }}>Create Another</button>
            <button className="btn-premium primary" onClick={() => navigate(`/vote/${createdPollId}`)} style={{ width: '100%' }}>Go to Poll ➔</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="poll-page-container">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="poll-glass-card"
      >
        <div className="poll-header">
          <div className="poll-badge">PLAN WITH FRIENDS</div>
          <h1 className="poll-title">Create a <span className="gradient-text">Trip Poll</span></h1>
          <p className="poll-subtitle">Can't decide where to go? Let the majority win.</p>
        </div>

        <div className="poll-field-group">
          <label className="poll-label">Trip Name</label>
          <input 
            type="text" 
            placeholder="e.g., Summer Getaway 2026" 
            className="poll-input"
            value={tripName}
            onChange={(e) => setTripName(e.target.value)}
          />
        </div>

        <div className="poll-field-group">
          <label className="poll-label">Group Size (Optional)</label>
          <input 
            type="number" 
            min="2"
            max="100"
            placeholder="How many friends are voting?"
            className="poll-input"
            value={groupSize}
            onChange={(e) => setGroupSize(e.target.value)}
          />
          <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '8px', paddingLeft: '4px' }}>
            {groupSize 
              ? `Decision finalized when someone gets ${Math.floor(parseInt(groupSize)/2) + 1} votes.` 
              : "Dynamic majority: First destination to cross 50% of cast votes wins."}
          </p>
        </div>

        <div className="poll-field-group">
          <label className="poll-label">Add Destinations</label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input 
              type="text" 
              placeholder="e.g., Goa, Manali, Jaipur..." 
              className="poll-input"
              value={option}
              onChange={(e) => setOption(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addOption()}
            />
            <button className="btn-premium primary" onClick={addOption} style={{ padding: '0 24px', borderRadius: '16px' }}>Add</button>
          </div>
        </div>

        <AnimatePresence>
          {options.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ marginBottom: '32px' }}
            >
              <label className="poll-label">Selected Options ({options.length})</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {options.map((opt, i) => (
                  <motion.div 
                    key={opt}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="vote-tag" 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      padding: '8px 16px', 
                      fontSize: '14px',
                      background: 'rgba(59, 130, 246, 0.15)',
                      border: '1px solid rgba(59, 130, 246, 0.3)'
                    }}
                  >
                    {opt}
                    <span 
                      onClick={() => removeOption(i)} 
                      style={{ cursor: 'pointer', fontWeight: 'bold', color: '#ef4444', fontSize: '18px', marginLeft: '4px' }}
                    >×</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          className="btn-premium primary" 
          style={{ width: '100%', height: '58px', fontSize: '1.1rem', marginTop: '10px' }}
          onClick={createPoll}
          disabled={loading || options.length < 2}
        >
          {loading ? "Initializing Poll..." : "Launch Poll 🚀"}
        </button>
        
        {options.length < 2 && (
          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.8rem', marginTop: '12px' }}>
            Add at least 2 destinations to start
          </p>
        )}
      </motion.div>
    </div>
  );
}