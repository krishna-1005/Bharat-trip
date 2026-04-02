import React from "react";
import { useNavigate } from "react-router-dom";
import PlaceImage from "./PlaceImage";

const SavedMaps = ({ dbTrips, loading, handleViewTrip, formatPrice }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Discovering your journeys...</p>
      </div>
    );
  }

  if (dbTrips.length === 0) {
    return (
      <div className="pro-empty" style={{ padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)' }}>
        <div className="pro-empty-icon">🌍</div>
        <h3>The world is waiting</h3>
        <p>Your journey list is empty. Let's start planning your next masterpiece.</p>
        <button className="btn-premium primary" style={{ marginTop: '12px' }} onClick={() => navigate("/planner")}>Plan Now</button>
      </div>
    );
  }

  return (
    <div className="pro-trips-grid">
      {dbTrips.map((trip) => (
        <div className="pro-trip-card" key={trip.id} onClick={() => handleViewTrip(trip)} style={{ cursor: 'pointer' }}>
          <div className="pro-trip-img-wrap">
            <PlaceImage 
              placeName={trip.title.includes("Trip") ? trip.location : trip.title} 
              city={trip.location} 
              className="pro-trip-img" 
            />
            <div className="pro-trip-badge">{trip.days} Days</div>
          </div>
          <div className="pro-trip-body">
            <h3 className="pro-trip-title">{trip.title}</h3>
            <div className="pro-trip-meta">
              <span>📍 {trip.location}</span>
              <span>💰 {formatPrice ? formatPrice(trip.totalCost) : `₹${trip.totalCost}`}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SavedMaps;
