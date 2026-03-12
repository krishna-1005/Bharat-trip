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
      </div>
    </div>
  );
}

export default PlaceTooltip;