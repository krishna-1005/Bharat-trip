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

function MapView({ plan, isTracking }) {
  const [activeDay, setActiveDay] = useState("all");
  const [userLocation, setUserLocation] = useState(null);

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
        },
        (error) => console.log("Tracking error:", error),
        { enableHighAccuracy: true }
      );
    } else {
      // One-time fetch if not tracking
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

  if (!plan || !plan.itinerary) return null;

  const days = Object.keys(plan.itinerary);
  const allPlaces = days.flatMap(
    d => plan.itinerary[d]?.places || []
  );

  return (
    <div className="map-container">
      <MapContainer
        center={[12.9716, 77.5946]}
        zoom={11}
        zoomControl={false}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        {isTracking && userLocation && <FollowUser location={userLocation} />}
        {!isTracking && <FitBounds places={allPlaces} userLocation={userLocation} />}

        <ResizeMap trigger={plan} />

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ZoomControls />

        <MapLegend
          days={days}
          activeDay={activeDay}
          setActiveDay={setActiveDay}
        />

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