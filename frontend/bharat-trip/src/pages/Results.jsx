import { useLocation, useNavigate } from "react-router-dom";
import MapView from "../components/Map/MapView";
import { DAY_COLORS } from "../constants/dayColors";
import "./results.css";
import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { getAuth } from "firebase/auth";
import { useSettings } from "../context/SettingsContext";
const API = import.meta.env.VITE_API_URL;

function Results() {

  const navigate = useNavigate();
  const loc = useLocation();
  const { formatPrice, t } = useSettings();

  const [plan, setPlan] = useState(() => {
    if (loc.state?.plan) {
      localStorage.setItem("tripPlan", JSON.stringify(loc.state.plan));
      return loc.state.plan;
    }
    const saved = localStorage.getItem("tripPlan") || sessionStorage.getItem("tripPlan");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (!plan) {
      const saved = localStorage.getItem("tripPlan") || sessionStorage.getItem("tripPlan");
      if (saved) {
        setPlan(JSON.parse(saved));
      }
    }
  }, [plan]);

  const [tripTitle, setTripTitle] = useState("");
  const [tripType, setTripType] = useState("Adventure");
  const [travelers, setTravelers] = useState("Solo");

  const [activeDay, setActiveDay] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!plan || !plan.itinerary) {
    return (
      <div className="res-empty">
        <div className="res-empty-icon">🗺️</div>
        <h2>{t("no_trip")}</h2>
        <p>{t("planner_sub")}</p>
        <button onClick={() => navigate("/planner")}>← {t("back_to_planner")}</button>
      </div>
    );
  }

  const days = Object.keys(plan.itinerary);
  const totalDays = days.length;
  const totalPlaces = days.reduce((sum, d) => sum + (plan.itinerary[d]?.places?.length || 0), 0);
  const totalTripCost = plan.totalTripCost || days.reduce((sum, d) => sum + (plan.itinerary[d]?.estimatedCost || 0), 0);

  const handleSaveTrip = async () => {
    setSaving(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) { alert("Please login first"); return; }
      const token = await user.getIdToken(true);
      const res = await fetch(`${API}/api/profile/trips`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
      if (res.ok) {
        setSaved(true);
        setTimeout(() => navigate("/profile"), 1200);
      }
    } catch { alert("Server error"); } finally { setSaving(false); }
  };

  return (
    <div className="res-page">
      <div className="res-map-wrap">
        <MapView plan={plan} />
        <div className="res-map-pill">
          <div className="res-pill-stat">
            <span className="res-pill-val">{formatPrice(totalTripCost)}</span>
            <span className="res-pill-label">{t("total_cost")}</span>
          </div>
          <div className="res-pill-divider" />
          <div className="res-pill-stat">
            <span className="res-pill-val">{totalDays}</span>
            <span className="res-pill-label">{t("days")}</span>
          </div>
          <div className="res-pill-divider" />
          <div className="res-pill-stat">
            <span className="res-pill-val">{totalPlaces}</span>
            <span className="res-pill-label">{t("places")}</span>
          </div>
          <button className="res-pill-save" onClick={handleSaveTrip} disabled={saving || saved}>
            {saved ? "✓" : saving ? "..." : t("save_trip")}
          </button>
        </div>
      </div>

      <aside className="res-panel">
        <button className="res-optimize-btn" onClick={() => {}}>{t("optimize_route")}</button>
        <div className="res-panel-header">
          <div className="res-panel-title-row">
            <h2>{t("results_title")}</h2>
            <span className="res-cost-badge">{formatPrice(totalTripCost)}</span>
          </div>
        </div>

        <div className="res-form-section">
          <p className="res-section-label">{t("trip_details")}</p>
          <div className="res-input-wrap">
            <input type="text" placeholder="Trip Name" className="res-input" value={tripTitle} onChange={e=>setTripTitle(e.target.value)} />
          </div>
        </div>

        <div className="res-days-wrap">
          <p className="res-section-label">{t("itinerary_label")}</p>
          {days.map((day, idx) => (
            <div key={day} className="res-day-card" style={{ "--accent": DAY_COLORS[idx] }}>
              <div className="res-day-body">
                <div className="res-day-top">
                  <h3 className="res-day-title">{day}</h3>
                  <div className="res-day-meta">
                    <span>💰 {formatPrice(plan.itinerary[day].estimatedCost)}</span>
                  </div>
                </div>
                <ul className="res-places">
                  {plan.itinerary[day].places.map((p, i) => (
                    <li key={i} className="res-place-item">
                      <span className="res-place-name">{p.name}</span>
                      <span className="res-place-cost">{formatPrice(p.estimatedCost)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="res-save-wrap">
          <button className="res-save-btn" onClick={handleSaveTrip} disabled={saving || saved}>
            {saved ? "✓" : t("save_to_profile")}
          </button>
        </div>
      </aside>
    </div>
  );
}

export default Results;