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

  const cityDataMap = {
    "Goa": { tags: ["Beach", "Nightlife", "Party"], vibe: "Beach • Chill" },
    "Bangalore": { tags: ["IT Hub", "Gardens", "Weather"], vibe: "Modern • Green" },
    "Bengaluru": { tags: ["IT Hub", "Gardens", "Weather"], vibe: "Modern • Green" },
    "Mumbai": { tags: ["Metropolis", "Ocean", "Food"], vibe: "Energetic • Coastal" },
    "Jaipur": { tags: ["Heritage", "Culture", "Architecture"], vibe: "Royal • Historic" },
    "Delhi": { tags: ["History", "Food", "Shopping"], vibe: "Historic • Intense" },
    "New Delhi": { tags: ["History", "Food", "Shopping"], vibe: "Historic • Intense" },
    "Udaipur": { tags: ["Lakes", "Palaces", "Heritage"], vibe: "Serene • Royal" },
    "Manali": { tags: ["Adventure", "Mountains", "Snow"], vibe: "Adventurous • Scenic" },
    "Shimla": { tags: ["Mountains", "Heritage", "Colonial"], vibe: "Scenic • Nostalgic" },
    "Kochi": { tags: ["Coastal", "Culture", "History"], vibe: "Relaxed • Cultural" },
    "Varanasi": { tags: ["Spiritual", "Culture", "Heritage"], vibe: "Mystical • Ancient" },
    "Agra": { tags: ["Heritage", "Iconic", "History"], vibe: "Historic • Iconic" },
    "Hyderabad": { tags: ["Food", "History", "Pearls"], vibe: "Vibrant • Historic" },
    "Pondicherry": { tags: ["Coastal", "French", "Peaceful"], vibe: "Quiet • Colonial" },
    "Gokarna": { tags: ["Beach", "Peaceful", "Spiritual"], vibe: "Bohemian • Natural" },
    "Rishikesh": { tags: ["Spiritual", "Adventure", "Yoga"], vibe: "Spiritual • Active" },
    "Mysore": { tags: ["Heritage", "Palace", "Culture"], vibe: "Royal • Traditional" },
    "Ooty": { tags: ["Mountains", "Tea Gardens", "Weather"], vibe: "Scenic • Refreshing" },
    "Coorg": { tags: ["Nature", "Coffee", "Mountains"], vibe: "Green • Serene" },
    "Munnar": { tags: ["Nature", "Tea Gardens", "Mountains"], vibe: "Emerald • Quiet" },
    "Alleppey": { tags: ["Backwaters", "Nature", "Houseboat"], vibe: "Liquid • Serene" },
    "Leh": { tags: ["Mountains", "Adventure", "Culture"], vibe: "Epic • Stark" },
    "Ladakh": { tags: ["Mountains", "Adventure", "Culture"], vibe: "Epic • Stark" },
    "Hampi": { tags: ["Heritage", "History", "Ruins"], vibe: "Boulder-strewn • Ancient" }
  };

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const res = await fetch(`${API}/api/polls/${pollId}`);
        const data = await res.json();
        if (res.ok) {
          setPoll(data);
          const votedPolls = JSON.parse(localStorage.getItem("votedPolls") || "[]");
          if (votedPolls.includes(pollId) || data.isClosed) {
            setHasVoted(true);
            // If already voted or closed, redirect to results after a short delay
            setTimeout(() => navigate(`/poll-results/${pollId}`), 2000);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPoll();
  }, [pollId, navigate]);

  const handleVoteSubmit = async () => {
    if (!selectedOption || hasVoted || submitting || poll?.isClosed) return;

    setSubmitting(true);
    try {
      const payload = { 
        pollId, 
        optionName: selectedOption,
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
        setMessage("✅ Your vote has been recorded");
        const votedPolls = JSON.parse(localStorage.getItem("votedPolls") || "[]");
        votedPolls.push(pollId);
        localStorage.setItem("votedPolls", JSON.stringify(votedPolls));
        
        // Auto redirect after success
        setTimeout(() => navigate(`/poll-results/${pollId}`), 1500);
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

  if (loading) return <div className="poll-page-container"><h2>Loading Voting Experience...</h2></div>;
  
  if (!poll) return (
    <div className="poll-page-container">
        <div className="empty-dashboard">
            <h2>Poll not found.</h2>
            <button className="btn-premium primary" onClick={() => navigate("/")}>Back Home</button>
        </div>
    </div>
  );

  const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);

  return (
    <div className="poll-page-container">
      <div className="poll-dashboard-wrapper">
        
        {/* --- STEP 1: HERO HEADER --- */}
        <header className="dashboard-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
            <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="dashboard-title"
            >
                Where should you travel next?
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="dashboard-subtitle"
            >
                {poll.tripName} • Vote and help decide the best destination
            </motion.p>
            <p style={{ fontSize: '12px', color: '#4B5563', marginTop: '12px' }}>Based on community votes • {totalVotes} already cast</p>
        </header>

        <AnimatePresence>
          {message && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="vote-success-toast"
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- STEP 2 & 4: GRID LAYOUT & OPTION CARDS --- */}
        <div className="vote-grid">
          {poll.options.map((opt, i) => {
            const isSelected = selectedOption === opt.name;
            const cityData = cityDataMap[opt.name] || { tags: ["Explore"], vibe: "New Experience" };

            return (
              <motion.div 
                key={opt.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`vote-option-card ${isSelected ? 'selected' : ''}`}
                onClick={() => !hasVoted && setSelectedOption(opt.name)}
              >
                {isSelected && (
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="selection-indicator"
                    >
                        ✓
                    </motion.div>
                )}
                
                <div className="card-image-wrapper">
                    <PlaceImage placeName={opt.name} city={opt.name} />
                    <div className="card-image-overlay"></div>
                </div>

                <div className="vote-card-body">
                  <span className="vote-card-vibe">{cityData.vibe}</span>
                  <h3 className="vote-card-name">{opt.name}</h3>
                  <div className="option-tags">
                    {cityData.tags.map(tag => (
                      <span key={tag} className="dash-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* --- STEP 5: VOTE BUTTON (Sticky) --- */}
        {!hasVoted && (
            <div className="sticky-vote-bar">
                <button 
                    className="vote-submit-btn" 
                    disabled={!selectedOption || submitting}
                    onClick={handleVoteSubmit}
                >
                    {submitting ? "Recording Vote..." : "Vote Now"}
                </button>
            </div>
        )}

        {hasVoted && (
            <div style={{ textAlign: 'center', marginTop: '20px', color: 'var(--dash-muted)' }}>
                Redirecting to results dashboard...
            </div>
        )}

      </div>
    </div>
  );
}
