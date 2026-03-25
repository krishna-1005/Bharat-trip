const DAY_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#a855f7"];

function MapLegend({ days, activeDay, setActiveDay }) {
  return (
    <div className="map-legend">
      {days.map((day, idx) => (
        <div
          key={day}
          className={`legend-item ${activeDay === idx + 1 ? "active" : ""}`}
          onClick={() => setActiveDay(idx + 1)}
        >
          <span
            className="legend-dot"
            style={{ background: DAY_COLORS[idx] }}
          />
          {day}
        </div>
      ))}
    </div>
  );
}

export default MapLegend;