import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const SavedTrips = () => {
  const [trips, setTrips] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("savedTrips") || "[]");
    // Sort by latest first
    const sorted = saved.sort((a, b) => new Date(b.date) - new Date(a.date));
    setTrips(sorted);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (trips.length === 0) {
    return (
      <div className="pro-empty" style={{ padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)' }}>
        <div className="pro-empty-icon">🎒</div>
        <h3>No Finalized Trips Yet</h3>
        <p>Your finalized group trips from polls will appear here.</p>
        <button className="btn-premium primary" style={{ marginTop: '12px' }} onClick={() => navigate("/create-poll")}>Create a Poll</button>
      </div>
    );
  }

  return (
    <div className="pro-trips-grid">
      {trips.map((trip, index) => (
        <motion.div 
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="pro-trip-card"
          style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-main)' }}
        >
          <div className="pro-trip-body" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h3 className="pro-trip-title" style={{ margin: 0, fontSize: '1.25rem' }}>{trip.destination}</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '6px' }}>
                    {new Date(trip.date).toLocaleDateString()}
                </span>
            </div>
            
            <div className="pro-trip-meta" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-dim)' }}>Cost per person</span>
                <span style={{ fontWeight: '700', color: '#60a5fa' }}>{formatCurrency(trip.costPerPerson)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-dim)' }}>Group Size</span>
                <span>{trip.numPeople} People</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-dim)' }}>Total Budget</span>
                <span>{formatCurrency(trip.totalCost)}</span>
              </div>
            </div>

            <button 
                className="btn-premium outline" 
                style={{ width: '100%', fontSize: '0.9rem' }}
                onClick={() => navigate("/planner", { state: { prefilledCity: trip.destination } })}
            >
                View Details
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default SavedTrips;
