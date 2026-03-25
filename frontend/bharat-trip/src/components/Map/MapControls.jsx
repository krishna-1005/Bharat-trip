function MapControls({ activeDay, setActiveDay, children }) {
  return (
    <div className="map-controls">
      <div className="map-control-group">
        <button
          className={activeDay === "all" ? "active" : ""}
          onClick={() => setActiveDay("all")}
        >
          All
        </button>

        {[1, 2, 3, 4, 5].map(d => (
          <button
            key={d}
            className={activeDay === d ? "active" : ""}
            onClick={() => setActiveDay(d)}
          >
            Day {d}
          </button>
        ))}
      </div>

      {children}
    </div>
  );
}

export default MapControls;