import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const RebookingModal = ({ trip, onExecuted }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Only show if there's actual content to show
  if (!trip?.pendingRevision || !trip.pendingRevision.impactSummary) return null;

  const handleExecute = async () => {
    const id = trip._id || trip.id;
    if (!id) {
      setError("Critical Error: Trip ID not found.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/trips/${id}/execute-revision`);
      if (res.data.success) {
        onExecuted(); // This will trigger reload in Results.jsx
      }
    } catch (err) {
      console.error("Rebooking execution failed:", err);
      const msg = err.response?.data?.error || "Failed to execute rebooking. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async () => {
    // Optional: add backend route to clear without applying
    // For now, we can just reload the local state via onExecuted if backend is updated
    onExecuted(); 
  };

  return (
    <AnimatePresence>
      <div className="rebooking-overlay" style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', 
        backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', 
        alignItems: 'center', justifyContent: 'center', padding: '20px'
      }}>
        <motion.div 
          className="rebooking-card"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          style={{
            background: '#16161a', border: '2px solid #ef4444', 
            borderRadius: '32px', padding: '40px', maxWidth: '500px', 
            width: '100%', boxShadow: '0 20px 100px rgba(239, 68, 68, 0.3)',
            textAlign: 'center'
          }}
        >
          <div className="disruption-badge" style={{
            background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
            padding: '8px 16px', borderRadius: '100px', fontSize: '0.8rem',
            fontWeight: '900', display: 'inline-block', marginBottom: '20px'
          }}>
            DISRUPTION DETECTED
          </div>

          <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: '#fff' }}>Itinerary Alert</h2>
          <p style={{ color: '#94a3b8', lineHeight: '1.6', marginBottom: '32px' }}>
            AI has calculated a salvage plan due to <strong>{trip.pendingRevision.recalculationReason}</strong>.
            <br /><br />
            <em style={{ color: '#fff' }}>"{trip.pendingRevision.impactSummary}"</em>
          </p>

          <div className="orchestration-summary" style={{
            background: 'rgba(255,255,255,0.03)', borderRadius: '20px',
            padding: '20px', marginBottom: '40px', textAlign: 'left'
          }}>
            <h4 style={{ fontSize: '0.9rem', color: '#3b82f6', marginBottom: '12px' }}>AUTOMATED ACTIONS PREPARED:</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem', color: '#fff' }}>
              {trip.queuedSupplierNotifications?.map((n, i) => (
                <li key={i} style={{ marginBottom: '8px' }}>
                  ✅ Alert <strong>{n.supplierName}</strong> of new arrival time
                </li>
              ))}
              <li>✅ Shift remaining activities automatically</li>
            </ul>
          </div>

          {error && <p style={{ color: '#ef4444', marginBottom: '20px' }}>{error}</p>}

          <button 
            onClick={handleExecute}
            disabled={loading}
            style={{
              width: '100%', padding: '20px', background: '#3b82f6',
              color: '#fff', border: 'none', borderRadius: '16px',
              fontSize: '1.1rem', fontWeight: '800', cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)'
            }}
          >
            {loading ? "Executing Blueprint..." : "Execute 1-Click Rebook ⚡"}
          </button>

          <p style={{ marginTop: '20px', fontSize: '0.75rem', color: '#475569' }}>
            This will update your shared plan and notify all impacted partners.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RebookingModal;
