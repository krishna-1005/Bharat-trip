import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import PlaceImage from "../components/PlaceImage";
import "./poll.css";

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "");

export default function VotePoll() {
  const { pollId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [recommendations, setRecommendations] = useState([]);

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

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const res = await fetch(`${API}/api/polls/${pollId}`);
        const data = await res.json();
        if (res.ok) {
          setPoll(data);
          if (data.isClosed) {
            setSelectedOption(data.winner);
          }
          const votedPolls = JSON.parse(localStorage.getItem("votedPolls") || "[]");
          if (votedPolls.includes(pollId)) {
            setHasVoted(true);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPoll();
    const interval = setInterval(fetchPoll, 5000);
    return () => clearInterval(interval);
  }, [pollId]);

  useEffect(() => {
    if (hasVoted && poll) {
      const votedOpt = poll.options.find(o => o.name === selectedOption) || poll.options[0];
      const tags = votedOpt.tags || [];
      
      const related = Object.entries(cityDataMap)
        .filter(([city, data]) => city !== votedOpt.name && data.tags.some(t => tags.includes(t)))
        .slice(0, 3)
        .map(([city, data]) => ({ name: city, ...data }));
      
      setRecommendations(related);
    }
  }, [hasVoted, poll, selectedOption]);

  const handleVote = async (optionName) => {
    if (hasVoted || submitting || poll?.isClosed) return;

    setSelectedOption(optionName);
    setSubmitting(true);
    try {
      const payload = { 
        pollId, 
        optionName,
        userId: user?.uid || user?.id
      };
      
      const res = await fetch(`${API}/api/polls/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setHasVoted(true);
        setMessage(data.poll.isClosed ? "Decision finalized! ✨" : "Vote recorded! ✨");
        const votedPolls = JSON.parse(localStorage.getItem("votedPolls") || "[]");
        votedPolls.push(pollId);
        localStorage.setItem("votedPolls", JSON.stringify(votedPolls));
        setPoll(data.poll);
      } else {
        alert(data.error || "Failed to record vote.");
      }
    } catch (err) {
      console.error(err);
      alert("Server error.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePlanForCity = (cityName) => {
    const data = cityDataMap[cityName] || { tags: [] };
    navigate(`/planner?destination=${encodeURIComponent(cityName)}&interests=${encodeURIComponent(data.tags.join(','))}`);
  };

  if (loading) return <div className="poll-page-container"><h2>Loading Poll...</h2></div>;
  if (!poll) return <div className="poll-page-container"><h2>Poll not found.</h2></div>;

  return (
    <div className="poll-page-container" style={{ paddingTop: '100px' }}>
      
      {!poll.isClosed && (
        <motion.div 
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          style={{ 
            position: 'fixed', 
            top: '80px', 
            left: 0, 
            right: 0, 
            background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', 
            color: 'white', 
            padding: '10px', 
            textAlign: 'center', 
            zIndex: 1000,
            fontWeight: '800',
            fontSize: '0.75rem',
            letterSpacing: '1.5px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
          }}
        >
          LIVE PREFERENCE CAPTURE ACTIVE • SHAPE YOUR TRIP
        </motion.div>
      )}

      <div className="poll-glass-card" style={{ maxWidth: '700px' }}>
        <header className="poll-header">
          <div className="poll-badge">{poll.isClosed ? "BATTLE CONCLUDED" : "CITY BATTLE"}</div>
          <h1 className="poll-title">{poll.tripName}</h1>
          <p className="poll-subtitle">
            {poll.isClosed 
              ? `The group has spoken. ${poll.winner} is the winner!` 
              : "Pick your favorite destination and let the group decide."}
          </p>
        </header>

        <AnimatePresence>
          {message && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="vote-tag"
              style={{ 
                width: '100%', 
                textAlign: 'center', 
                marginBottom: '32px', 
                background: 'rgba(16, 185, 129, 0.1)', 
                color: '#10b981',
                padding: '12px',
                borderRadius: '12px',
                fontSize: '1rem'
              }}
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="options-grid">
          {poll.options.map((opt, i) => {
            const isWinner = poll.isClosed && poll.winner === opt.name;
            const isSelected = selectedOption === opt.name;
            const cityData = cityDataMap[opt.name] || { tags: ["Explore"], vibe: "New Experience" };

            return (
              <motion.div 
                key={opt.name}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`vote-card ${isSelected || isWinner ? 'selected' : ''}`}
                style={{ 
                  opacity: (hasVoted && !isSelected && !isWinner) ? 0.5 : 1,
                  pointerEvents: (hasVoted || poll.isClosed) ? 'none' : 'auto'
                }}
                onClick={() => handleVote(opt.name)}
              >
                <div className="vote-card-content">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                    <h3 className="vote-card-title">{opt.name}</h3>
                    {(isSelected || isWinner) && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{ color: '#3b82f6', fontSize: '1.2rem' }}
                      >
                        ✓
                      </motion.span>
                    )}
                  </div>
                  <p className="vote-card-vibe">{cityData.vibe}</p>
                  <div className="vote-tag-list">
                    {cityData.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="vote-tag" style={{ fontSize: '9px', padding: '2px 8px' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="vote-card-stats">
                  {isWinner && (
                    <div className="winner-indicator">WINNER</div>
                  )}
                  <div className="vote-count-badge">
                    🗳️ {opt.votes} {opt.votes === 1 ? 'Vote' : 'Votes'}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {hasVoted && recommendations.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: '48px', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div className="poll-badge">SMART SUGGESTIONS</div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0 0 8px' }}>Since you liked {selectedOption}</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>You might also enjoy these similar destinations:</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
              {recommendations.map(rec => (
                <div key={rec.name} className="premium-card" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px' }}>
                  <div style={{ width: '100%', height: '100px', borderRadius: '12px', overflow: 'hidden', marginBottom: '12px' }}>
                    <PlaceImage placeName={rec.name} city={rec.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <h4 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: '700' }}>{rec.name}</h4>
                  <button 
                    className="btn-premium primary" 
                    style={{ padding: '8px 12px', fontSize: '0.75rem', width: '100%', borderRadius: '10px' }}
                    onClick={() => handlePlanForCity(rec.name)}
                  >
                    Plan Trip →
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <div style={{ marginTop: '48px', display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button className="btn-premium outline" style={{ borderRadius: '16px' }} onClick={() => navigate(`/poll-results/${pollId}`)}>
            View Live Results 📊
          </button>
        </div>

      </div>
    </div>
  );
}
