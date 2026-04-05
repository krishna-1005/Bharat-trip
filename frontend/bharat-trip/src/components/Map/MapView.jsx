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
import { useEffect, useMemo, useState } from "react";
import { createLocationIcon } from "./markerIcons";
import ResizeMap from "./ResizeMap";
import L from "leaflet";

// ── HELPERS ──

/**
 * Validates coordinates and returns a safe [lat, lng] array or null.
 * Strictly prevents NaN or non-numeric values from leaking to Leaflet.
 */
const getSafeLatLng = (lat, lng) => {
  const nLat = parseFloat(lat);
  const nLng = parseFloat(lng);
  if (Number.isFinite(nLat) && Number.isFinite(nLng)) {
    return [nLat, nLng];
  }
  return null;
};

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

// ── SUB-COMPONENTS ──

function ZoomControls() {
  const map = useMap();
  return (
    <div className="map-zoom-controls" style={{ 
      position: 'absolute', right: '20px', top: '50%', 
      transform: 'translateY(-50%)', zIndex: 1000, 
      display: 'flex', flexDirection: 'column', gap: '10px' 
    }}>
      <button onClick={() => map.zoomIn()} style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: '1px solid #fff2', fontSize: '20px', cursor: 'pointer', backdropFilter: 'blur(10px)' }}>+</button>
      <button onClick={() => map.zoomOut()} style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: '1px solid #fff2', fontSize: '20px', cursor: 'pointer', backdropFilter: 'blur(10px)' }}>−</button>
    </div>
  );
}

/**
 * Manages map view changes and bounds fitting.
 * Combined into one component to ensure sequential updates and shared safety logic.
 */
function MapController({ center, places, userLocation }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // 1. Handle Center Update
    const validCenter = getSafeLatLng(center?.[0], center?.[1]);
    if (validCenter) {
      try {
        // Use LatLng object explicitly for maximum compatibility
        const latLng = L.latLng(validCenter[0], validCenter[1]);
        const currentZoom = map.getZoom();
        map.setView(latLng, Number.isFinite(currentZoom) ? currentZoom : 12);
      } catch (err) {
        console.warn("MapController: setView failed", err);
      }
    }

    // 2. Handle Bounds Fitting
    const bounds = [];
    places.forEach(p => {
      const pos = getSafeLatLng(p.lat, p.lng);
      if (pos) bounds.push(pos);
    });

    if (userLocation) {
      const uPos = getSafeLatLng(userLocation.lat, userLocation.lng);
      if (uPos) bounds.push(uPos);
    }

    if (bounds.length > 0) {
      try {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      } catch (err) {
        console.warn("MapController: fitBounds failed", err);
      }
    }
  }, [map, center, places, userLocation]);

  return null;
}

function SafePolyline({ places }) {
  const positions = useMemo(() => {
    return places
      .map(p => getSafeLatLng(p.lat, p.lng))
      .filter(pos => pos !== null);
  }, [places]);

  if (positions.length < 2) return null;

  return (
    <Polyline 
      key={`route-line-${positions.length}`} // Key helps Leaflet cleanup old paths
      positions={positions}
      pathOptions={{ color: '#3b82f6', weight: 3, dashArray: '5, 10', opacity: 0.5 }}
    />
  );
}

// ── MAIN COMPONENT ──

function MapView({ plan, currentIndex, userLocation, activePlace, onHover }) {
  // 1. Process places with strict validation
  const allPlaces = useMemo(() => {
    if (!plan?.itinerary) return [];
    const days = Array.isArray(plan.itinerary) ? plan.itinerary : Object.values(plan.itinerary);
    return days
      .filter(d => d && (d.places || d.length))
      .flatMap(d => d.places || (Array.isArray(d) ? d : []))
      .filter(p => p && getSafeLatLng(p.lat, p.lng) !== null);
  }, [plan]);

  // 2. Determine safe initial center
  const initialCenter = useMemo(() => {
    const planCoords = getSafeLatLng(plan?.coordinates?.lat, plan?.coordinates?.lng);
    if (planCoords) return planCoords;

    if (allPlaces.length > 0) {
      const first = getSafeLatLng(allPlaces[0].lat, allPlaces[0].lng);
      if (first) return first;
    }

    return [12.9716, 77.5946]; // Fallback to Bangalore
  }, [plan, allPlaces]);

  // Final sanity check for MapContainer (Must never be NaN)
  const safeInitialCenter = [
    Number.isFinite(initialCenter[0]) ? initialCenter[0] : 12.9716,
    Number.isFinite(initialCenter[1]) ? initialCenter[1] : 77.5946
  ];

  return (
    <div className="map-container" style={{ height: '100%', width: '100%', position: 'relative' }}>
      <MapContainer
        center={safeInitialCenter}
        zoom={12}
        zoomControl={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        <MapController center={safeInitialCenter} places={allPlaces} userLocation={userLocation} />
        <ResizeMap trigger={activePlace} />
        <ZoomControls />
        <SafePolyline places={allPlaces} />

        {/* Markers */}
        {allPlaces.map((p, i) => {
          const pos = getSafeLatLng(p.lat, p.lng);
          if (!pos) return null;

          const isVisited = i < currentIndex;
          const isCurrent = i === currentIndex;
          
          return (
            <Marker
              key={`${p.name}-${i}`}
              position={pos}
              icon={createLocationIcon(isCurrent ? "#3b82f6" : "#64748b", isCurrent, isVisited)}
              eventHandlers={{
                mouseover: () => onHover?.(p),
                mouseout: () => onHover?.(null)
              }}
            >
              <Tooltip direction="top">{p.name}</Tooltip>
            </Marker>
          );
        })}

        {/* User Location */}
        {userLocation && (
          (() => {
            const uPos = getSafeLatLng(userLocation.lat, userLocation.lng);
            if (!uPos) return null;
            return (
              <Marker position={uPos} icon={createUserIcon(userLocation.heading)}>
                <Tooltip direction="top">You are here</Tooltip>
              </Marker>
            );
          })()
        )}
      </MapContainer>
    </div>
  );
}

export default MapView;