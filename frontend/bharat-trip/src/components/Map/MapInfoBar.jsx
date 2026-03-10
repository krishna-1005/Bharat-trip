import { DAY_COLORS } from "../../constants/dayColors";

function MapInfoBar({ totalCost, days, itinerary }) {
  if (!days || !itinerary) return null;

  const totalPlaces = days.reduce(
    (sum, d) => sum + itinerary[d].places.length,
    0
  );

  return (
    <div className="map-info-bar">
      <div className="info-left">
        <div className="info-block">
          <span className="label">TOTAL TRIP COST</span>
          <span className="value">  ₹{totalCost}</span>
        </div>

        <div className="info-block">
          <span className="label">PLACES TO VISIT</span>
          <span className="value"> {totalPlaces} Locations</span>
        </div>
      </div>

      <div className="info-legend">
        {days.map((day, idx) => (
          <div key={day} className="legend-item">
            <span
              className="legend-dot"
              style={{ backgroundColor: DAY_COLORS[idx] }}
            />
            <span>{day}</span>
          </div>
        ))}
      </div>

      <button className="save-btn">Save Trip</button>
    </div>
  );
}

export default MapInfoBar;