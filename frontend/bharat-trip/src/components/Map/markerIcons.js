import L from "leaflet";

export function createLocationIcon(color, isActive = false) {
  return L.divIcon({
    className: "location-marker",
    html: `
      <div class="marker-outer" style="
        border-color: ${color};
        ${isActive ? `box-shadow: 0 0 0 6px ${color}55;` : ""}
      ">
        <div class="marker-inner" style="background:${color}"></div>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });
}