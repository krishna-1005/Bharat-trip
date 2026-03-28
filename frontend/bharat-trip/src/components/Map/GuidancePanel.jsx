import React from 'react';
import './guidancePanel.css';

const GuidancePanel = ({ 
  currentPlace, 
  nextPlace, 
  thenPlace, 
  onNext, 
  isLast,
  userLocation,
  currentIndex,
  totalPlaces
}) => {
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
        Trip Assistant: Step {currentIndex + 1} of {totalPlaces}
      </div>

      <div className="guidance-panel">
        <div className="guidance-progress-mini">
           <div className="progress-fill" style={{ width: `${((currentIndex + 1) / totalPlaces) * 100}%` }}></div>
        </div>
        
        {isLast ? (
          <div className="guidance-completion">
            <span className="completion-emoji">🎉</span>
            <h3>Destination Reached!</h3>
            <p>You've completed your trip itinerary.</p>
          </div>
        ) : (
          <div className="guidance-flow">
            <div className="guidance-step now">
              <span className="step-label">Visit Now</span>
              <div className="step-content">
                <span className="place-name">{currentPlace.name}</span>        
                <div className="place-meta-row">
                  <span className="place-distance">
                    {userLocation ? `📍 ${distToCurrent} km from you` : "📍 Calculating distance..."}
                  </span>
                </div>
              </div>
            </div>

            {nextPlace && (
              <div className="guidance-step next">
                <span className="step-label">Next Up</span>
                <div className="step-content">
                  <span className="place-name">{nextPlace.name}</span>
                  {distToNext && (
                    <span className="place-distance-next">
                      🚗 {distToNext} km from current stop
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {!isLast && (
          <button className="guidance-next-btn" onClick={onNext}>
            Mark as Visited & Continue
            <span className="btn-arrow">→</span>
          </button>
        )}
      </div>
    </div>
  );
};


export default GuidancePanel;
