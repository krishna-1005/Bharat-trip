import { useMap } from "react-leaflet";

function LocateControl({ setUserPosition }) {
  const map = useMap();

  const locate = () => {
    map.locate().on("locationfound", (e) => {
      map.setView(e.latlng, 14);
      setUserPosition(e.latlng);
    });
  };

  return (
    <button className="map-icon-btn" onClick={locate}>
      📍
    </button>
  );
}

export default LocateControl;