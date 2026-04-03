import { useEffect } from "react";
import { useMap } from "react-leaflet";

function ResizeMap({ trigger }) {
  const map = useMap();

  useEffect(() => {
    // Give layout time to settle, then force Leaflet to recalc
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 300);

    return () => clearTimeout(timer);
  }, [map, trigger]);

  return null;
}

export default ResizeMap;