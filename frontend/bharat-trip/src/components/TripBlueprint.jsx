import React from 'react';
import { motion } from 'framer-motion';
import { toggleChecklistItem } from '../services/tripRoomService';
import '../styles/tripBlueprint.css';

const TripBlueprint = ({ roomId, roomData }) => {
  if (!roomData || !roomData.blueprint) return null;

  const { blueprint } = roomData;
  const { destination, budget, itinerary, checklist, generatedAt } = blueprint;

  const handleToggle = async (itemId, completed) => {
    await toggleChecklistItem(roomId, itemId, completed);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="blueprint-document"
    >
      <header className="blueprint-header">
        <div className="blueprint-badge">OFFICIAL TRIP BLUEPRINT</div>
        <h1>{destination} Expedition</h1>
        <p className="blueprint-meta">
          Generated on {generatedAt?.toDate ? new Date(generatedAt.toDate()).toLocaleDateString() : 'Just now'} • Room #{roomId.slice(-6)}
        </p>
      </header>

      <div className="blueprint-grid">
        {/* Summary Section */}
        <section className="blueprint-section summary">
          <h3><span className="icon">📋</span> Trip Summary</h3>
          <div className="blueprint-card">
            <div className="summary-item">
              <span className="label">Destination</span>
              <span className="value">{destination}</span>
            </div>
            <div className="summary-item">
              <span className="label">Group Size</span>
              <span className="value">{roomData.members?.length} Members</span>
            </div>
            <div className="summary-item">
              <span className="label">Status</span>
              <span className="value status-locked">LOCKED & READY</span>
            </div>
          </div>
        </section>

        {/* Budget Section */}
        <section className="blueprint-section budget">
          <h3><span className="icon">💰</span> Budget Overview</h3>
          <div className="blueprint-card premium">
            <div className="budget-main">
              <span className="label">Total Estimated Budget</span>
              <span className="value">₹{Number(budget).toLocaleString()}</span>
            </div>
            <p className="budget-hint">Includes accommodation, local travel, and food estimates.</p>
          </div>
        </section>

        {/* Itinerary Section */}
        <section className="blueprint-section itinerary">
          <h3><span className="icon">📍</span> Day-wise Execution</h3>
          <div className="itinerary-timeline">
            {itinerary && itinerary.map((day, idx) => (
              <div key={idx} className="timeline-item">
                <div className="day-number">Day {idx + 1}</div>
                <div className="day-content">
                  <h4>{day.title || `Exploring ${destination}`}</h4>
                  <p>{day.activities || day.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Checklist Section */}
        <section className="blueprint-section checklist">
          <h3><span className="icon">✅</span> Execution Checklist</h3>
          <div className="blueprint-card">
            {checklist?.map(item => (
              <label key={item.id} className={`checklist-item ${item.completed ? 'done' : ''}`}>
                <input 
                  type="checkbox" 
                  checked={item.completed} 
                  onChange={(e) => handleToggle(item.id, e.target.checked)}
                />
                <span className="task-text">{item.task}</span>
                {item.completed && <span className="check-mark">✓</span>}
              </label>
            ))}
          </div>
        </section>
      </div>

      <footer className="blueprint-footer">
        <button className="btn-blueprint primary" onClick={() => window.print()}>
          Download as PDF 📄
        </button>
        <button className="btn-blueprint outline" onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert("Blueprint link copied! 🔗");
        }}>
          Share Blueprint 🔗
        </button>
      </footer>
    </motion.div>
  );
};

export default TripBlueprint;
