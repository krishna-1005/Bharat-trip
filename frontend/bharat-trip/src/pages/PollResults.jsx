import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/global.css";

const API = import.meta.env.VITE_API_URL;

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
    
    // Refresh results every 5 seconds for live feel
    const interval = setInterval(fetchPoll, 5000);
    return () => clearInterval(interval);
  }, [pollId]);

  if (loading) return <div className="page" style={{ justifyContent: 'center', alignItems: 'center' }}><h2>Loading Results...</h2></div>;
  if (!poll) return <div className="page" style={{ justifyContent: 'center', alignItems: 'center' }}><h2>Poll not found.</h2></div>;

  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
  const maxVotes = Math.max(...poll.options.map(o => o.votes));
  const winners = poll.options.filter(o => o.votes === maxVotes && o.votes > 0);
  const finalDecision = poll.winner || (winners.length === 1 ? winners[0].name : null);

  return (
    <div className="page" style={{ alignItems: 'center', justifyContent: 'center', background: '#030712' }}>
      <div className="premium-card" style={{ 
        maxWidth: '700px', 
        width: '100%', 
        padding: '60px 40px', 
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '32px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: poll.isClosed ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)', border: poll.isClosed ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '100px', marginBottom: '20px' }}>
                <span style={{ width: '6px', height: '6px', background: poll.isClosed ? '#ef4444' : '#3b82f6', borderRadius: '50%', boxShadow: poll.isClosed ? '0 0 10px #ef4444' : '0 0 10px #3b82f6' }}></span>
                <span style={{ fontSize: '10px', fontWeight: '800', color: poll.isClosed ? '#f87171' : '#60a5fa', letterSpacing: '1px' }}>{poll.isClosed ? "FINAL RESULTS — CLOSED" : "LIVE POLL RESULTS"}</span>
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '800', letterSpacing: '-1.5px', marginBottom: '10px', color: '#f8fafc' }}>{poll.tripName}</h1>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Total Votes Cast: <strong>{totalVotes}</strong></p>
        </div>

        {finalDecision && (
            <div style={{ 
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))', 
                border: '1px solid rgba(59, 130, 246, 0.3)',
                padding: '32px',
                borderRadius: '24px',
                textAlign: 'center',
                marginBottom: '40px',
                position: 'relative',
                overflow: 'hidden',
                animation: 'fadeIn 0.8s ease'
            }}>
                <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '5rem', opacity: '0.1' }}>{finalDecision === "Tie" ? "🤝" : "🎉"}</div>
                <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#f8fafc', margin: '0 0 8px' }}>
                    {finalDecision === "Tie" ? "Final Decision: It's a Tie! 🤝" : `Final Decision: ${finalDecision} ✅`}
                </h2>
                <p style={{ color: '#60a5fa', margin: 0, fontWeight: '800', fontSize: '1.4rem', letterSpacing: '1px' }}>
                    {finalDecision === "Tie" ? "No Clear Majority" : "Trip Finalized 🎉"}
                </p>
                {finalDecision === "Tie" && <p style={{ color: '#94a3b8', marginTop: '10px', fontSize: '0.9rem' }}>The group is split! You might need to revote or pick manually.</p>}
            </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
          {poll.options.sort((a, b) => b.votes - a.votes).map((opt, i) => {
            const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
            const isWinner = opt.name === finalDecision;

            return (
              <div key={i} style={{ 
                padding: '24px', 
                background: isWinner ? 'rgba(59, 130, 246, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                border: isWinner ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(255,255,255,0.05)',
                borderRadius: '20px',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: '700', fontSize: '1.2rem', color: isWinner ? '#f8fafc' : '#cbd5e1' }}>{opt.name}: {opt.votes} votes</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '800', color: isWinner ? '#60a5fa' : '#94a3b8', fontSize: '1.1rem' }}>{percentage}%</div>
                  </div>
                </div>

                <div style={{ height: '6px', background: 'rgba(255,255,255,0.03)', borderRadius: '100px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${percentage}%`, 
                    background: isWinner ? 'linear-gradient(90deg, #3b82f6, #8b5cf6)' : '#475569',
                    borderRadius: '100px',
                    transition: 'width 1.5s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}></div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginBottom: '40px', padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '12px', textAlign: 'center', fontWeight: '600' }}>Invite more friends to vote:</p>
            <div style={{ position: 'relative' }}>
                <input 
                    readOnly 
                    value={`${window.location.origin}/vote/${pollId}`} 
                    className="auth-input-styled" 
                    style={{ paddingRight: '100px', cursor: 'pointer', fontSize: '0.85rem' }}
                    onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/vote/${pollId}`);
                        alert("Vote link copied! ✨");
                    }}
                />
                <button 
                    className="btn-premium primary" 
                    style={{ position: 'absolute', right: '5px', top: '5px', height: '44px', padding: '0 15px', fontSize: '0.8rem' }}
                    onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/vote/${pollId}`);
                        alert("Vote link copied! ✨");
                    }}
                >
                    Copy
                </button>
            </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <button 
            className="btn-premium outline" 
            style={{ 
                justifyContent: 'center', 
                height: '56px', 
                borderRadius: '16px', 
                fontWeight: '700',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.02)'
            }}
            onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Results link copied! ✨");
            }}
          >
            Share Result 🔗
          </button>
          <button 
            className="btn-premium primary" 
            disabled={finalDecision === "Tie"}
            style={{ 
                justifyContent: 'center', 
                height: '56px', 
                borderRadius: '16px', 
                fontWeight: '700',
                background: finalDecision === "Tie" ? '#475569' : '#3b82f6',
                boxShadow: finalDecision === "Tie" ? 'none' : '0 10px 20px rgba(59, 130, 246, 0.2)',
                cursor: finalDecision === "Tie" ? 'not-allowed' : 'pointer'
            }}
            onClick={() => navigate("/planner", { state: { prefilledCity: finalDecision } })}
          >
            {finalDecision === "Tie" ? "Manual Pick Required" : "Plan Trip Now ✨"}
          </button>
        </div>
      </div>
    </div>
  );
}