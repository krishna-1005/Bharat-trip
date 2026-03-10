import { useLocation, useNavigate } from "react-router-dom";
import MapView from "../components/Map/MapView";
import { DAY_COLORS } from "../constants/dayColors";
import "./results.css";
import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { getAuth } from "firebase/auth";
const API = import.meta.env.VITE_API_URL;

function Results() {

  const navigate = useNavigate();
  const loc = useLocation();

  const savedPlan = localStorage.getItem("tripPlan");

  const [plan, setPlan] = useState(
    loc.state?.plan || (savedPlan ? JSON.parse(savedPlan) : null)
  );

  const [tripTitle, setTripTitle] = useState("");
  const [tripType, setTripType] = useState("Adventure");
  const [travelers, setTravelers] = useState("Solo");

  const [activeDay, setActiveDay] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!plan) {
    return (
      <div className="res-empty">
        <div className="res-empty-icon">🗺️</div>
        <h2>No trip generated yet</h2>
        <p>Head back to the planner and create your itinerary</p>
        <button onClick={() => navigate("/planner")}>← Back to Planner</button>
      </div>
    );
  }

  const days = Object.keys(plan.itinerary);

  const totalDays = days.length;

  const totalPlaces = days.reduce(
    (sum, d) => sum + plan.itinerary[d].places.length,
    0
  );

  /* ---------- DRAG ---------- */

  const handleDragEnd = (result) => {

    if (!result.destination) return;

    const { source, destination } = result;

    const day = days[source.droppableId];

    const newPlan = { ...plan };

    const items = [...newPlan.itinerary[day].places];

    const [moved] = items.splice(source.index, 1);

    items.splice(destination.index, 0, moved);

    newPlan.itinerary[day].places = items;

    setPlan(newPlan);

  };

  /* ---------- DISTANCE ---------- */

  function getDistance(a, b) {

    const R = 6371;

    const dLat = (b.lat - a.lat) * Math.PI / 180;
    const dLng = (b.lng - a.lng) * Math.PI / 180;

    const lat1 = a.lat * Math.PI / 180;
    const lat2 = b.lat * Math.PI / 180;

    const val =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLng / 2) *
        Math.sin(dLng / 2) *
        Math.cos(lat1) *
        Math.cos(lat2);

    const c = 2 * Math.atan2(Math.sqrt(val), Math.sqrt(1 - val));

    return R * c;

  }

  /* ---------- OPTIMIZE ROUTE ---------- */

  const handleOptimizeRoute = () => {

    const newPlan = { ...plan };

    Object.keys(newPlan.itinerary).forEach(day => {

      const places = [...newPlan.itinerary[day].places];

      if (places.length < 3) return;

      const optimized = [];

      let current = places.shift();

      optimized.push(current);

      while (places.length > 0) {

        let nearestIndex = 0;
        let nearestDistance = Infinity;

        places.forEach((place, i) => {

          const dist = getDistance(current, place);

          if (dist < nearestDistance) {
            nearestDistance = dist;
            nearestIndex = i;
          }

        });

        current = places.splice(nearestIndex, 1)[0];

        optimized.push(current);

      }

      newPlan.itinerary[day].places = optimized;

    });

    setPlan(newPlan);

  };

  /* ---------- SAVE TRIP ---------- */

  const handleSaveTrip = async () => {

    setSaving(true);

    try {

      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        alert("Please login first");
        return;
      }

      const token = await user.getIdToken(true);

      const res = await fetch(`${API}/api/profile/trips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: tripTitle || `${totalDays}-Day Bangalore Trip`,
          city: "Bangalore",
          days: totalDays,
          budget: plan.budget,
          interests: plan.interests,
          itinerary: plan.itinerary,
          totalCost: plan.totalTripCost
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to save");
        return;
      }

      setSaved(true);

      /* redirect to profile after saving */
      setTimeout(() => {
        navigate("/profile");
      }, 1200);

    } catch {

      alert("Server error — make sure backend is running.");

    } finally {

      setSaving(false);

    }

  };

  return (

    <div className="res-page">

      {/* MAP */}

      <div className="res-map-wrap">

        <MapView plan={plan} />

        <div className="res-map-pill">

          <div className="res-pill-stat">
            <span className="res-pill-val">₹{plan.totalTripCost}</span>
            <span className="res-pill-label">Total Cost</span>
          </div>

          <div className="res-pill-divider" />

          <div className="res-pill-stat">
            <span className="res-pill-val">{totalDays}</span>
            <span className="res-pill-label">Days</span>
          </div>

          <div className="res-pill-divider" />

          <div className="res-pill-stat">
            <span className="res-pill-val">{totalPlaces}</span>
            <span className="res-pill-label">Places</span>
          </div>

          <button
            className="res-pill-save"
            onClick={handleSaveTrip}
            disabled={saving || saved}
          >
            {saved ? "✓ Saved!" : saving ? "Saving…" : "Save Trip"}
          </button>

        </div>

        <div className="res-day-toggles">

          {days.map((day, idx) => (

            <button
              key={day}
              className={`res-day-pill ${activeDay === day ? "res-day-pill-active" : ""}`}
              style={{ "--dot": DAY_COLORS[idx] }}
              onClick={() =>
                setActiveDay(activeDay === day ? null : day)
              }
            >
              <span className="res-dot" />
              {day}
            </button>

          ))}

        </div>

      </div>

      {/* PANEL */}

      <aside className="res-panel">

        <button
          className="res-optimize-btn"
          onClick={handleOptimizeRoute}
        >
          ⚡ Optimize Route
        </button>

        <div className="res-panel-header">

          <div className="res-panel-title-row">
            <h2>Your Itinerary</h2>
            <span className="res-cost-badge">₹{plan.totalTripCost}</span>
          </div>

          <p className="res-panel-sub">
            {totalDays} days · {totalPlaces} places · Bangalore
          </p>

        </div>

        {/* TRIP DETAILS */}

        <div className="res-form-section">

          <p className="res-section-label">TRIP DETAILS</p>

          <div className="res-input-wrap">
            <span className="res-input-icon">✏️</span>
            <input
              type="text"
              placeholder="Name your trip…"
              value={tripTitle}
              onChange={(e) => setTripTitle(e.target.value)}
              className="res-input"
            />
          </div>

          <div className="res-select-row">

            <div className="res-select-wrap">
              <span className="res-select-label">Type</span>
              <select
                value={tripType}
                onChange={(e) => setTripType(e.target.value)}
                className="res-select"
              >
                <option>Adventure</option>
                <option>Relaxation</option>
                <option>Food Tour</option>
                <option>Cultural</option>
                <option>Nature</option>
              </select>
            </div>

            <div className="res-select-wrap">
              <span className="res-select-label">Travelers</span>
              <select
                value={travelers}
                onChange={(e) => setTravelers(e.target.value)}
                className="res-select"
              >
                <option>Solo</option>
                <option>Couple</option>
                <option>Friends</option>
                <option>Family</option>
              </select>
            </div>

          </div>

        </div>

        <div className="res-days-wrap">

          <p className="res-section-label">ITINERARY</p>

          <DragDropContext onDragEnd={handleDragEnd}>

            {days.map((day, idx) => {

              const d = plan.itinerary[day];
              const color = DAY_COLORS[idx];

              return (

                <div
                  key={day}
                  className={`res-day-card ${activeDay === day ? "res-day-card-active" : ""}`}
                  style={{ "--accent": color }}
                >

                  <div className="res-day-strip" />

                  <div className="res-day-body">

                    <div className="res-day-top">

                      <div className="res-day-title-row">
                        <span className="res-day-dot" style={{ background: color }} />
                        <h3 className="res-day-title">{day}</h3>
                      </div>

                      <div className="res-day-meta">
                        <span>⏱ {d.estimatedHours}h</span>
                        <span>💰 ₹{d.estimatedCost}</span>
                      </div>

                    </div>

                    <Droppable droppableId={String(idx)}>

                      {(provided) => (

                        <ul
                          className="res-places"
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                        >

                          {d.places.map((p, i) => (

                            <Draggable
                              key={`${day}-${i}`}
                              draggableId={`${day}-${i}`}
                              index={i}
                            >

                              {(provided) => (

                                <li
                                  className="res-place-item"
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >

                                  <span className="res-place-num">
                                    {String(i + 1).padStart(2, "0")}
                                  </span>

                                  <span className="res-place-name">
                                    {p.name}
                                  </span>

                                  {p.estimatedCost > 0 && (
                                    <span className="res-place-cost">
                                      ₹{p.estimatedCost}
                                    </span>
                                  )}

                                </li>

                              )}

                            </Draggable>

                          ))}

                          {provided.placeholder}

                        </ul>

                      )}

                    </Droppable>

                  </div>

                </div>

              );

            })}

          </DragDropContext>

        </div>

        {/* SAVE BUTTON */}

        <div className="res-save-wrap">

          <button
            className={`res-save-btn ${saved ? "res-save-btn-done" : ""}`}
            onClick={handleSaveTrip}
            disabled={saving || saved}
          >
            {saved
              ? "✓ Trip Saved to Profile!"
              : saving
              ? "Saving…"
              : "Save Trip to Profile →"}
          </button>

          <p className="res-save-hint">
            Saved trips appear in your Profile dashboard
          </p>

        </div>

      </aside>

    </div>

  );

}

export default Results;