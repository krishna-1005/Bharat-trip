import { useSettings } from "../../context/SettingsContext";
import PlaceImage from "../PlaceImage";

function PlaceTooltip({ place }) {
  const { formatPrice } = useSettings();
  const price = place.estimatedCost || place.avgCost || 0;

  return (
    <div className="tooltip-card">
      <PlaceImage 
        placeName={place.name} 
        city="Bengaluru" 
        className="tooltip-img"
      />

      <div className="tooltip-content">
        <strong>{place.name}</strong>
        <span>{place.category}</span>
        <span>⏱ {place.timeHours} hrs</span>
        <span>💰 {formatPrice(price)}</span>

        {place.reviews && place.reviews.length > 0 && (
          <div className="tooltip-reviews" style={{ marginTop: '10px', borderTop: '1px solid #eee', paddingTop: '8px' }}>
            <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>Top Reviews:</div>
            {place.reviews.slice(0, 2).map((rev, idx) => (
              <div key={idx} style={{ fontSize: '10px', marginBottom: '4px', fontStyle: 'italic', color: '#666' }}>
                "{rev.comment}" — <strong>{rev.author}</strong>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PlaceTooltip;