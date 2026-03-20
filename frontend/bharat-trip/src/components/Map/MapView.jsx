import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Tooltip,
  useMap
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
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

// Create a special icon for user location
const userIcon = L.divIcon({
  className: "custom-pin-container",
  html: `
    <div class="pin-wrapper">
      <div class="pin-main" style="background-color: #3b82f6; border-color: #fff;">
        <div class="pin-inner-dot" style="background-color: #fff;"></div>
      </div>
      <div class="pin-drop-shadow"></div>
    </div>
  `,
  iconSize: [22, 30],
  iconAnchor: [11, 30]
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
    if (activePlace) {
      map.setView([activePlace.lat, activePlace.lng], 15, { animate: true });
      return;
    }

    if (!places.length && !userLocation) return;

    const bounds = [];

    places.forEach(p => {
      if (p.lat && p.lng) bounds.push([p.lat, p.lng]);
    });

    if (userLocation) {
      bounds.push([userLocation.lat, userLocation.lng]);
    }

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [80, 80] });
    }

  }, [places, userLocation, map, activePlace]);

  return null;
}

function FollowUser({ location }) {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.setView([location.lat, location.lng], map.getZoom(), { animate: true });
    }
  }, [location, map]);
  return null;
}

function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

function MapView({ plan, isTracking, onHover, isGuidanceMode, setIsGuidanceMode, currentIndex, setCurrentIndex, userLocation }) {
  const [activeDay, setActiveDay] = useState("all");
  const [pathHistory, setPathHistory] = useState([]);
  const [roadRoute, setRoadRoute] = useState([]);
  
  // pathHistory logic needs userLocation
  useEffect(() => {
    if (isTracking && userLocation) {
      setPathHistory(prev => [...prev, [userLocation.lat, userLocation.lng]]);
    } else if (!isTracking) {
      setPathHistory([]);
      setRoadRoute([]);
    }
  }, [isTracking, userLocation]);

  // Memoize allPlaces so FitBounds doesn't re-trigger on every render (like hover)
  const allPlaces = useMemo(() => {
    const days = plan?.itinerary ? Object.keys(plan.itinerary) : [];
    return days.flatMap(d => plan.itinerary[d]?.places || []);
  }, [plan?.itinerary]);

  const days = plan?.itinerary ? Object.keys(plan.itinerary) : [];
  const targetPlaces = activeDay === "all" 
    ? allPlaces 
    : (plan.itinerary[days[activeDay - 1]]?.places || []);
  const firstTarget = targetPlaces[0];

  useEffect(() => {
    if (isTracking && userLocation && firstTarget) {
      const fetchRoute = async () => {
        try {
          const res = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${userLocation.lng},${userLocation.lat};${firstTarget.lng},${firstTarget.lat}?overview=full&geometries=geojson`
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
  }, [isTracking, userLocation?.lat, userLocation?.lng, firstTarget?.lat, firstTarget?.lng]);

  if (!plan || !plan.itinerary) return null;

  const initialCenter = useMemo(() => {
    return plan.coordinates 
      ? [plan.coordinates.lat, plan.coordinates.lng] 
      : [12.9716, 77.5946];
  }, [plan.city, plan.coordinates?.lat, plan.coordinates?.lng]);

  const handleNextLocation = () => {
    if (currentIndex < allPlaces.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(allPlaces.length); // Completion state
    }
  };

  const currentPlace = allPlaces[currentIndex];
  const nextPlace = allPlaces[currentIndex + 1];
  const thenPlace = allPlaces[currentIndex + 2];

  return (
    <div className="map-container">
      <MapContainer
        key={`${plan.city}-${plan.coordinates?.lat}-${plan.coordinates?.lng}`}
        center={initialCenter}
        zoom={11}
        zoomControl={false}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <ChangeView center={initialCenter} />
        {isTracking && userLocation && <FollowUser location={userLocation} />}
        {!isTracking && (
          <FitBounds 
            places={isGuidanceMode ? [] : allPlaces} 
            userLocation={userLocation} 
            activePlace={isGuidanceMode ? allPlaces[currentIndex] : null}
          />
        )}

        <ResizeMap trigger={plan} />

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
        {isTracking && userLocation && (
          <>
            {/* Traveled Path (Breadcrumbs) */}
            {pathHistory.length > 1 && (
              <Polyline 
                positions={pathHistory} 
                pathOptions={{ color: '#3b82f6', weight: 3, dashArray: '5, 10', opacity: 0.6 }} 
              />
            )}
            
            {/* Connection to first destination (Real Road Route) */}
            {roadRoute.length > 0 && (
              <Polyline 
                positions={roadRoute}
                pathOptions={{ color: '#3b82f6', weight: 5, opacity: 0.8 }}
              >
                <Tooltip permanent direction="center" className="route-tooltip">
                  Navigating to {firstTarget?.name}
                </Tooltip>
              </Polyline>
            )}

            {/* Fallback to direct line if OSRM fails */}
            {roadRoute.length === 0 && firstTarget && (
              <Polyline 
                positions={[[userLocation.lat, userLocation.lng], [firstTarget.lat, firstTarget.lng]]}
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
              // We still need to increment the counter for skipped days to keep it in sync
              const skippedPlacesCount = plan.itinerary[day]?.places?.length || 0;
              globalIdxCounter += skippedPlacesCount;
              return null;
            }

            const places = plan.itinerary[day]?.places || [];
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

                  if (isVisited) return null; // Hide visited markers as requested

                  return (
                    <Marker
                      key={`${day}-${i}`}
                      position={[p.lat, p.lng]}
                      icon={createLocationIcon(
                        isCurrent ? "#3b82f6" : DAY_COLORS[idx],
                        isCurrent || activeDay === idx + 1
                      )}
                      eventHandlers={{
                        mouseover: () => onHover(p),
                        mouseout: () => onHover(null),
                      }}
                    >
                      <Tooltip
                        direction="top"
                        offset={[0, -14]}
                        opacity={1}
                        interactive
                        sticky
                        className="location-tooltip"
                      >
                        <PlaceTooltip place={p} city={plan.city} />
                      </Tooltip>
                    </Marker>
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
              // Only keep: Current location marker, Next location marker, Remaining itinerary markers
              if (i < currentIndex) return null;

              let color = "#94a3b8"; // Gray for remaining
              let isActive = false;
              if (i === currentIndex) {
                color = "#3b82f6"; // Blue for current
                isActive = true;
              } else if (i === currentIndex + 1) {
                color = "#10b981"; // Green for next
              }

              return (
                <Marker
                  key={`guidance-${i}`}
                  position={[p.lat, p.lng]}
                  icon={createLocationIcon(color, isActive)}
                >
                  <Tooltip
                    direction="top"
                    offset={[0, -14]}
                    opacity={1}
                    className="location-tooltip"
                  >
                    <PlaceTooltip place={p} city={plan.city} />
                  </Tooltip>
                </Marker>
              );
            })}

            {currentIndex < allPlaces.length - 1 && (
              <Polyline
                positions={[
                  [allPlaces[currentIndex].lat, allPlaces[currentIndex].lng],
                  [allPlaces[currentIndex + 1].lat, allPlaces[currentIndex + 1].lng]
                ]}
                pathOptions={{
                  color: "#3b82f6",
                  weight: 5,
                  opacity: 0.8,
                  dashArray: "10, 10"
                }}
              />
            )}
          </>
        )}

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
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