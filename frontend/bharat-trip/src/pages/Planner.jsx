import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PlannerForm from "../components/Planner/PlannerForm";
import "./planner.css";

import img2 from "../assets/images/img2.webp";
import img3 from "../assets/images/img3.webp";
import img4 from "../assets/images/img4.webp";
import img1 from "../assets/images/img1.webp";

function Planner() {
  const navigate = useNavigate();
  const [activePersona, setActivePersona] = useState('explorer');

  const handlePlanGenerated = (generatedPlan) => {
    navigate("/results", { state: { plan: generatedPlan, isNew: true } });
  };

  const personas = {
    explorer: {
      id: 'explorer',
      label: 'The Explorer',
      tip: 'The best stories are found off the beaten path. Let curiosity be your compass.',
      spots: [
        { name: "Spiti Valley", type: "High Altitude", img: img3 },
        { name: "Meghalaya", type: "Living Bridges", img: img2 }
      ]
    },
    relaxer: {
      id: 'relaxer',
      label: 'The Relaxer',
      tip: 'Slow down and breathe. A journey is measured by the peace it brings to your soul.',
      spots: [
        { name: "Kerala Backwaters", type: "Tranquil", img: img4 },
        { name: "Varkala Beach", type: "Coastal", img: img2 }
      ]
    },
    luxury: {
      id: 'luxury',
      label: 'The Luxury Seeker',
      tip: 'Indulge in the extraordinary. Every detail crafted for a life well-lived.',
      spots: [
        { name: "Udaipur Palaces", type: "Royal Heritage", img: img3 },
        { name: "Taj Falaknuma", type: "Opulence", img: img1 }
      ]
    }
  };

  return (
    <div className="planner-onboarding-page">
      <div className="planner-hero-bg">
          <div className="planner-bg-overlay"></div>
          <img src={img4} alt="Background" className="planner-bg-img" />
      </div>
      
      <div className="planner-container">
        {/* ── LEFT: EDITORIAL CONTENT ── */}
        <div className="planner-intro-section">
          <span className="planner-tagline">Premium Travel Planning</span>
          <h1 className="planner-main-title">
            Where to <em>next?</em>
          </h1>
          <p className="planner-subtitle">
            Our neural engine synthesizes local secrets and iconic landmarks into a bespoke, editorial-grade itinerary. Discover India like never before.
          </p>

          <div className="persona-selector">
            <h4 className="persona-title">Select your mood</h4>
            <div className="persona-tabs">
              {Object.values(personas).map((p) => (
                <button
                  key={p.id}
                  className={`persona-tab ${activePersona === p.id ? 'active' : ''}`}
                  onClick={() => setActivePersona(p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div 
                key={activePersona}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="persona-dynamic-content"
              >
                <p className="persona-tip">"{personas[activePersona].tip}"</p>
                
                <div className="featured-mini-list">
                    {personas[activePersona].spots.map((spot, i) => (
                      <div key={i} className="mini-spot-card">
                        <div className="mini-spot-img-wrap">
                          <img src={spot.img} alt={spot.name} />
                        </div>
                        <span className="mini-spot-name">{spot.name}</span>
                        <span className="mini-spot-type">{spot.type}</span>
                      </div>
                    ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── RIGHT: CRISP FORM CARD ── */}
        <div className="planner-form-section">
          <div className="planner-glass-card">
            <div className="planner-form-header">
                <h3>Odyssey Blueprint</h3>
                <p>Engineering your next great escape</p>
            </div>
            <PlannerForm onPlanGenerated={handlePlanGenerated} />
          </div>
          
          <div className="planner-trust-badges">
              <div className="trust-item">AI CONCIERGE</div>
              <div className="trust-item">INSTANT ACCESS</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Planner;
