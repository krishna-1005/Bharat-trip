import { useEffect, useState } from "react";
import { getPlaceImage } from "../../services/imageService";

function PlaceTooltip({ place }) {
  const [image, setImage] = useState(null);

  useEffect(() => {
    let mounted = true;

    getPlaceImage(place.name, "Bengaluru").then(img => {
      if (mounted) setImage(img);
    });

    return () => {
      mounted = false;
    };
  }, [place.name]);

  return (
    <div className="tooltip-card">
      {image ? (
        <img src={image} alt={place.name} />
      ) : (
        <div className="image-skeleton"></div>
      )}

      <div className="tooltip-content">
        <strong>{place.name}</strong>
        <span>{place.category}</span>
        <span>⏱ {place.timeHours} hrs</span>
        <span>💰 ₹{place.avgCost}</span>
      </div>
    </div>
  );
}

export default PlaceTooltip;