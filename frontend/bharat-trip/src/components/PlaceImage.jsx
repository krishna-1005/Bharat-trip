import { useEffect, useState } from "react";
import { getPlaceImage } from "../services/imageService";

export default function PlaceImage({ placeName, city, className }) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    getPlaceImage(placeName, city).then(img => {
      if (mounted) {
        setImage(img);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [placeName, city]);

  if (loading) return <div className={`image-skeleton ${className}`}></div>;

  return (
    <img 
      src={image || "https://images.unsplash.com/photo-1590766940554-634a7ed41450?q=80&w=300&auto=format&fit=crop"} 
      alt={placeName} 
      className={className}
      onError={(e) => {
        e.target.src = "https://images.unsplash.com/photo-1590766940554-634a7ed41450?q=80&w=300&auto=format&fit=crop";
      }}
    />
  );
}
