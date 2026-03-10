import { useState } from "react";
import { generatePlan } from "../../services/api";
import "../Planner/plannerForm.css";

function PlannerForm({ onPlanGenerated }) {
  const [days, setDays]           = useState(2);
  const [budget, setBudget]       = useState("low");
  const [interests, setInterests] = useState([]);
  const [plan, setPlan]           = useState(null);
  const [loading, setLoading]     = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setPlan(null);
    try {
      const result = await generatePlan({ days, budget, interests });
      setPlan(result);
      if (onPlanGenerated && result?.itinerary) onPlanGenerated(result);
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
    { value: "low",    label: "Budget",  icon: "💸", desc: "₹500–₹1500/day" },
    { value: "medium", label: "Comfort", icon: "✈️", desc: "₹1500–₹4000/day" },
    { value: "high",   label: "Luxury",  icon: "💎", desc: "₹4000+/day"      },
  ];

  const interestOptions = [
    { value: "Nature",  icon: "🌿", label: "Nature"  },
    { value: "Food",    icon: "🍜", label: "Food"    },
    { value: "Culture", icon: "🏛️", label: "Culture" },
    { value: "Adventure", icon: "🏔️", label: "Adventure" },
  ];

  return (
    <div className="pf-wrap">
      <h2 className="pf-title">Quick Trip Planner</h2>
      <p className="pf-subtitle">Customize your perfect Bangalore getaway</p>

      {/* ── DAYS ── */}
      <div className="pf-field">
        <label className="pf-label">
          <span>📅</span> Duration
        </label>
        <div className="pf-days-row">
          {[1,2,3,4,5].map(d => (
            <button
              key={d}
              className={`pf-day-btn ${days === d ? "active" : ""}`}
              onClick={() => setDays(d)}
              type="button"
            >
              {d}<span className="pf-day-label">day{d > 1 ? "s" : ""}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── BUDGET ── */}
      <div className="pf-field">
        <label className="pf-label">
          <span>💰</span> Budget
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
          <span>✨</span> Interests
        </label>
        <div className="pf-interest-row">
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
            Crafting your itinerary…
          </span>
        ) : (
          <span>Generate My Plan →</span>
        )}
      </button>

      {plan?.message && (
        <p className="pf-error">{plan.message}</p>
      )}
    </div>
  );
}

export default PlannerForm;