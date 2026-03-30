import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PlaceImage from "../components/PlaceImage";
import "../styles/global.css";

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
      // Generate simple recommendations based on the last voted city's tags
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

  if (loading) return <div className="page" style={{ justifyContent: 'center', alignItems: 'center' }}><h2>Loading Poll...</h2></div>;
  if (!poll) return <div className="page" style={{ justifyContent: 'center', alignItems: 'center' }}><h2>Poll not found.</h2></div>;

  const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);
  const maxVotes = Math.max(...poll.options.map(o => o.votes));
  const topOptions = poll.options.filter(o => o.votes === maxVotes);
  const isTie = topOptions.length > 1 && totalVotes >= 2;

  return (
    <div className="page" style={{ alignItems: 'center', justifyContent: 'flex-start', background: '#030712', overflowY: 'auto', paddingBottom: '100px' }}>
      
      {!poll.isClosed && (
        <div style={{ 
          position: 'fixed', 
          top: '80px', 
          left: 0, 
          right: 0, 
          background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', 
          color: 'white', 
          padding: '12px', 
          textAlign: 'center', 
          zIndex: 1000,
          fontWeight: '800',
          fontSize: '0.8rem',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          LIVE PREFERENCE CAPTURE ACTIVE
        </div>
      )}

      <div className="tt-container" style={{ maxWidth: '600px', width: '100%', marginTop: '60px' }}>
        
        <header className="tt-header" style={{ marginBottom: '40px' }}>
          <div className="tt-badge-ai">CITY BATTLE</div>
          <h1 className="tt-main-title" style={{ fontSize: '2.5rem' }}>{poll.tripName}</h1>
          <p className="tt-subtitle">
            {poll.isClosed ? `Decision Locked: ${poll.winner} won.` : "Cast your vote to shape your group's travel profile."}
          </p>
        </header>

        {message && (
          <div style={{ 
            background: 'rgba(16, 185, 129, 0.1)', 
            color: '#10b981', 
            padding: '16px', 
            borderRadius: '16px', 
            textAlign: 'center', 
            marginBottom: '32px', 
            fontWeight: '700',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            {message}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', width: '100%' }}>
          {poll.options.map((opt, i) => {
            const isWinner = poll.isClosed && poll.winner === opt.name;
            const isSelected = selectedOption === opt.name;
            const cityData = cityDataMap[opt.name] || { tags: ["Explore"], vibe: "New Experience" };

            return (
              <div 
                key={i} 
                className={`tt-card ${isSelected || isWinner ? 'active' : ''}`}
                style={{ 
                  height: 'auto', 
                  maxWidth: '100%', 
                  padding: '0', 
                  overflow: 'hidden',
                  border: (isWinner || isSelected) ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(15, 23, 42, 0.6)',
                  opacity: (hasVoted && !isSelected && !isWinner) ? 0.7 : 1
                }}
                onClick={() => handleVote(opt.name)}
              >
                <div style={{ display: 'flex', height: '140px' }}>
                  <div style={{ width: '140px', height: '100%', position: 'relative' }}>
                    <PlaceImage placeName={opt.name} city={opt.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ 
                      position: 'absolute', 
                      bottom: '10px', 
                      left: '10px', 
                      background: 'rgba(0,0,0,0.6)', 
                      padding: '4px 8px', 
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '800'
                    }}>
                      🗳️ {opt.votes}
                    </div>
                  </div>
                  <div style={{ flex: 1, padding: '20px', textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={{ margin: '0 0 5px', fontSize: '1.2rem', fontWeight: '800' }}>{opt.name}</h3>
                      {(isSelected || isWinner) && <span style={{ color: '#3b82f6', fontSize: '1.2rem' }}>✓</span>}
                    </div>
                    <p style={{ margin: '0 0 10px', fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>"{cityData.vibe}"</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {cityData.tags.slice(0, 3).map(tag => (
                        <span key={tag} style={{ 
                          fontSize: '10px', 
                          background: 'rgba(59, 130, 246, 0.1)', 
                          color: '#60a5fa', 
                          padding: '2px 8px', 
                          borderRadius: '100px',
                          fontWeight: '700'
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {hasVoted && recommendations.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: '60px', width: '100%' }}
          >
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '40px', textAlign: 'center' }}>
              <div className="tt-badge-ai">SMART SUGGESTIONS</div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '10px' }}>Based on your preference</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '30px' }}>
                You seem to enjoy <strong>{recommendations[0].tags[0]}</strong> and <strong>{recommendations[0].tags[1]}</strong>. Explore these similar gems:
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '15px' }}>
                {recommendations.map(rec => (
                  <div key={rec.name} className="premium-card" style={{ padding: '15px', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ width: '100%', height: '80px', borderRadius: '12px', overflow: 'hidden', marginBottom: '10px' }}>
                      <PlaceImage placeName={rec.name} city={rec.name} />
                    </div>
                    <h4 style={{ margin: '0 0 10px', fontSize: '1rem' }}>{rec.name}</h4>
                    <button 
                      className="btn-premium primary" 
                      style={{ padding: '6px 12px', fontSize: '0.75rem', width: '100%', justifyContent: 'center' }}
                      onClick={() => handlePlanForCity(rec.name)}
                    >
                      Plan Trip →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div style={{ marginTop: '60px', textAlign: 'center' }}>
          <button className="pf-secondary-btn" onClick={() => navigate(`/poll-results/${pollId}`)}>View Full Stats 📊</button>
        </div>

      </div>
    </div>
  );
}
