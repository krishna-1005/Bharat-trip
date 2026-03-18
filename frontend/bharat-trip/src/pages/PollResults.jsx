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
  const finalDecision = winners.length === 1 ? winners[0].name : null;

  return (
    <div className="page" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className="premium-card" style={{ maxWidth: '600px', width: '100%', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{poll.tripName}</h1>
            <div className="premium-badge" style={{ margin: '0 auto' }}>
                <span className="pulse-dot"></span> POLL RESULTS
            </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
          {poll.options.sort((a, b) => b.votes - a.votes).map((opt, i) => {
            const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
            const isWinner = opt.name === finalDecision;

            return (
              <div key={i} className={`premium-card ${isWinner ? 'winner' : ''}`} style={{ 
                padding: '20px', 
                background: isWinner ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.03)',
                border: isWinner ? '2px solid var(--accent-blue)' : '1px solid var(--border-main)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {isWinner && (
                    <div style={{ position: 'absolute', top: '10px', right: '20px', background: 'var(--accent-blue)', color: 'white', fontSize: '10px', fontWeight: '800', padding: '4px 10px', borderRadius: '100px' }}>
                        FINAL DECISION
                    </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', position: 'relative', zIndex: 2 }}>
                  <span style={{ fontWeight: '800', fontSize: '1.2rem' }}>{opt.name}</span>
                  <span style={{ fontWeight: '700', color: isWinner ? 'var(--accent-blue)' : 'var(--text-dim)' }}>{opt.votes} votes ({percentage}%)</span>
                </div>

                <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden', position: 'relative', zIndex: 2 }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${percentage}%`, 
                    background: isWinner ? 'linear-gradient(90deg, var(--accent-blue), var(--accent-purple))' : 'var(--text-dim)',
                    transition: 'width 1s ease-out'
                  }}></div>
                </div>
              </div>
            );
          })}
        </div>

        {finalDecision && (
            <div style={{ textAlign: 'center', marginBottom: '40px', animation: 'fadeIn 1s ease' }}>
                <h2 style={{ fontSize: '1.8rem' }}>Trip Finalized 🎉</h2>
                <p style={{ color: 'var(--text-dim)' }}>Pack your bags for <strong>{finalDecision}</strong>!</p>
            </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <button 
            className="btn-premium outline" 
            style={{ justifyContent: 'center' }}
            onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Results link copied!");
            }}
          >
            Share Result 🔗
          </button>
          <button 
            className="btn-premium primary" 
            style={{ justifyContent: 'center' }}
            onClick={() => navigate("/planner", { state: { prefilledCity: finalDecision } })}
          >
            Plan This Trip ✨
          </button>
        </div>
      </div>
    </div>
  );
}