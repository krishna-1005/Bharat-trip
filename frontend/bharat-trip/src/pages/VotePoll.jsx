import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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

    const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);
    const maxVotes = Math.max(...poll.options.map(o => o.votes));
    const topOptions = poll.options.filter(o => o.votes === maxVotes);

    if (topOptions.length > 1) {
        const confirm = window.confirm("This will break the tie and finalize decision using current leading options. Continue?");
        if (!confirm) return;
    }
    
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
  const isTie = topOptions.length > 1 && totalVotes >= 2;
  const isCreator = user && (poll.createdBy === user.uid || poll.createdBy === user.id);

  // Guidance Banner Selection
  let topBannerText = "Stop discussing — vote once and decision will be finalized automatically";
  let lockSubtext = poll.groupSize 
    ? "Decision will lock as soon as majority is reached" 
    : "Decision will lock after a few votes";

  let urgencyText = "";
  if (!poll.isClosed) {
    if (poll.groupSize) {
      const majority = Math.floor(poll.groupSize / 2) + 1;
      const remaining = majority - maxVotes;
      if (remaining > 0) {
        urgencyText = `${maxVotes} people voted — ${remaining} more can finalize`;
      } else {
        urgencyText = `${totalVotes} votes received — finalizing...`;
      }
    } else {
      if (totalVotes < 3) {
        urgencyText = `${totalVotes} votes — ${3 - totalVotes} more to finalize`;
      } else {
        urgencyText = "Decision will finalize now";
      }
    }
  }

  return (
    <div className="page" style={{ alignItems: 'center', justifyContent: 'center', background: '#030712' }}>
      
      {/* ── STRONG ENTRY BANNER ── */}
      {!poll.isClosed && (
        <div style={{ 
          position: 'fixed', 
          top: '80px', 
          left: 0, 
          right: 0, 
          background: 'linear-gradient(90deg, #ef4444, #f59e0b)', 
          color: 'white', 
          padding: '12px', 
          textAlign: 'center', 
          zIndex: 1000,
          fontWeight: '800',
          fontSize: '0.9rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          {topBannerText}
        </div>
      )}

      <div className="premium-card" style={{ 
        maxWidth: '500px', 
        width: '100%', 
        padding: '40px',
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '32px',
        marginTop: poll.isClosed ? '0' : '60px'
      }}>
        
        {!poll.isClosed && (
          <div style={{ 
            background: 'rgba(59, 130, 246, 0.1)', 
            border: '1px solid rgba(59, 130, 246, 0.2)', 
            padding: '16px', 
            borderRadius: '16px', 
            marginBottom: '32px',
            textAlign: 'center'
          }}>
            <div style={{ color: '#60a5fa', fontSize: '0.9rem', fontWeight: '800', marginBottom: '4px' }}>
              {lockSubtext}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '600' }}>
              {urgencyText}
            </div>
          </div>
        )}

        <h1 style={{ textAlign: 'center', fontSize: '2.2rem', fontWeight: '800', marginBottom: '10px', color: '#f8fafc', letterSpacing: '-1px' }}>{poll.tripName}</h1>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          {poll.isClosed ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', animation: 'fadeIn 0.8s ease' }}>
                <div style={{ padding: '24px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '24px', width: '100%' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#10b981', margin: '0 0 8px' }}>
                        Final Decision: {poll.winner} ✅
                    </h2>
                    <p style={{ color: '#10b981', margin: 0, fontWeight: '700', fontSize: '0.9rem' }}>No more discussion needed</p>
                </div>
                <div style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '100px', color: '#ef4444', fontWeight: '800', fontSize: '12px', letterSpacing: '1px' }}>
                    DECISION LOCKED
                </div>
            </div>
          ) : (
            <div>
                <p style={{ color: '#94a3b8', marginBottom: '0' }}>
                {hasVoted ? "Your vote is recorded" : "Quick tap to finalize destination"}
                </p>
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
          {poll.options.map((opt, i) => {
            const isTiedLead = !poll.isClosed && isTie && opt.votes === maxVotes;
            const isWinner = poll.isClosed && poll.winner === opt.name;

            return (
              <div 
                key={i} 
                className={`premium-card ${(selectedOption === opt.name || isTiedLead) ? 'active' : ''}`} 
                style={{ 
                  padding: '20px', 
                  cursor: (hasVoted || submitting || poll.isClosed) ? 'default' : 'pointer', 
                  background: (isWinner || isTiedLead) ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.02)',
                  border: (isWinner || isTiedLead) ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.05)',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  opacity: ( (hasVoted || poll.isClosed) && !isWinner && !isTiedLead && selectedOption !== opt.name) ? 0.6 : 1,
                  transform: (isWinner || isTiedLead) ? 'scale(1.02)' : 'scale(1)'
                }}
                onClick={() => handleVote(opt.name)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: '700', fontSize: '1.1rem', color: (isWinner || isTiedLead) ? '#f8fafc' : '#cbd5e1' }}>
                        {opt.name} {isTiedLead && '⚖️'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{opt.votes} {opt.votes === 1 ? 'vote' : 'votes'}</span>
                  </div>
                  <div style={{ 
                    width: '20px', 
                    height: '20px', 
                    borderRadius: '50%', 
                    border: '2px solid #3b82f6',
                    background: (selectedOption === opt.name || isWinner) ? '#3b82f6' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {(selectedOption === opt.name || isWinner) && <span style={{ color: 'white', fontSize: '12px' }}>✓</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Manual Override for Creator */}
        {!poll.isClosed && totalVotes >= 2 && (
            <div style={{ marginTop: '24px' }}>
                {isCreator ? (
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '10px' }}>Not everyone voted — you can still finalize decision</p>
                        <button 
                            className="btn-premium primary" 
                            onClick={handleFinalizeNow}
                            disabled={submitting}
                            style={{ width: '100%', justifyContent: 'center', height: '48px', borderRadius: '12px' }}
                        >
                            {submitting ? "Finalizing..." : "Finalize with current votes 🏁"}
                        </button>
                    </div>
                ) : (
                    <p style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>
                        Only the poll creator can finalize the decision manually
                    </p>
                )}
            </div>
        )}

        {(hasVoted || poll.isClosed) && (
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
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

             {/* ── MICRO FEEDBACK ── */}
             {!poll.isClosed && (
               <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '24px' }}>
                 {['👍', '🔥', '💸'].map(emoji => (
                   <button 
                    key={emoji}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      fontSize: '1.5rem', 
                      cursor: 'pointer',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.3)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    onClick={() => {
                      const btn = document.createElement('div');
                      btn.innerText = emoji;
                      btn.style.position = 'fixed';
                      btn.style.left = `${Math.random() * 80 + 10}%`;
                      btn.style.bottom = '0';
                      btn.style.fontSize = '2rem';
                      btn.style.zIndex = '2000';
                      btn.style.transition = 'all 2s ease-out';
                      document.body.appendChild(btn);
                      setTimeout(() => {
                        btn.style.transform = 'translateY(-100vh) rotate(360deg)';
                        btn.style.opacity = '0';
                      }, 10);
                      setTimeout(() => document.body.removeChild(btn), 2000);
                    }}
                   >
                     {emoji}
                   </button>
                 ))}
               </div>
             )}
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
