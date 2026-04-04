import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Tooltip,
  useMap
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./markerIcons.css";
import "../../utils/fixLeafletIcons";
import { useState, useEffect, useMemo, Fragment } from "react";
import { createLocationIcon } from "./markerIcons";
import MapLegend from "./MapLegend";
import ResizeMap from "./ResizeMap";
import { DAY_COLORS } from "../../constants/dayColors";
import L from "leaflet";

// Create a special icon for user location with heading support
const createUserIcon = (heading) => L.divIcon({
  className: "custom-pin-container",
  html: `
    <div class="user-location-wrapper">
      <div class="user-heading-arrow" style="transform: rotate(${heading || 0}deg); display: ${heading !== null ? 'block' : 'none'};"></div>
      <div class="user-pulse"></div>
      <div class="user-dot-main"></div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

function ZoomControls() {
  const map = useMap();
  return (
    <div className="map-zoom-controls" style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <button onClick={() => map.zoomIn()} style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: '1px solid #fff2', fontSize: '20px', cursor: 'pointer', backdropFilter: 'blur(10px)' }}>+</button>
      <button onClick={() => map.zoomOut()} style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: '1px solid #fff2', fontSize: '20px', cursor: 'pointer', backdropFilter: 'blur(10px)' }}>−</button>
    </div>
  );
}

function FitBounds({ places, userLocation }) {
  const map = useMap();
  useEffect(() => {
    if (!places.length && !userLocation) return;
    const bounds = [];
    places.forEach(p => {
      const lat = Number(p.lat);
      const lng = Number(p.lng);
      if (!isNaN(lat) && !isNaN(lng)) bounds.push([lat, lng]);
    });
    if (userLocation && !isNaN(userLocation.lat) && !isNaN(userLocation.lng)) {
      bounds.push([userLocation.lat, userLocation.lng]);
    }
    if (bounds.length > 0) {
      try { map.fitBounds(bounds, { padding: [50, 50] }); } catch (err) {}
    }
  }, [places, userLocation, map]);
  return null;
}

function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && Array.isArray(center) && !isNaN(center[0]) && !isNaN(center[1])) {
      try { map.setView(center, map.getZoom()); } catch (err) {}
    }
  }, [center, map]);
  return null;
}

function MapView({ plan, currentIndex, userLocation, isTracking, activePlace, onHover }) {
  const allPlaces = useMemo(() => {
    if (!plan?.itinerary) return [];
    const days = Array.isArray(plan.itinerary) ? plan.itinerary : Object.values(plan.itinerary);
    return days.flatMap(d => d.places || []).filter(p => p && !isNaN(Number(p.lat)) && !isNaN(Number(p.lng)));
  }, [plan]);

  const initialCenter = useMemo(() => {
    if (plan?.coordinates && !isNaN(Number(plan.coordinates.lat)) && !isNaN(Number(plan.coordinates.lng))) {
      return [Number(plan.coordinates.lat), Number(plan.coordinates.lng)];
    }
    if (allPlaces.length > 0) return [Number(allPlaces[0].lat), Number(allPlaces[0].lng)];
    return [12.9716, 77.5946]; // Bangalore
  }, [plan, allPlaces]);

  // FINAL SAFETY CHECK
  const safeInitialCenter = initialCenter.map(n => isNaN(n) ? 0 : n);
  if (safeInitialCenter[0] === 0) safeInitialCenter[0] = 12.9716;
  if (safeInitialCenter[1] === 0) safeInitialCenter[1] = 77.5946;

  return (
    <div className="map-container" style={{ height: '100%', width: '100%' }}>
      <MapContainer
        key={`${safeInitialCenter[0]}-${safeInitialCenter[1]}`}
        center={safeInitialCenter}
        zoom={12}
        zoomControl={false}
        style={{ height: '100%', width: '100%' }}
      >
        <ChangeView center={safeInitialCenter} />
        <FitBounds places={allPlaces} userLocation={userLocation} />
        <ResizeMap trigger={activePlace} />
        
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        <ZoomControls />

        {allPlaces.map((p, i) => {
          const isVisited = i < currentIndex;
          const isCurrent = i === currentIndex;
          return (
            <Marker
              key={`${p.name}-${i}`}
              position={[Number(p.lat), Number(p.lng)]}
              icon={createLocationIcon(isCurrent ? "#3b82f6" : "#64748b", isCurrent, isVisited)}
              eventHandlers={{
                mouseover: () => onHover?.(p),
                mouseout: () => onHover?.(null)
              }}
            />
          );
        })}

        {currentIndex < allPlaces.length - 1 && (
          <Polyline 
            positions={allPlaces.map(p => [Number(p.lat), Number(p.lng)])}
            pathOptions={{ color: '#3b82f6', weight: 3, dashArray: '5, 10', opacity: 0.5 }}
          />
        )}

        {userLocation && !isNaN(userLocation.lat) && !isNaN(userLocation.lng) && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={createUserIcon(userLocation.heading)}>
            <Tooltip direction="top">You are here</Tooltip>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}

export default MapView;
