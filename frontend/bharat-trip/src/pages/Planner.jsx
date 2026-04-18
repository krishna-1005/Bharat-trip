import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PlannerForm from "../components/Planner/PlannerForm";
import "./tripType.css"; // Reusing premium root styles
import "./planner.css";

import img2 from "../assets/images/img2.webp";
import img3 from "../assets/images/img3.webp";
import img4 from "../assets/images/img4.webp";
import img1 from "../assets/images/img1.webp";

function Planner() {
  const navigate = useNavigate();
  const [activePersona, setActivePersona] = useState('explorer');

  const handlePlanGenerated = (generatedPlan, planParams) => {
    // If we have a direct plan (old flow), save it. 
    // If we have params (new personalized flow), navigate with params.
    if (generatedPlan) {
      try {
        localStorage.setItem("tripPlan", JSON.stringify(generatedPlan));
      } catch (err) {
        console.warn("Could not save plan to localStorage:", err);
      }
      navigate("/results", { state: { plan: generatedPlan, isNew: true } });
    } else if (planParams) {
      // New personalized flow: Results.jsx will handle the quiz and API call
      navigate("/results", { state: { planParams, isNew: true } });
    }
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <div className="planner-onboarding-page tt-premium-root" style={{ paddingTop: '100px' }}>
      {/* Dynamic Background */}
      <div className="tt-bg-ambient">
        <div className="tt-blob tt-blob-1" style={{ background: '#3b82f6', top: '10%', left: '10%' }}></div>
        <div className="tt-blob tt-blob-2" style={{ background: '#8b5cf6', bottom: '10%', right: '10%' }}></div>
        <div className="tt-grid-overlay"></div>
      </div>

      <motion.div 
        className="planner-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ── LEFT: EDITORIAL CONTENT ── */}
        <motion.div className="planner-intro-section" variants={itemVariants}>
          <div className="tt-badge-ai">PREMIUM ENGINE</div>
          <h1 className="tt-main-title">
            Where to <span>next?</span>
          </h1>
          <p className="tt-subtitle">
            Our neural engine synthesizes local secrets and iconic landmarks into a bespoke, editorial-grade itinerary. Discover India like never before.
          </p>

          <div className="persona-selector">
            <h4 className="persona-title">SELECT YOUR VIBE</h4>
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
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
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
        </motion.div>

        {/* ── RIGHT: CRISP FORM CARD ── */}
        <motion.div className="planner-form-section" variants={itemVariants}>
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
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Planner;
