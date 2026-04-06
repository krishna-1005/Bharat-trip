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
import { LocateControl } from "./LocateControl";
import { useSettings } from "../../context/SettingsContext";
import Haptics from "../../utils/haptics";

import { DAY_COLORS } from "../../constants/dayColors";

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

function MapActions({ setUserLocation }) {
  const map = useMap();
  return (
    <div className="map-zoom-controls" style={{ 
      position: 'absolute', right: '20px', top: '50%', 
      transform: 'translateY(-50%)', zIndex: 1000, 
      display: 'flex', flexDirection: 'column', gap: '10px' 
    }}>
      <button onClick={() => map.zoomIn()} style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: '1px solid #fff2', fontSize: '20px', cursor: 'pointer', backdropFilter: 'blur(10px)' }}>+</button>
      <button onClick={() => map.zoomOut()} style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: '1px solid #fff2', fontSize: '20px', cursor: 'pointer', backdropFilter: 'blur(10px)' }}>−</button>
      <div style={{ marginTop: '10px' }}>
        <LocateControl setUserPosition={setUserLocation} />
      </div>
    </div>
  );
}

/**
 * Handles smooth 'Fly-To' transitions when a place is selected.
 */
function FlyToHandler({ activePlace }) {
  const map = useMap();

  useEffect(() => {
    if (!activePlace || !activePlace.lat || !activePlace.lng) return;

    const latLng = [parseFloat(activePlace.lat), parseFloat(activePlace.lng)];
    const zoomLevel = map.getZoom() < 14 ? 16 : map.getZoom();

    // Leaflet flyTo with premium animation settings
    map.flyTo(latLng, zoomLevel, {
      duration: 1.8, // Smooth 1.8s flight
      easeLinearity: 0.25,
      noMoveStart: true
    });

    // Trigger haptic feedback once animation finishes
    map.once("moveend", () => {
      Haptics.light();
    });

    // If user interacts during flight, Leaflet automatically cancels the animation.
  }, [activePlace, map]);

  return null;
}

/**
 * Manages map view changes and bounds fitting.
 * Combined into one component to ensure sequential updates and shared safety logic.
 */
function MapController({ center, places, userLocation, selectedDayIdx }) {
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
    let bounds = [];
    
    // If a specific day is selected, only fit to those places
    if (selectedDayIdx !== null && selectedDayIdx !== undefined) {
      const dayPlaces = places.filter(p => p.dayIdx === selectedDayIdx);
      if (dayPlaces.length > 0) {
        bounds = dayPlaces.map(p => getSafeLatLng(p.lat, p.lng)).filter(pos => pos !== null);
      }
    }

    // Fallback to all places if no day selected or day has no places
    if (bounds.length === 0) {
      places.forEach(p => {
        const pos = getSafeLatLng(p.lat, p.lng);
        if (pos) bounds.push(pos);
      });
    }

    if (userLocation && (selectedDayIdx === null || selectedDayIdx === undefined)) {
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
  }, [map, center, places, userLocation, selectedDayIdx]);

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

/**
 * Handles smooth tile transition when theme changes.
 * Uses a cross-fade approach by toggling opacity on layer change.
 */
function TileThemeController({ theme, tileUrls }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    
    // Add a transition class to the map container for smooth fading
    const container = map.getContainer();
    container.style.transition = 'filter 0.5s ease-in-out';
    
    // Slight brightness dip during swap to hide tile reloading if any
    container.style.filter = 'brightness(0.8)';
    setTimeout(() => {
      container.style.filter = 'brightness(1)';
    }, 500);
  }, [theme, map]);

  return (
    <TileLayer
      key={theme} // Key ensures React-Leaflet remounts the layer on theme change
      url={tileUrls[theme]}
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      opacity={1}
    />
  );
}

// ── MAIN COMPONENT ──

function MapView({ plan, currentIndex, userLocation, setUserLocation, activePlace, onHover, selectedDayIdx }) {
  const { theme, setTheme } = useSettings();

  // 1. Auto-dark mode logic (Bonus: past 7:00 PM)
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 19 || hour < 6) {
      if (theme !== 'dark') setTheme('dark');
    }
  }, []); // Only check on mount to avoid fighting user manual toggle

  // 2. Tile URLs
  const TILE_URLS = {
    dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    light: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
  };

  // 3. Process places with strict validation and day context
  const allPlacesWithDay = useMemo(() => {
    if (!plan?.itinerary) return [];
    const days = Array.isArray(plan.itinerary) ? plan.itinerary : Object.values(plan.itinerary);
    return days
      .filter(d => d && (d.places || d.length))
      .flatMap((d, dayIdx) => {
        const places = d.places || (Array.isArray(d) ? d : []);
        return places.map(p => ({ ...p, dayIdx }));
      })
      .filter(p => p && getSafeLatLng(p.lat, p.lng) !== null);
  }, [plan]);

  // 2. Determine safe initial center
  const initialCenter = useMemo(() => {
    const planCoords = getSafeLatLng(plan?.coordinates?.lat, plan?.coordinates?.lng);
    if (planCoords) return planCoords;

    if (allPlacesWithDay.length > 0) {
      const first = getSafeLatLng(allPlacesWithDay[0].lat, allPlacesWithDay[0].lng);
      if (first) return first;
    }

    return [12.9716, 77.5946]; // Fallback to Bangalore
  }, [plan, allPlacesWithDay]);

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
        <TileThemeController theme={theme} tileUrls={TILE_URLS} />

        <MapController center={safeInitialCenter} places={allPlacesWithDay} userLocation={userLocation} selectedDayIdx={selectedDayIdx} />
        <FlyToHandler activePlace={activePlace} />
        <ResizeMap trigger={activePlace} />
        <MapActions setUserLocation={setUserLocation} />
        <SafePolyline places={allPlacesWithDay} />

        {/* Markers */}
        {allPlacesWithDay.map((p, i) => {
          const pos = getSafeLatLng(p.lat, p.lng);
          if (!pos) return null;

          const isVisited = i < currentIndex;
          const isCurrent = i === currentIndex;
          const isActive = activePlace && activePlace.name === p.name;
          const isHighlighted = isActive || isCurrent;
          const dayColor = DAY_COLORS[p.dayIdx % DAY_COLORS.length];
          
          return (
            <Marker
              key={`${p.name}-${i}`}
              position={pos}
              icon={createLocationIcon(isHighlighted ? "#fff" : dayColor, isHighlighted, isVisited, theme)}
              eventHandlers={{
                mouseover: () => onHover?.(p),
                mouseout: () => onHover?.(null)
              }}
            >
              <Tooltip direction="top">{p.name} (Day {p.dayIdx + 1})</Tooltip>
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