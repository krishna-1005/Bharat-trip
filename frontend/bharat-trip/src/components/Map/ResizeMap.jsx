import { useEffect } from "react";
import { useMap } from "react-leaflet";

function ResizeMap({ trigger }) {
  const map = useMap();

  useEffect(() => {
    // Immediate recalc
    map.invalidateSize();
    
    // Delayed recalc to allow for CSS transitions and layout settling
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 500);

    // Also handle window resize events specifically
    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [map, trigger]);

  return null;
}

export default ResizeMap;