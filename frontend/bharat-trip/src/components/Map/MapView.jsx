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
import { useState, useEffect, Fragment } from "react";
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
function ZoomControls() {
  const map = useMap();

  return (
    <div className="map-zoom-controls">
      <button onClick={() => map.zoomIn()}>+</button>
      <button onClick={() => map.zoomOut()}>−</button>
    </div>
  );
}

function FitBounds({ places, userLocation }) {
  const map = useMap();

  useEffect(() => {
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

  }, [places, userLocation, map]);

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

function MapView({ plan, isTracking, onHover }) {
  const [activeDay, setActiveDay] = useState("all");
  const [userLocation, setUserLocation] = useState(null);
  const [pathHistory, setPathHistory] = useState([]);
  const [roadRoute, setRoadRoute] = useState([]);

  useEffect(() => {
    let watchId = null;

    if (isTracking) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(loc);
          setPathHistory(prev => [...prev, [loc.lat, loc.lng]]);
        },
        (error) => console.log("Tracking error:", error),
        { enableHighAccuracy: true }
      );
    } else {
      setPathHistory([]);
      setRoadRoute([]);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.log("Location error:", error),
        { enableHighAccuracy: true }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isTracking]);

  // Fetch road route whenever userLocation or firstTarget changes
  const days = plan?.itinerary ? Object.keys(plan.itinerary) : [];
  const allPlaces = days.flatMap(d => plan.itinerary[d]?.places || []);
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

  return (
    <div className="map-container">
      <MapContainer
        center={initialCenter}
        zoom={11}
        zoomControl={false}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <ChangeView center={initialCenter} />
        {isTracking && userLocation && <FollowUser location={userLocation} />}
        {!isTracking && <FitBounds places={allPlaces} userLocation={userLocation} />}

        <ResizeMap trigger={plan} />

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ZoomControls />

        {/* ── Background Tourist Spots (All Discovered) ── */}
        {plan.allDiscoveredPlaces?.map((spot, i) => {
          // Don't show if already in itinerary
          if (allPlaces.some(p => p.name === spot.name)) return null;
          return (
            <Marker
              key={`spot-${i}`}
              position={[spot.lat, spot.lng]}
              icon={L.divIcon({
                className: "bg-spot-pin",
                html: `<div style="width: 8px; height: 8px; background: rgba(255,255,255,0.3); border: 1px solid rgba(255,255,255,0.5); border-radius: 50%;"></div>`,
                iconSize: [8, 8]
              })}
            >
              <Tooltip direction="top" offset={[0, -5]} className="bg-spot-tooltip">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', padding: '5px' }}>
                  <PlaceImage 
                    placeName={spot.name} 
                    city={plan.city} 
                    style={{ width: '100px', height: '60px', borderRadius: '4px', objectFit: 'cover' }} 
                  />
                  <span style={{fontSize: '10px', fontWeight: 'bold'}}>{spot.name}</span>
                  <span style={{fontSize: '8px', color: '#666'}}>{spot.category}</span>
                </div>
              </Tooltip>
            </Marker>
          );
        })}

        <MapLegend
          days={days}
          activeDay={activeDay}
          setActiveDay={setActiveDay}
        />

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

        {days.map((day, idx) => {
          if (activeDay !== "all" && activeDay !== idx + 1) return null;

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

              {places.map((p, i) => (
                <Marker
                  key={`${day}-${i}`}
                  position={[p.lat, p.lng]}
                  icon={createLocationIcon(
                    DAY_COLORS[idx],
                    activeDay === idx + 1
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
                    <PlaceTooltip place={p} />
                  </Tooltip>
                </Marker>
              ))}
            </Fragment>
          );
        })}

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