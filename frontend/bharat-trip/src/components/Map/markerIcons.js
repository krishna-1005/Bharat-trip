import L from "leaflet";

export function createLocationIcon(color, isActive = false) {
  return L.divIcon({
    className: "custom-pin-container",
    html: `
      <div class="pin-wrapper ${isActive ? 'active' : ''}" style="color: ${color}">
        <div class="pin-main" style="background-color: ${color}">
          <div class="pin-inner-dot"></div>
        </div>
        <div class="pin-drop-shadow"></div>
      </div>
    `,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -42]
  });
}