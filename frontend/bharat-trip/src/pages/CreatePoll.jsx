import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/global.css";
import "./planner.css"; // Reuse some planner styles

const API = import.meta.env.VITE_API_URL;

export default function CreatePoll() {
  const [tripName, setTripName] = useState("");
  const [option, setOption] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const addOption = () => {
    if (option.trim() && !options.includes(option.trim())) {
      setOptions([...options, option.trim()]);
      setOption("");
    }
  };

  const removeOption = (index) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const createPoll = async () => {
    if (!tripName.trim() || options.length < 2) {
      alert("Please provide a trip name and at least 2 destinations.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/polls/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripName, options }),
      });
      const data = await res.json();
      if (res.ok) {
        navigate(`/vote/${data.pollId}`);
      } else {
        alert(data.error || "Failed to create poll.");
      }
    } catch (err) {
      console.error(err);
      alert("Server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className="premium-card" style={{ maxWidth: '500px', width: '100%', padding: '40px' }}>
        <h1 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '10px' }}>Trip <span className="gradient-text">Poll</span></h1>
        <p style={{ textAlign: 'center', color: 'var(--text-dim)', marginBottom: '30px' }}>Decide your next destination with friends.</p>

        <div className="pf-field">
          <label className="pf-label">Trip Name</label>
          <input 
            type="text" 
            placeholder="e.g., Summer Getaway 2026" 
            className="auth-input-styled"
            value={tripName}
            onChange={(e) => setTripName(e.target.value)}
          />
        </div>

        <div className="pf-field">
          <label className="pf-label">Add Destination</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="e.g., Goa" 
              className="auth-input-styled"
              value={option}
              onChange={(e) => setOption(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addOption()}
            />
            <button className="btn-premium primary" onClick={addOption} style={{ padding: '0 20px' }}>Add</button>
          </div>
        </div>

        {options.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <label className="pf-label">Destinations</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {options.map((opt, i) => (
                <div key={i} className="pf-interest-pill active" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {opt}
                  <span onClick={() => removeOption(i)} style={{ cursor: 'pointer', fontWeight: 'bold' }}>×</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button 
          className="btn-premium primary" 
          style={{ width: '100%', justifyContent: 'center', height: '54px' }}
          onClick={createPoll}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Poll"}
        </button>
      </div>
    </div>
  );
}