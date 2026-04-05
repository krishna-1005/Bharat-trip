import { useMap } from "react-leaflet";

export function LocateControl({ setUserPosition }) {
  const map = useMap();

  const handleLocate = () => {
    map.locate().on("locationfound", (e) => {
      map.setView(e.latlng, 15);
      setUserPosition({ lat: e.latlng.lat, lng: e.latlng.lng, heading: 0 });
    });
  };

  return (
    <button 
      className="map-icon-btn locate-btn" 
      onClick={handleLocate}
      style={{
        width: '40px', 
        height: '40px', 
        borderRadius: '10px', 
        background: 'rgba(0,0,0,0.6)', 
        color: '#fff', 
        border: '1px solid #fff2', 
        fontSize: '20px', 
        cursor: 'pointer', 
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      title="Track my location"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/>
      </svg>
    </button>
  );
}
