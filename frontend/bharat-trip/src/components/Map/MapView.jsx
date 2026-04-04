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
import PlaceTooltip from "./PlaceTooltip";
import HoverPlaceCard from "./HoverPlaceCard";
import PlaceImage from "../PlaceImage";
import L from "leaflet";
import GuidancePanel from "./GuidancePanel";

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

/* ---------- ZOOM CONTROLS ---------- */
function ZoomControls({ onToggleGuidance, isGuidanceMode }) {
  const map = useMap();

  return (
    <div className="map-zoom-controls">
      <button onClick={() => map.zoomIn()} title="Zoom In">+</button>
      <button onClick={() => map.zoomOut()} title="Zoom Out">−</button>
      <button 
        onClick={onToggleGuidance} 
        className={isGuidanceMode ? "active" : ""}
        title={isGuidanceMode ? "Exit Guidance" : "Start Guidance"}
        style={{ marginTop: '8px', fontSize: '18px' }}
      >
        {isGuidanceMode ? "⏹️" : "🧭"}
      </button>
    </div>
  );
}

function FitBounds({ places, userLocation, activePlace }) {
  const map = useMap();

  useEffect(() => {
    if (activePlace && !isNaN(activePlace.lat) && !isNaN(activePlace.lng)) {
      map.setView([Number(activePlace.lat), Number(activePlace.lng)], 15, { animate: true });
      return;
    }

    if (!places.length && !userLocation) return;

    const bounds = [];

    places.forEach(p => {
      if (p.lat !== undefined && p.lng !== undefined && !isNaN(p.lat) && !isNaN(p.lng) && p.lat !== null && p.lng !== null) {
        bounds.push([Number(p.lat), Number(p.lng)]);
      }
    });

    if (userLocation && !isNaN(userLocation.lat) && !isNaN(userLocation.lng)) {
      bounds.push([Number(userLocation.lat), Number(userLocation.lng)]);
    }

    if (bounds.length > 0) {
      try {
        map.fitBounds(bounds, { padding: [80, 80] });
      } catch (err) {
        console.warn("Could not fit map bounds:", err);
      }
    }

  }, [places, userLocation, map, activePlace]);

  return null;
}

function FollowUser({ location }) {
  const map = useMap();
  useEffect(() => {
    if (location && !isNaN(location.lat) && !isNaN(location.lng)) {
      map.setView([location.lat, location.lng], map.getZoom(), { animate: true });
    }
  }, [location, map]);
  return null;
}

function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && Array.isArray(center) && !isNaN(center[0]) && !isNaN(center[1])) {
      try {
        map.setView(center, map.getZoom());
      } catch (err) {
        console.warn("Error setting map view:", err);
      }
    }
  }, [center, map]);
  return null;
}

function MapView({ plan, isTracking, onHover, isGuidanceMode, setIsGuidanceMode, currentIndex, setCurrentIndex, userLocation, activePlace }) {
  const [activeDay, setActiveDay] = useState("all");
  const [pathHistory, setPathHistory] = useState([]);
  const [roadRoute, setRoadRoute] = useState([]);
  
  const allPlaces = useMemo(() => {
    if (!plan?.itinerary) return [];
    const days = Object.keys(plan.itinerary);
    return days.flatMap(d => plan.itinerary[d]?.places || []).filter(p => p && !isNaN(p.lat) && !isNaN(p.lng));
  }, [plan?.itinerary]);

  const initialCenter = useMemo(() => {
    if (plan?.coordinates && !isNaN(plan.coordinates.lat) && !isNaN(plan.coordinates.lng) && plan.coordinates.lat !== null) {
      return [Number(plan.coordinates.lat), Number(plan.coordinates.lng)];
    }
    return [12.9716, 77.5946]; // Default to Bangalore
  }, [plan?.coordinates]);

  const days = useMemo(() => plan?.itinerary ? Object.keys(plan.itinerary) : [], [plan?.itinerary]);

  const targetPlaces = useMemo(() => {
    const list = activeDay === "all" 
      ? allPlaces 
      : (plan?.itinerary?.[days[activeDay - 1]]?.places || []);
    return list.filter(p => p && !isNaN(p.lat) && !isNaN(p.lng));
  }, [activeDay, allPlaces, plan?.itinerary, days]);

  // Target the current stop for live routing
  const currentTarget = allPlaces[currentIndex] || targetPlaces[0];

  // pathHistory logic needs userLocation
  useEffect(() => {
    if (isTracking && userLocation && !isNaN(userLocation.lat)) {
      setPathHistory(prev => [...prev, [userLocation.lat, userLocation.lng]]);
    } else if (!isTracking) {
      setPathHistory([]);
      setRoadRoute([]);
    }
  }, [isTracking, userLocation]);

  useEffect(() => {
    if (isTracking && userLocation && currentTarget && !isNaN(userLocation.lat) && !isNaN(currentTarget.lat)) {
      const fetchRoute = async () => {
        try {
          const res = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${userLocation.lng},${userLocation.lat};${currentTarget.lng},${currentTarget.lat}?overview=full&geometries=geojson`
          );
          const data = await res.json();
          if (data.routes && data.routes.length > 0) {
            const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
            setRoadRoute(coords);
          }
        } catch (err) {
          console.error("Routing error:", err);
        }
      };
      fetchRoute();
    }
  }, [isTracking, userLocation?.lat, userLocation?.lng, currentTarget?.lat, currentTarget?.lng]);

  if (!plan || !plan.itinerary) return null;

  const handleNextLocation = () => {
    if (currentIndex < allPlaces.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(allPlaces.length); // Completion state
    }
  };

  const currentPlace = allPlaces[currentIndex];

  return (
    <div className="map-container">
      <MapContainer
        key={`${plan.city}-${initialCenter[0]}-${initialCenter[1]}`}
        center={initialCenter}
        zoom={11}
        zoomControl={false}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <ChangeView center={initialCenter} />
        {isTracking && userLocation && !isNaN(userLocation.lat) && <FollowUser location={userLocation} />}
        {!isTracking && (
          <FitBounds 
            places={isGuidanceMode ? [] : allPlaces} 
            userLocation={userLocation} 
            activePlace={isGuidanceMode ? allPlaces[currentIndex] : null}
          />
        )}

        <ResizeMap trigger={activePlace} />

        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        <ZoomControls 
          onToggleGuidance={() => setIsGuidanceMode(!isGuidanceMode)} 
          isGuidanceMode={isGuidanceMode} 
        />

        {!isGuidanceMode && (
          <MapLegend
            days={days}
            activeDay={activeDay}
            setActiveDay={setActiveDay}
          />
        )}

        {/* Live Tracking Routes */}
        {isTracking && userLocation && !isNaN(userLocation.lat) && (
          <>
            {/* Traveled Path (Breadcrumbs) */}
            {pathHistory.length > 1 && (
              <Polyline 
                positions={pathHistory} 
                pathOptions={{ color: '#3b82f6', weight: 3, dashArray: '5, 10', opacity: 0.6 }} 
              />
            )}
            
            {/* Connection to target (Real Road Route) */}
            {roadRoute.length > 0 && (
              <Polyline 
                positions={roadRoute}
                pathOptions={{ color: '#3b82f6', weight: 5, opacity: 0.8 }}
              />
            )}

            {/* Fallback to direct line if OSRM fails */}
            {roadRoute.length === 0 && currentTarget && !isNaN(currentTarget.lat) && (
              <Polyline 
                positions={[[userLocation.lat, userLocation.lng], [currentTarget.lat, currentTarget.lng]]}
                pathOptions={{ color: '#3b82f6', weight: 4, opacity: 0.8, dashArray: '1, 10' }}
              />
            )}
          </>
        )}

        {/* Standard Mode Rendering */}
        {!isGuidanceMode && (() => {
          let globalIdxCounter = 0;
          return days.map((day, idx) => {
            if (activeDay !== "all" && activeDay !== idx + 1) {
              const skippedPlacesCount = plan.itinerary[day]?.places?.length || 0;
              globalIdxCounter += skippedPlacesCount;
              return null;
            }

            const places = (plan.itinerary[day]?.places || []).filter(p => p && !isNaN(p.lat) && !isNaN(p.lng));
            const positions = places.map(p => [p.lat, p.lng]);

            return (
              <Fragment key={`day-${idx}`}>
                {positions.length > 1 && (
                  <Polyline
                    positions={positions}
                    pathOptions={{
                      color: DAY_COLORS[idx],
                      weight: 4,
                      opacity: 0.7
                    }}
                  />
                )}

                {places.map((p, i) => {
                  const pGlobalIdx = globalIdxCounter++;
                  const isVisited = pGlobalIdx < currentIndex;
                  const isCurrent = pGlobalIdx === currentIndex;

                  return (
                    <Marker
                      key={`${day}-${i}`}
                      position={[p.lat, p.lng]}
                      icon={createLocationIcon(
                        isCurrent ? "#3b82f6" : DAY_COLORS[idx],
                        isCurrent || activeDay === idx + 1,
                        isVisited
                      )}
                      eventHandlers={{
                        mouseover: () => onHover(p),
                        mouseout: () => onHover(null),
                      }}
                    />
                  );
                })}
              </Fragment>
            );
          });
        })()}

        {/* Guidance Mode Rendering */}
        {isGuidanceMode && (
          <>
            {allPlaces.map((p, i) => {
              const isVisited = i < currentIndex;
              const isCurrent = i === currentIndex;
              const isNext = i === currentIndex + 1;
              
              let color = "rgba(148, 163, 184, 0.3)";
              let isActive = false;

              if (isVisited) {
                color = "#10b981";
              } else if (isCurrent) {
                color = "#3b82f6";
                isActive = true;
              } else if (isNext) {
                color = "#10b981";
                isActive = true;
              }

              return (
                <Marker
                  key={`guidance-${i}`}
                  position={[p.lat, p.lng]}
                  icon={createLocationIcon(color, isActive, isVisited)}
                />
              );
            })}

            {currentIndex < allPlaces.length - 1 && allPlaces[currentIndex] && allPlaces[currentIndex + 1] && (
              <Polyline
                positions={[
                  [allPlaces[currentIndex].lat, allPlaces[currentIndex].lng],
                  [allPlaces[currentIndex + 1].lat, allPlaces[currentIndex + 1].lng]
                ]}
                pathOptions={{
                  color: "#3b82f6",
                  weight: 6,
                  opacity: 0.9,
                  dashArray: "1, 12",
                  lineCap: "round"
                }}
              />
            )}
          </>
        )}

        {userLocation && !isNaN(userLocation.lat) && !isNaN(userLocation.lng) && (
          <Marker 
            position={[userLocation.lat, userLocation.lng]} 
            icon={createUserIcon(userLocation.heading)}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1}>
              You are here
            </Tooltip>
          </Marker>
        )}

      </MapContainer>
    </div>
  );
}

export default MapView;