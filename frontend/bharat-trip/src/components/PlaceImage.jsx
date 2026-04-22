import React, { useState, useEffect } from "react";
import { getPlaceImage } from "../services/imageService";

export default function PlaceImage({ placeName, city, className, style }) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setImage(null);
    setLoading(true);

    const fetchImg = async () => {
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

  if (loading) return <div className={`image-skeleton ${className}`} style={style}></div>;

  return (
    <img 
      src={image} 
      alt={placeName} 
      className={className}
      style={style}
      onError={(e) => {
        e.target.style.display = 'none';
      }}
    />
  );
}
