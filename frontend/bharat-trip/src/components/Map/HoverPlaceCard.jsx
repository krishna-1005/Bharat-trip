import React from "react";
import PlaceImage from "../PlaceImage";
import { useSettings } from "../../context/SettingsContext";

function HoverPlaceCard({ place, city }) {
  const { formatPrice } = useSettings();
  if (!place) return null;

  return (
    <div className="hover-place-card">
      <div className="hover-card-header">
        <PlaceImage 
          placeName={place.name} 
          city={city || "Bengaluru"} 
          className="hover-card-img" 
        />
        <div className="hover-card-title-section">
          <span className="hover-card-category">{place.category || "Sightseeing"}</span>
          <h3>{place.name}</h3>
        </div>
      </div>

      <div className="hover-card-body">
        <div className="hover-card-meta">
          <div className="meta-item">
            <span className="meta-icon">💰</span>
            <span>{place.avgCost > 0 ? formatPrice(place.avgCost) : 'Free Entry'}</span>
          </div>
          <div className="meta-item">
            <span className="meta-icon">⏱️</span>
            <span>{place.timeHours || 2} Hours</span>
          </div>
        </div>

        <div className="hover-card-reviews">
          <h4>
            <span className="stars">⭐</span>
            Verified Reviews
          </h4>
          <div className="reviews-list">
            {place.reviews && place.reviews.length > 0 ? (
              place.reviews.map((rev, idx) => (
                <div key={idx} className="review-item">
                  <div className="review-header">
                    <span className="review-author">{rev.author}</span>
                    <span className="review-rating">{"⭐".repeat(rev.rating)}</span>
                  </div>
                  <p className="review-comment">"{rev.comment}"</p>
                </div>
              ))
            ) : (
              <div className="review-item empty">
                <p className="review-comment">No recent reviews found for this location.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HoverPlaceCard;
