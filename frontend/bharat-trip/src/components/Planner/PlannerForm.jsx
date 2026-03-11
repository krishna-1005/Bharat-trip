import { useState } from "react";
import { generatePlan } from "../../services/api";
import { useSettings } from "../../context/SettingsContext";
import "../Planner/plannerForm.css";

function PlannerForm({ onPlanGenerated }) {
  const { t, formatPrice } = useSettings();
  const [days, setDays]           = useState(2);
  const [budget, setBudget]       = useState("low");
  const [interests, setInterests] = useState([]);
  const [plan, setPlan]           = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (interests.length === 0) {
      setError("Please select at least one interest.");
      return;
    }
    setError("");
    setLoading(true);
    setPlan(null);
    try {
      const result = await generatePlan({ days, budget, interests });
      setPlan(result);
      if (onPlanGenerated && result?.itinerary) {
        onPlanGenerated(result);
      }
    } catch {
      setPlan({ message: "Something went wrong. Try again." });
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (value) => {
    setInterests(prev =>
      prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value]
    );
  };

  const budgetOptions = [
    { value: "low",    label: t("budget_low"),  icon: "💸", desc: `${formatPrice(500)}–${formatPrice(1500)}/${t("days").toLowerCase().slice(0,-1)}` },
    { value: "medium", label: t("budget_med"), icon: "✈️", desc: `${formatPrice(1500)}–${formatPrice(4000)}/${t("days").toLowerCase().slice(0,-1)}` },
    { value: "high",   label: t("budget_high"),   icon: "💎", desc: `${formatPrice(4000)}+/${t("days").toLowerCase().slice(0,-1)}`      },
  ];

  const interestOptions = [
    { value: "Nature",  icon: "🌿", label: "Nature"  },
    { value: "Food",    icon: "🍜", label: "Food"    },
    { value: "Culture", icon: "🏛️", label: "Culture" },
    { value: "Adventure", icon: "🏔️", label: "Adventure" },
  ];

  return (
    <div className="pf-wrap">
      <h2 className="pf-title">{t("planner_title")}</h2>
      <p className="pf-subtitle">{t("planner_sub")}</p>

      {/* ── DAYS ── */}
      <div className="pf-field">
        <label className="pf-label">
          <span>📅</span> {t("form_days")}
        </label>
        <div className="pf-days-row">
          {[1,2,3,4,5,7,10].map(d => (
            <button
              key={d}
              className={`pf-day-btn ${days === d ? "active" : ""}`}
              onClick={() => setDays(d)}
              type="button"
            >
              {d}<span className="pf-day-label">{t("days").toLowerCase()}</span>
            </button>
          ))}
          <input 
            type="number" 
            min="1" 
            max="30" 
            value={days} 
            onChange={(e) => setDays(Math.min(30, Math.max(1, parseInt(e.target.value) || 1)))}
            className="pf-days-input"
            placeholder="Custom"
          />
        </div>
      </div>

      {/* ── BUDGET ── */}
      <div className="pf-field">
        <label className="pf-label">
          <span>💰</span> {t("form_budget")}
        </label>
        <div className="pf-budget-row">
          {budgetOptions.map(opt => (
            <button
              key={opt.value}
              className={`pf-budget-btn ${budget === opt.value ? "active" : ""}`}
              onClick={() => setBudget(opt.value)}
              type="button"
            >
              <span className="pf-budget-icon">{opt.icon}</span>
              <span className="pf-budget-name">{opt.label}</span>
              <span className="pf-budget-desc">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── INTERESTS ── */}
      <div className="pf-field">
        <label className="pf-label">
          <span>✨</span> {t("form_interests")}
        </label>
        <div className={`pf-interest-row ${error ? "pf-error-border" : ""}`}>
          {interestOptions.map(opt => (
            <button
              key={opt.value}
              className={`pf-interest-btn ${interests.includes(opt.value) ? "active" : ""}`}
              onClick={() => toggleInterest(opt.value)}
              type="button"
            >
              <span>{opt.icon}</span>
              <span>{opt.label}</span>
              {interests.includes(opt.value) && <span className="pf-check">✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* ── GENERATE BUTTON ── */}
      <button
        className={`pf-submit ${loading ? "loading" : ""}`}
        onClick={handleSubmit}
        disabled={loading}
        type="button"
      >
        {loading ? (
          <span className="pf-loader-wrap">
            <span className="pf-spinner"></span>
            {t("crafting")}
          </span>
        ) : (
          <span>{t("gen_btn")}</span>
        )}
      </button>

      {error && (
        <p className="pf-error-message">{error}</p>
      )}
      
      {plan?.message && (
        <p className="pf-error">{plan.message}</p>
      )}
    </div>
  );
}

export default PlannerForm;