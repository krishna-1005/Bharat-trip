import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PlaceImage from './PlaceImage';
import Haptics from '../utils/haptics';
import './itinerarySlider.css';

const ItinerarySlider = ({ itinerary, onDayChange, planCity, formatPrice, currentIndex, handleVisited, guideMode, setRideModalConfig }) => {
  const scrollRef = useRef(null);
  const [activeDayIdx, setActiveDayIdx] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current) return;
      const scrollLeft = scrollRef.current.scrollLeft;
      const width = scrollRef.current.offsetWidth;
      if (width === 0) return;
      
      const newIdx = Math.round(scrollLeft / width);
      if (newIdx !== activeDayIdx && newIdx >= 0 && newIdx < itinerary.length) {
        setActiveDayIdx(newIdx);
        onDayChange(newIdx);
      }
    };

    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    }
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, [activeDayIdx, onDayChange, itinerary.length]);

  // We need to calculate global indices for each place to match the parent's logic
  let stopCounter = 0;
  const daysWithGlobalIndices = itinerary.map(day => {
    const placesWithIndices = (day.places || []).map(place => ({
      ...place,
      globalIdx: stopCounter++
    }));
    return { ...day, places: placesWithIndices };
  });

  return (
    <div className="itinerary-slider-wrapper">
      <div className="itinerary-slider-container" ref={scrollRef}>
        {daysWithGlobalIndices.map((day, dIdx) => (
          <div key={dIdx} className="day-slide-card">
            <div className="day-card-inner">
              <div className="day-slide-header">
                <div className="day-badge-v4">DAY {dIdx + 1}</div>
                <h3 className="day-slide-title">
                    {day.title || day.label || 'Exploration'}
                </h3>
              </div>
              
              <div className="day-slide-scroll-area">
                {day.places.map((place) => {
                  const isActive = place.globalIdx === currentIndex;
                  const isVisited = place.globalIdx < currentIndex;
                  
                  return (
                    <motion.div 
                      key={place.globalIdx} 
                      className={`slider-stop-card-v4 ${isActive ? 'active' : ''} ${isVisited ? 'visited' : ''}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="stop-card-top">
                        <div className="stop-img-container">
                          <PlaceImage placeName={place.name} city={planCity} className="slider-stop-img-v4" />
                          {isVisited && <div className="visited-overlay-v4">✓</div>}
                        </div>
                        <div className="stop-card-main-info">
                          <div className="stop-tag-v4">{place.category}</div>
                          <h4 className="stop-name-v4">{place.name}</h4>
                          <div className="stop-meta-v4">
                            <span>🕒 {place.timeHours || 2}h</span>
                            <span>💰 {formatPrice(place.estimatedCost || 0)}</span>
                          </div>
                        </div>
                      </div>

                      <p className="stop-reason-v4">
                        {guideMode && isActive ? (
                          <span className="guide-insight-v4">✨ {place.reason}</span>
                        ) : place.reason}
                      </p>

                      <div className="stop-card-actions-v4">
                        <button 
                          className="slider-action-btn track-btn"
                          onClick={() => {
                            Haptics.light();
                            window.open(`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`, '_blank');
                          }}
                        >
                          🛰️ Track
                        </button>
                        <button 
                          className="slider-action-btn ride-btn"
                          onClick={() => {
                            Haptics.light();
                            setRideModalConfig({ isOpen: true, destination: place });
                          }}
                        >
                          🚗 Ride
                        </button>
                        {isActive && (
                          <button 
                            className="slider-action-btn done-btn" 
                            onClick={() => handleVisited(place.globalIdx)}
                          >
                            Mark Done
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
                {day.places.length === 0 && (
                   <div className="empty-day-msg">No activities planned for this day.</div>
                )}
                <div className="scroll-spacer"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="slider-nav-dots">
        {itinerary.map((_, i) => (
          <div 
            key={i} 
            className={`nav-dot-v4 ${i === activeDayIdx ? 'active' : ''}`}
            onClick={() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollTo({
                        left: i * scrollRef.current.offsetWidth,
                        behavior: 'smooth'
                    });
                }
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ItinerarySlider;
