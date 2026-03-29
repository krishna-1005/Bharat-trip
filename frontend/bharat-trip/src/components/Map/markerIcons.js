import L from "leaflet";

export function createLocationIcon(color, isActive = false, isVisited = false) {
  return L.divIcon({
    className: "custom-pin-container",
    html: `
      <div class="pin-wrapper ${isActive ? 'active' : ''} ${isVisited ? 'visited' : ''}" style="color: ${isVisited ? '#10b981' : color}">
        <div class="pin-main" style="background-color: ${isVisited ? '#10b981' : color}">
          ${isVisited ? '<span class="pin-check">✓</span>' : '<div class="pin-inner-dot"></div>'}
        </div>
        <div class="pin-drop-shadow"></div>
      </div>
    `,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -42]
  });
}