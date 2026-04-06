import L from "leaflet";

export function createLocationIcon(color, isActive = false, isVisited = false, theme = 'dark') {
  const isDark = theme === 'dark';
  return L.divIcon({
    className: "custom-pin-container",
    html: `
      <div class="pin-wrapper ${isActive ? 'active' : ''} ${isVisited ? 'visited' : ''} ${isDark ? 'theme-dark' : 'theme-light'}" style="color: ${color}">
        <div class="pin-main" style="background-color: ${color}; border-color: ${isVisited ? '#10b981' : (isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.2)')}; border-width: ${isVisited ? '2px' : '1.5px'}">
          ${isVisited ? '<span class="pin-check" style="color: #10b981">✓</span>' : '<div class="pin-inner-dot"></div>'}
        </div>
        <div class="pin-drop-shadow"></div>
      </div>
    `,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -42]
  });
}