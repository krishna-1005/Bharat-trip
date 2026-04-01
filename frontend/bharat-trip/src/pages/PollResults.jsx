import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./poll.css";

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "");

export default function PollResults() {
  const { pollId } = useParams();
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const res = await fetch(`${API}/api/polls/${pollId}`);
        const data = await res.json();
        if (res.ok) {
          setPoll(data);
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

  if (loading) return <div className="poll-page-container"><h2>Loading Results...</h2></div>;
  if (!poll) return <div className="poll-page-container"><h2>Poll not found.</h2></div>;

  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
  const maxVotes = Math.max(...poll.options.map(o => o.votes));
  const topOptions = poll.options.filter(o => o.votes === maxVotes && o.votes > 0);
  const isTie = topOptions.length > 1;
  const finalDecision = poll.winner;

  return (
    <div className="poll-page-container" style={{ background: '#020202' }}>
      <div className="poll-glass-card" style={{ maxWidth: '800px', padding: '60px 40px' }}>
        
        <header className="poll-header">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '8px 16px', background: poll.isClosed ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)', border: poll.isClosed ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '100px', marginBottom: '24px' }}>
                <span className={poll.isClosed ? "" : "pulse-live"} style={{ width: '8px', height: '8px', background: poll.isClosed ? '#ef4444' : '#3b82f6', borderRadius: '50%' }}></span>
                <span style={{ fontSize: '11px', fontWeight: '800', color: poll.isClosed ? '#f87171' : '#60a5fa', letterSpacing: '1.5px' }}>{poll.isClosed ? "FINAL RESULTS — CLOSED" : "LIVE POLL UPDATES"}</span>
            </div>
            <h1 className="poll-title">{poll.tripName}</h1>
            <p className="poll-subtitle">Total Engagement: <strong>{totalVotes} Votes</strong></p>
        </header>

        {poll.isClosed && finalDecision && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="winner-card"
            >
                <div className="winner-crown">👑</div>
                <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#f8fafc', margin: '0 0 8px' }}>{finalDecision}</h2>
                <div style={{ 
                    display: 'inline-block', 
                    padding: '8px 24px', 
                    background: '#10b981', 
                    color: 'white', 
                    borderRadius: '100px', 
                    fontWeight: '800', 
                    fontSize: '1.1rem', 
                    letterSpacing: '1px',
                    boxShadow: '0 10px 20px rgba(16, 185, 129, 0.3)'
                }}>
                    WINNER DECLARED
                </div>
                <p style={{ color: '#6ee7b7', marginTop: '20px', fontWeight: '600', fontSize: '1rem' }}>Destination selected! Start planning your itinerary.</p>
            </motion.div>
        )}

        {!poll.isClosed && isTie && (
            <div style={{ 
                background: 'rgba(245, 158, 11, 0.1)', 
                border: '1px solid rgba(245, 158, 11, 0.3)',
                padding: '32px',
                borderRadius: '24px',
                textAlign: 'center',
                marginBottom: '40px'
            }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>⚖️</div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#f8fafc', margin: '0 0 8px' }}>It's a Tie!</h2>
                <p style={{ color: '#f59e0b', margin: 0, fontWeight: '700' }}>Waiting for a tie-breaker vote to finalize...</p>
            </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '48px' }}>
          {[...poll.options].sort((a, b) => b.votes - a.votes).map((opt, i) => {
            const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
            const isWinner = opt.name === finalDecision;

            return (
              <motion.div 
                key={opt.name} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="result-item"
              >
                <div className="result-info">
                  <div className="result-name">
                    {opt.name} {isWinner && "🏆"}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="result-votes">{opt.votes} votes</span>
                    <div className="result-percentage">{percentage}%</div>
                  </div>
                </div>

                <div className="progress-container">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="progress-bar"
                    style={{ 
                        background: isWinner ? 'linear-gradient(90deg, #10b981, #3b82f6)' : 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                        boxShadow: isWinner ? '0 0 20px rgba(16, 185, 129, 0.4)' : '0 0 20px rgba(59, 130, 246, 0.3)'
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="link-copy-container" style={{ marginBottom: '40px' }}>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '12px', textAlign: 'center', fontWeight: '600' }}>Invite more people to vote:</p>
            <div className="link-input-group">
                <input 
                    readOnly 
                    value={`${window.location.origin}/vote/${pollId}`} 
                    className="link-input"
                />
                <button 
                    className="btn-premium primary" 
                    onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/vote/${pollId}`);
                        alert("Vote link copied! ✨");
                    }}
                    style={{ padding: '0 20px', height: 'auto', borderRadius: '12px' }}
                >
                    Copy
                </button>
            </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <button 
            className="btn-premium outline" 
            style={{ width: '100%', borderRadius: '16px' }}
            onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Results link copied! ✨");
            }}
          >
            Share Results 🔗
          </button>
          <button 
            className="btn-premium primary" 
            disabled={!finalDecision || finalDecision === "Tie"}
            style={{ 
                width: '100%', 
                borderRadius: '16px',
                background: (!finalDecision || finalDecision === "Tie") ? '#475569' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                opacity: (!finalDecision || finalDecision === "Tie") ? 0.6 : 1
            }}
            onClick={() => navigate("/planner", { state: { prefilledCity: finalDecision } })}
          >
            {!finalDecision || finalDecision === "Tie" ? "Awaiting Winner" : "Plan Trip Now ✨"}
          </button>
        </div>
      </div>
    </div>
  );
}