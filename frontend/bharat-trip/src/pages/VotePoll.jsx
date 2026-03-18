import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/global.css";

const API = import.meta.env.VITE_API_URL;

export default function VotePoll() {
  const { pollId } = useParams();
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

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
          // Check if already voted in this session
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
    
    // Refresh every 5 seconds for live feel
    const interval = setInterval(fetchPoll, 5000);
    return () => clearInterval(interval);
  }, [pollId]);

  const handleVote = async (optionName) => {
    if (hasVoted || submitting || poll?.isClosed) return;

    setSelectedOption(optionName);
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/polls/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollId, optionName }),
      });
      const data = await res.json();
      if (res.ok) {
        setHasVoted(true);
        setMessage(data.poll.isClosed ? "Decision finalized! ✨" : "Vote recorded! ✨");
        // Save to local storage to prevent duplicate voting
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

  const handleFinalizeNow = async () => {
    if (submitting || poll?.isClosed) return;
    
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/polls/finalize-now`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollId }),
      });
      const data = await res.json();
      if (res.ok) {
        setPoll(data.poll);
        setMessage("Poll finalized manually! 🏁");
      } else {
        alert(data.error || "Failed to finalize poll.");
      }
    } catch (err) {
      console.error(err);
      alert("Server error.");
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied! ✨");
  };

  if (loading) return <div className="page" style={{ justifyContent: 'center', alignItems: 'center' }}><h2>Loading Poll...</h2></div>;
  if (!poll) return <div className="page" style={{ justifyContent: 'center', alignItems: 'center' }}><h2>Poll not found.</h2></div>;

  const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);
  const maxVotes = Math.max(...poll.options.map(o => o.votes));
  const topOptions = poll.options.filter(o => o.votes === maxVotes);
  const isTie = topOptions.length > 1 && totalVotes >= 3;

  return (
    <div className="page" style={{ alignItems: 'center', justifyContent: 'center', background: '#030712' }}>
      <div className="premium-card" style={{ 
        maxWidth: '500px', 
        width: '100%', 
        padding: '40px',
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '32px'
      }}>
        {/* Feature 5: Top Message (Hybrid) */}
        {!poll.isClosed && !hasVoted && (
          <div style={{ 
            background: 'rgba(59, 130, 246, 0.1)', 
            border: '1px solid rgba(59, 130, 246, 0.2)', 
            padding: '12px 16px', 
            borderRadius: '12px', 
            marginBottom: '24px',
            color: '#60a5fa',
            fontSize: '0.85rem',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            {poll.groupSize 
              ? "Decision will be finalized automatically when majority is reached."
              : "Decision will be finalized after a few votes — no need to wait for everyone."}
          </div>
        )}

        <h1 style={{ textAlign: 'center', fontSize: '2.2rem', fontWeight: '800', marginBottom: '10px', color: '#f8fafc', letterSpacing: '-1px' }}>{poll.tripName}</h1>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          {/* Feature 3: Closed Message */}
          {poll.isClosed ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', animation: 'fadeIn 0.8s ease' }}>
                <div style={{ padding: '20px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '20px', width: '100%' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#f8fafc', margin: '0 0 5px' }}>
                        {poll.winner === "Tie" ? "Final Decision: It's a Tie! 🤝" : `Final Decision: ${poll.winner} ✅`}
                    </h2>
                </div>
                <div style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '100px', color: '#ef4444', fontWeight: '800', fontSize: '12px', letterSpacing: '1px' }}>
                    VOTING CLOSED — DECISION FINALIZED
                </div>
            </div>
          ) : (
            <div>
                <p style={{ color: '#94a3b8', marginBottom: '8px' }}>
                {hasVoted ? "You have already voted" : "Tap your favorite destination to vote"}
                </p>
                {/* Feature 6: Voting Progress (Hybrid) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>
                        {poll.groupSize 
                            ? `${totalVotes} of ${poll.groupSize} group members have voted`
                            : `${totalVotes} votes received`}
                    </span>
                    {/* Tie message for dynamic polls */}
                    {!poll.groupSize && isTie && (
                        <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: '700' }}>
                            It's a tie — one more vote needed ⚖️
                        </span>
                    )}
                </div>
            </div>
          )}
        </div>

        {message && (
          <div style={{ 
            background: 'rgba(16, 185, 129, 0.1)', 
            color: '#10b981', 
            padding: '12px', 
            borderRadius: '12px', 
            textAlign: 'center', 
            marginBottom: '24px', 
            fontWeight: '700',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            animation: 'fadeIn 0.5s ease'
          }}>
            {message}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {poll.options.map((opt, i) => (
            <div 
              key={i} 
              className={`premium-card ${selectedOption === opt.name ? 'active' : ''}`} 
              style={{ 
                padding: '20px', 
                cursor: (hasVoted || submitting || poll.isClosed) ? 'default' : 'pointer', 
                background: selectedOption === opt.name ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.02)',
                border: selectedOption === opt.name ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.05)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: ( (hasVoted || poll.isClosed) && selectedOption !== opt.name) ? 0.6 : 1,
                transform: selectedOption === opt.name ? 'scale(1.02)' : 'scale(1)'
              }}
              onClick={() => handleVote(opt.name)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: '700', fontSize: '1.1rem', color: selectedOption === opt.name ? '#f8fafc' : '#cbd5e1' }}>{opt.name}</span>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{opt.votes} {opt.votes === 1 ? 'vote' : 'votes'}</span>
                </div>
                <div style={{ 
                  width: '20px', 
                  height: '20px', 
                  borderRadius: '50%', 
                  border: '2px solid #3b82f6',
                  background: selectedOption === opt.name ? '#3b82f6' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}>
                  {selectedOption === opt.name && <span style={{ color: 'white', fontSize: '12px' }}>✓</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Feature 4: Manual Override Button */}
        {!poll.isClosed && totalVotes >= 2 && (
            <button 
                className="btn-premium outline" 
                onClick={handleFinalizeNow}
                disabled={submitting}
                style={{ 
                    width: '100%', 
                    justifyContent: 'center', 
                    height: '48px', 
                    borderRadius: '12px',
                    marginTop: '20px',
                    fontSize: '0.9rem',
                    color: '#94a3b8'
                }}
            >
                {submitting ? "Finalizing..." : "Finalize Decision Now 🏁"}
            </button>
        )}

        {(hasVoted || poll.isClosed) && (
          <div style={{ marginTop: '24px', textAlign: 'center', animation: 'fadeIn 0.8s ease' }}>
             <button 
                className="btn-premium primary" 
                onClick={() => navigate(`/poll-results/${pollId}`)} 
                style={{ 
                    width: '100%', 
                    justifyContent: 'center', 
                    height: '54px', 
                    borderRadius: '16px',
                    background: '#3b82f6',
                    fontWeight: '700'
                }}
             >
                {poll.isClosed ? "View Final Results 📊" : "View Live Results 📊"}
             </button>
          </div>
        )}

        <div style={{ marginTop: '40px', borderTop: '1px solid var(--border-main)', paddingTop: '20px' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '10px', textAlign: 'center' }}>Share this link with more friends:</p>
          <div style={{ position: 'relative' }}>
            <input 
              readOnly 
              value={window.location.href} 
              className="auth-input-styled" 
              style={{ paddingRight: '100px', cursor: 'pointer', fontSize: '0.8rem', textOverflow: 'ellipsis' }}
              onClick={copyToClipboard}
            />
            <button 
              className="btn-premium primary" 
              onClick={copyToClipboard}
              style={{ position: 'absolute', right: '5px', top: '5px', height: '44px', padding: '0 15px', fontSize: '0.8rem' }}
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
