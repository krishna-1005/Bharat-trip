import React from 'react';
import './guidancePanel.css';

const GuidancePanel = ({ 
  currentPlace, 
  nextPlace, 
  thenPlace, 
  onNext, 
  onClose,
  isLast,
  userLocation
}) => {
  if (!currentPlace) return null;

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d.toFixed(1);
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  const distToCurrent = userLocation 
    ? calculateDistance(userLocation.lat, userLocation.lng, currentPlace.lat, currentPlace.lng)
    : null;

  const distToNext = (currentPlace && nextPlace)
    ? calculateDistance(currentPlace.lat, currentPlace.lng, nextPlace.lat, nextPlace.lng)
    : null;

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
                <div className="place-meta-row">
                  {currentPlace.duration && (
                    <span className="place-meta">⏱️ {currentPlace.duration}</span>
                  )}
                  <span className="place-distance">
                    {userLocation ? `📍 You are ${distToCurrent} km away` : "📍 Location unavailable"}
                  </span>
                </div>
              </div>
            </div>

            {nextPlace && (
              <div className="guidance-step next">
                <span className="step-label">Next</span>
                <div className="step-content">
                  <span className="place-name">{nextPlace.name}</span>
                  {distToNext && (
                    <span className="place-distance-next">
                      🚗 Next stop is {distToNext} km away
                    </span>
                  )}
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
