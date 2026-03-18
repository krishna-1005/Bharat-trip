import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../styles/global.css";

const API = import.meta.env.VITE_API_URL;

export default function VotePoll() {
  const { pollId } = useParams();
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
  }, [pollId]);

  if (loading) return <div className="page" style={{ justifyContent: 'center', alignItems: 'center' }}><h2>Loading Poll...</h2></div>;
  if (!poll) return <div className="page" style={{ justifyContent: 'center', alignItems: 'center' }}><h2>Poll not found.</h2></div>;

  return (
    <div className="page" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className="premium-card" style={{ maxWidth: '500px', width: '100%', padding: '40px' }}>
        <h1 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '10px' }}>{poll.tripName}</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-dim)', marginBottom: '30px' }}>Vote for your favorite destination!</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {poll.options.map((opt, i) => (
            <div key={i} className="premium-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)' }}>
              <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>{opt.name}</span>
              <button className="btn-premium primary" style={{ padding: '8px 20px' }}>Vote</button>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>Share this link with friends to get their votes!</p>
          <input 
            readOnly 
            value={window.location.href} 
            className="auth-input-styled" 
            style={{ textAlign: 'center', marginTop: '10px', cursor: 'pointer' }}
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