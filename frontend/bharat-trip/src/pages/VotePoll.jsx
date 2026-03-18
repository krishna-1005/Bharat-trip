import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../styles/global.css";

const API = import.meta.env.VITE_API_URL;

export default function VotePoll() {
  const { pollId } = useParams();
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
  }, [pollId]);

  const handleVote = async () => {
    if (!selectedOption) {
      alert("Please select an option first!");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/polls/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollId, optionName: selectedOption }),
      });
      if (res.ok) {
        setHasVoted(true);
        setMessage("Your vote is recorded! ✨");
        // Save to local storage to prevent duplicate voting
        const votedPolls = JSON.parse(localStorage.getItem("votedPolls") || "[]");
        votedPolls.push(pollId);
        localStorage.setItem("votedPolls", JSON.stringify(votedPolls));
      } else {
        alert("Failed to record vote.");
      }
    } catch (err) {
      console.error(err);
      alert("Server error.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="page" style={{ justifyContent: 'center', alignItems: 'center' }}><h2>Loading Poll...</h2></div>;
  if (!poll) return <div className="page" style={{ justifyContent: 'center', alignItems: 'center' }}><h2>Poll not found.</h2></div>;

  return (
    <div className="page" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className="premium-card" style={{ maxWidth: '500px', width: '100%', padding: '40px' }}>
        <h1 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '10px' }}>{poll.tripName}</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-dim)', marginBottom: '30px' }}>
          {hasVoted ? "Thanks for voting!" : "Vote for your favorite destination!"}
        </p>

        {message && (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-green)', padding: '15px', borderRadius: '12px', textAlign: 'center', marginBottom: '20px', fontWeight: '700' }}>
            {message}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {poll.options.map((opt, i) => (
            <div 
              key={i} 
              className={`premium-card ${selectedOption === opt.name ? 'active' : ''}`} 
              style={{ 
                padding: '20px', 
                cursor: hasVoted ? 'default' : 'pointer', 
                background: selectedOption === opt.name ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.05)',
                border: selectedOption === opt.name ? '1px solid var(--accent-blue)' : '1px solid var(--border-main)',
                transition: 'all 0.2s ease'
              }}
              onClick={() => !hasVoted && setSelectedOption(opt.name)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>{opt.name}</span>
                {!hasVoted && (
                  <div style={{ 
                    width: '20px', 
                    height: '20px', 
                    borderRadius: '50%', 
                    border: '2px solid var(--accent-blue)',
                    background: selectedOption === opt.name ? 'var(--accent-blue)' : 'transparent'
                  }}></div>
                )}
              </div>
            </div>
          ))}
        </div>

        {!hasVoted ? (
          <button 
            className="btn-premium primary" 
            style={{ width: '100%', justifyContent: 'center', height: '54px', marginTop: '30px' }}
            onClick={handleVote}
            disabled={submitting || !selectedOption}
          >
            {submitting ? "Submitting..." : "Submit Vote"}
          </button>
        ) : (
          <div style={{ marginTop: '30px', textAlign: 'center' }}>
             <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '20px' }}>Wait for your friends to finish voting!</p>
             <button className="btn-premium outline" onClick={() => navigate(`/poll-results/${pollId}`)} style={{ width: '100%', justifyContent: 'center' }}>
                View Live Results 📊
             </button>
          </div>
        )}

        <div style={{ marginTop: '40px', textAlign: 'center', borderTop: '1px solid var(--border-main)', paddingTop: '20px' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Share this link with more friends:</p>
          <input 
            readOnly 
            value={window.location.href} 
            className="auth-input-styled" 
            style={{ textAlign: 'center', marginTop: '10px', cursor: 'pointer', fontSize: '0.8rem' }}
            onClick={(e) => {
              e.target.select();
              navigator.clipboard.writeText(window.location.href);
              alert("Link copied!");
            }}
          />
        </div>
      </div>
    </div>
  );
}