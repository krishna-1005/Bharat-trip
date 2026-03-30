import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/global.css";
import "./planner.css"; // Reuse some planner styles

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "");

export default function CreatePoll() {
  const { user } = useAuth();
  const [tripName, setTripName] = useState("");
  const [groupSize, setGroupSize] = useState(""); // Initialize as empty string
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
      <div className="page" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="premium-card" style={{ maxWidth: '500px', width: '100%', padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🚀</div>
          <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Poll <span className="gradient-text">Ready!</span></h1>
          <div style={{ 
            background: 'rgba(59, 130, 246, 0.1)', 
            padding: '16px', 
            borderRadius: '16px', 
            marginBottom: '24px',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <p style={{ color: '#60a5fa', fontWeight: '800', margin: 0 }}>
              Send this link in your group to finalize quickly
            </p>
          </div>
          
          <div className="pf-field">
            <label className="pf-label" style={{ textAlign: 'left' }}>Shareable Link</label>
            <div style={{ position: 'relative' }}>
              <input 
                readOnly 
                value={`${window.location.origin}/vote/${createdPollId}`} 
                className="auth-input-styled" 
                style={{ paddingRight: '100px', cursor: 'pointer', textOverflow: 'ellipsis' }}
                onClick={copyToClipboard}
              />
              <button 
                className="btn-premium primary" 
                onClick={copyToClipboard}
                style={{ position: 'absolute', right: '5px', top: '5px', height: '44px', padding: '0 15px', fontSize: '0.8rem' }}
              >
                Copy Link
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
            <button className="btn-premium outline" onClick={() => setPollCreated(false)} style={{ flex: 1, justifyContent: 'center' }}>Create Another</button>
            <button className="btn-premium primary" onClick={() => navigate(`/vote/${createdPollId}`)} style={{ flex: 1, justifyContent: 'center' }}>Go to Vote ➔</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className="premium-card" style={{ maxWidth: '500px', width: '100%', padding: '40px' }}>
        <h1 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '10px' }}>Trip <span className="gradient-text">Poll</span></h1>
        <p style={{ textAlign: 'center', color: 'var(--text-dim)', marginBottom: '30px' }}>Decide your next destination with friends.</p>

        <div className="pf-field">
          <label className="pf-label">Trip Name</label>
          <input 
            type="text" 
            placeholder="e.g., Summer Getaway 2026" 
            className="auth-input-styled"
            value={tripName}
            onChange={(e) => setTripName(e.target.value)}
          />
        </div>

        <div className="pf-field">
          <label className="pf-label">Expected number of voters (optional)</label>
          <input 
            type="number" 
            min="2"
            max="100"
            placeholder="e.g. 5 (Leave blank for dynamic majority)"
            className="auth-input-styled"
            value={groupSize}
            onChange={(e) => setGroupSize(e.target.value)}
          />
          <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            {groupSize 
              ? `Poll will close when more than half (${Math.floor(parseInt(groupSize)/2) + 1}) vote for one spot.` 
              : "Poll will close when someone gets more than 50% of total votes cast."}
          </p>
        </div>

        <div className="pf-field">
          <label className="pf-label">Add Destination</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="e.g., Goa" 
              className="auth-input-styled"
              value={option}
              onChange={(e) => setOption(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addOption()}
            />
            <button className="btn-premium primary" onClick={addOption} style={{ padding: '0 20px' }}>Add</button>
          </div>
        </div>

        {options.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <label className="pf-label">Destinations</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {options.map((opt, i) => (
                <div key={i} className="pf-interest-pill active" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {opt}
                  <span onClick={() => removeOption(i)} style={{ cursor: 'pointer', fontWeight: 'bold' }}>×</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button 
          className="btn-premium primary" 
          style={{ width: '100%', justifyContent: 'center', height: '54px' }}
          onClick={createPoll}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Poll"}
        </button>
      </div>
    </div>
  );
}