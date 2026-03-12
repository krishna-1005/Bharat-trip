import React from "react";
import { useNavigate } from "react-router-dom";
import PlannerForm from "../components/Planner/PlannerForm";
import "./planner.css";

import img2 from "../assets/images/img2.webp";
import img3 from "../assets/images/img3.webp";
import img4 from "../assets/images/img4.webp";

function Planner() {
  const navigate = useNavigate();

  const handlePlanGenerated = (generatedPlan) => {
    navigate("/results", { state: { plan: generatedPlan } });
  };

  const featuredSpots = [
    { name: "Cubbon Park", type: "Nature", img: img2 },
    { name: "Bangalore Palace", type: "Heritage", img: img3 },
    { name: "Church Street", type: "Urban", img: img4 },
  ];

  return (
    <div className="planner-page" style={{ background: '#020617' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, background: 'red', color: 'white', zIndex: 9999, padding: '5px', fontSize: '10px' }}>
        v2.0 REDESIGN LOADED
      </div>
      <div className="planner-bg-gradient"></div>
      
      <div className="planner-container">
        {/* ── LEFT: CONTENT ── */}
        <div className="planner-content">
          <div className="planner-header animate-up">
            <span className="premium-badge">✦ AI-POWERED TRAVEL</span>
            <h1>Craft Your <span className="gradient-text">Perfect Story</span></h1>
            <p>Our advanced AI analyzes your preferences to build a seamless, localized experience in Bengaluru.</p>
          </div>

          <div className="planner-featured-list animate-up" style={{ animationDelay: '0.2s' }}>
            <span className="featured-label">EXPLORE TOP SPOTS</span>
            <div className="featured-mini-grid">
              {featuredSpots.map((spot, i) => (
                <div key={i} className="featured-mini-card">
                  <img src={spot.img} alt={spot.name} />
                  <div className="featured-mini-info">
                    <span className="featured-mini-name">{spot.name}</span>
                    <span className="featured-mini-type">{spot.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: FORM ── */}
        <div className="planner-card-wrap animate-up" style={{ animationDelay: '0.1s' }}>
          <div className="planner-main-card">
            <div className="card-glass-glow"></div>
            <PlannerForm onPlanGenerated={handlePlanGenerated} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Planner;
