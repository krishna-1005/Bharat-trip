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
    if (!places || (!places.length && !userLocation)) return;
    const bounds = [];
    places.forEach(p => {
      if (!p) return;
      const lat = Number(p.lat);
      const lng = Number(p.lng);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        bounds.push([lat, lng]);
      }
    });
    if (userLocation && Number.isFinite(Number(userLocation.lat)) && Number.isFinite(Number(userLocation.lng))) {
      bounds.push([Number(userLocation.lat), Number(userLocation.lng)]);
    }
    if (bounds.length > 0) {
      try { 
        map.fitBounds(bounds, { padding: [50, 50] }); 
      } catch (err) {
        console.warn("FitBounds failed:", err);
      }
    }
  }, [places, userLocation, map]);
  return null;
}

function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && Array.isArray(center) && Number.isFinite(center[0]) && Number.isFinite(center[1])) {
      try { 
        map.setView(center, map.getZoom() || 12); 
      } catch (err) {
        console.warn("SetView failed:", err);
      }
    }
  }, [center, map]);
  return null;
}

function MapView({ plan, currentIndex, userLocation, isTracking, activePlace, onHover }) {
  const allPlaces = useMemo(() => {
    if (!plan?.itinerary) return [];
    const days = Array.isArray(plan.itinerary) ? plan.itinerary : Object.values(plan.itinerary);
    return days
      .filter(d => d && (d.places || d.length)) // Handle both day objects and direct place arrays
      .flatMap(d => d.places || (Array.isArray(d) ? d : []))
      .filter(p => p && Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lng)));
  }, [plan]);

  const initialCenter = useMemo(() => {
    if (plan?.coordinates && Number.isFinite(Number(plan.coordinates.lat)) && Number.isFinite(Number(plan.coordinates.lng))) {
      return [Number(plan.coordinates.lat), Number(plan.coordinates.lng)];
    }
    if (allPlaces.length > 0) {
      const first = allPlaces[0];
      return [Number(first.lat), Number(first.lng)];
    }
    return [12.9716, 77.5946]; // Bangalore fallback
  }, [plan, allPlaces]);

  // FINAL SAFETY CHECK
  const safeInitialCenter = initialCenter.map(n => (n === null || !Number.isFinite(n)) ? 0 : n);
  if (safeInitialCenter[0] === 0) safeInitialCenter[0] = 12.9716;
  if (safeInitialCenter[1] === 0) safeInitialCenter[1] = 77.5946;

  useEffect(() => {
    if (allPlaces.length === 0 && plan) {
      console.warn("MapView: No valid places found in itinerary", plan.itinerary);
    }
  }, [allPlaces, plan]);

  return (
    <div className="map-container" style={{ height: '100%', width: '100%' }}>
      <MapContainer
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

        {userLocation && Number.isFinite(Number(userLocation.lat)) && Number.isFinite(Number(userLocation.lng)) && (
          <Marker position={[Number(userLocation.lat), Number(userLocation.lng)]} icon={createUserIcon(userLocation.heading)}>
            <Tooltip direction="top">You are here</Tooltip>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}

export default MapView;
