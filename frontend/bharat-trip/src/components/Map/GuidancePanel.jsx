import React from 'react';
import './guidancePanel.css';

const GuidancePanel = ({ 
  currentPlace, 
  nextPlace, 
  thenPlace, 
  onNext, 
  onClose,
  isLast 
}) => {
  if (!currentPlace) return null;

  return (
    <div className="guidance-overlay">
      <div className="guidance-top-instruction">
        Follow this plan step-by-step for a smooth trip
      </div>
      
      <div className="guidance-panel">
        <button className="guidance-close" onClick={onClose}>×</button>
        
        {isLast ? (
          <div className="guidance-completion">
            <span className="completion-emoji">🎉</span>
            <h3>Trip Completed</h3>
            <p>You've reached your last destination!</p>
          </div>
        ) : (
          <div className="guidance-flow">
            <div className="guidance-step now">
              <span className="step-label">Now</span>
              <div className="step-content">
                <span className="place-name">{currentPlace.name}</span>
                {currentPlace.duration && (
                  <span className="place-meta">⏱️ {currentPlace.duration}</span>
                )}
              </div>
            </div>

            {nextPlace && (
              <div className="guidance-step next">
                <span className="step-label">Next</span>
                <div className="step-content">
                  <span className="place-name">{nextPlace.name}</span>
                </div>
              </div>
            )}

            {thenPlace && (
              <div className="guidance-step then">
                <span className="step-label">Then</span>
                <div className="step-content">
                  <span className="place-name">{thenPlace.name}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {!isLast && (
          <button className="guidance-next-btn" onClick={onNext}>
            Go to Next Location
            <span className="btn-arrow">→</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default GuidancePanel;
