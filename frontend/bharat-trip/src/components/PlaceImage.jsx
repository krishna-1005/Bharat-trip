import { useEffect, useState } from "react";
import { getPlaceImage } from "../services/imageService";

export default function PlaceImage({ placeName, city, className }) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchImg = async () => {
      setLoading(true);
      const img = await getPlaceImage(placeName, city);
      if (mounted) {
        setImage(img);
        setLoading(false);
      }
    };
    fetchImg();

    return () => {
      mounted = false;
    };
  }, [placeName, city]);

  const getFallbackImage = () => {
    // Return a city-specific fallback or a generic India one
    const cityFallbacks = {
      "Jaipur": "https://images.unsplash.com/photo-1477584264176-507e81e7f4f5?q=80&w=400",
      "Mumbai": "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?q=80&w=400",
      "Delhi": "https://images.unsplash.com/photo-1587474260584-1f3c8b4a339a?q=80&w=400",
      "Goa": "https://images.unsplash.com/photo-1512783558244-78c7d75a85ee?q=80&w=400",
      "Bengaluru": "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=400"
    };
    return cityFallbacks[city] || "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=400"; // Default India
  };

  if (loading) return <div className={`image-skeleton ${className}`}></div>;

  return (
    <img 
      src={image || getFallbackImage()} 
      alt={placeName} 
      className={className}
      onError={(e) => {
        e.target.src = getFallbackImage();
      }}
    />
  );
}
