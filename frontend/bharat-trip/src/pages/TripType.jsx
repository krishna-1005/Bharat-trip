import React from 'react';
import { useNavigate } from 'react-router-dom';
import './planner.css'; // Reusing planner styles for consistency

const TripType = () => {
  const navigate = useNavigate();

  return (
    <div className="planner-container" style={{ paddingTop: '100px', textAlign: 'center' }}>
      <h1 className="planner-title">Plan Your Trip</h1>
      <p className="planner-subtitle">Choose the type of journey you want to embark on</p>
      
      <div className="trip-type-grid" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '30px', 
        marginTop: '50px',
        flexWrap: 'wrap'
      }}>
        <div 
          className="pf-choice-card" 
          onClick={() => navigate('/planner')}
          style={{ 
            width: '280px', 
            height: '200px', 
            cursor: 'pointer',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <span className="pf-choice-icon" style={{ fontSize: '40px', marginBottom: '15px' }}>📍</span>
          <span className="pf-choice-label" style={{ fontSize: '20px', fontWeight: '700' }}>Single City Trip</span>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginTop: '10px' }}>
            Explore a single destination in depth with a curated itinerary.
          </p>
        </div>

        <div 
          className="pf-choice-card" 
          onClick={() => navigate('/multi-city')}
          style={{ 
            width: '280px', 
            height: '200px', 
            cursor: 'pointer',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <span className="pf-choice-icon" style={{ fontSize: '40px', marginBottom: '15px' }}>🗺️</span>
          <span className="pf-choice-label" style={{ fontSize: '20px', fontWeight: '700' }}>Multi-City Trip</span>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginTop: '10px' }}>
            Plan a journey across multiple cities and regions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TripType;
