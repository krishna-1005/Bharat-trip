import React from 'react';
import './guidancePanel.css';
import PlaceImage from '../PlaceImage';

const GuidancePanel = ({ 
  currentPlace, 
  nextPlace, 
  onNext, 
  isLast,
  userLocation,
  currentIndex,
  totalPlaces
}) => {
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  const distToCurrent = userLocation 
    ? calculateDistance(userLocation.lat, userLocation.lng, currentPlace?.lat, currentPlace?.lng)
    : null;

  if (!currentPlace) return null;

  return (
    <div className="guidance-container">
      <div className="guidance-card">
        {isLast ? (
          <div className="completion-state">
            <div className="completion-icon">🎉</div>
            <h3>Trip Complete</h3>
            <p>You've successfully visited all destinations.</p>
            <button className="action-btn" onClick={() => window.location.reload()}>
              Plan New Trip
            </button>
          </div>
        ) : (
          <>
            {/* Hero Image Section */}
            <div className="hero-image-container">
              <PlaceImage 
                placeName={currentPlace.name} 
                city={currentPlace.city || "Bangalore"} 
                className="hero-image" 
              />
              <div className="hero-overlay"></div>
              <div className="step-indicator">Step {currentIndex + 1} of {totalPlaces}</div>
            </div>

            <div className="card-body">
              {/* Now Section */}
              <div className="now-section">
                <span className="now-label">Visiting Now</span>
                <h2 className="current-title">{currentPlace.name}</h2>
                <div className="current-meta">
                  <div className="meta-item">📍 {distToCurrent || "0.0"} km away</div>
                  {currentPlace.rating && <div className="meta-item">⭐ {currentPlace.rating}</div>}
                </div>
              </div>

              {/* Next Preview */}
              {nextPlace && (
                <div className="next-preview">
                  <div className="next-dot"></div>
                  <div className="next-info">
                    <span className="next-label">Up Next</span>
                    <p className="next-title">{nextPlace.name}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <button className="action-btn" onClick={onNext}>
                Arrived & Continue 
                <span style={{marginLeft: 'auto'}}>→</span>
              </button>
              
              <button className="secondary-action" onClick={onNext}>
                Skip this stop
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GuidancePanel;
