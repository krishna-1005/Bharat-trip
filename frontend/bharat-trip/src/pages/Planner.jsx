import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PlannerForm from "../components/Planner/PlannerForm";
import "./planner.css";

import img2 from "../assets/images/img2.webp";
import img3 from "../assets/images/img3.webp";
import img4 from "../assets/images/img4.webp";

function Planner() {
  const navigate = useNavigate();
  const [activePersona, setActivePersona] = useState('explorer');

  const handlePlanGenerated = (generatedPlan) => {
    navigate("/results", { state: { plan: generatedPlan } });
  };

  const personas = {
    explorer: {
      id: 'explorer',
      icon: '🧭',
      label: 'The Explorer',
      tip: 'Pro Tip: Pack light and leave room in your itinerary for spontaneous detours. The best stories are unscripted.',
      spots: [
        { name: "Spiti Valley", type: "High Altitude", img: img3 },
        { name: "Meghalaya", type: "Living Bridges", img: img2 }
      ]
    },
    relaxer: {
      id: 'relaxer',
      icon: '🧘',
      label: 'The Relaxer',
      tip: 'Pro Tip: Focus on one region. Quality of experience beats quantity of destinations. Breathe in the local culture.',
      spots: [
        { name: "Kerala Backwaters", type: "Tranquil", img: img4 },
        { name: "Varkala Beach", type: "Coastal", img: img2 }
      ]
    },
    luxury: {
      id: 'luxury',
      icon: '💎',
      label: 'The Luxury Seeker',
      tip: 'Pro Tip: Book heritage hotels in Rajasthan for an authentic royal experience. Let the concierge handle the details.',
      spots: [
        { name: "Udaipur Palaces", type: "Royal Heritage", img: img3 },
        { name: "Taj Falaknuma", type: "Opulence", img: img4 }
      ]
    }
  };

  useEffect(() => {
      // Intersection Observer for reveal animations
      const observerOptions = { threshold: 0.1 };
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      }, observerOptions);
  
      document.querySelectorAll(".reveal-on-scroll").forEach(el => observer.observe(el));
      return () => observer.disconnect();
  }, []);

  return (
    <div className="planner-onboarding-page">
      {/* Cinematic Background */}
      <div className="planner-hero-bg">
          <div className="planner-bg-overlay"></div>
          <img src={img3} alt="Background" className="planner-bg-img" />
      </div>
      
      <div className="planner-container">
        {/* ── LEFT: INTRO ── */}
        <div className="planner-intro-section reveal-on-scroll">
          <div className="planner-tagline">
            <span className="pulse-dot"></span>
            AI-DRIVEN EXPLORATION
          </div>
          <h1 className="planner-main-title">
            Your Journey, <br />
            <span className="gradient-text">Intelligently</span> Crafted.
          </h1>
          <p className="planner-subtitle">
            Skip the generic guides. Our neural engine synthesizes local secrets and iconic landmarks into a seamless, personalized itinerary for you.
          </p>

          {/* NEW: INTERACTIVE PERSONA SELECTOR */}
          <div className="persona-selector">
            <h4 className="persona-title">What's your travel vibe?</h4>
            <div className="persona-tabs">
              {Object.values(personas).map((p) => (
                <button
                  key={p.id}
                  className={`persona-tab ${activePersona === p.id ? 'active' : ''}`}
                  onClick={() => setActivePersona(p.id)}
                >
                  <span className="persona-icon">{p.icon}</span>
                  <span className="persona-label">{p.label}</span>
                </button>
              ))}
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div 
                key={activePersona}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="persona-dynamic-content"
              >
                <div className="persona-tip">
                  <strong>{personas[activePersona].icon} </strong>
                  {personas[activePersona].tip}
                </div>
                
                <div className="planner-featured-strip">
                  <span className="strip-label">PERFECT FOR YOU</span>
                  <div className="featured-mini-list">
                    {personas[activePersona].spots.map((spot, i) => (
                      <div key={i} className="mini-spot-card">
                        <div className="mini-spot-img-wrap">
                          <img src={spot.img} alt={spot.name} />
                        </div>
                        <div className="mini-spot-content">
                          <span className="mini-spot-name">{spot.name}</span>
                          <span className="mini-spot-type">{spot.type}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── RIGHT: FORM CARD ── */}
        <div className="planner-form-section reveal-on-scroll" style={{ animationDelay: "0.2s" }}>
          <div className="planner-glass-card">
            <div className="planner-form-header">
                <h3>Start Your Adventure</h3>
                <p>Tell us your preferences to begin.</p>
            </div>
            <PlannerForm onPlanGenerated={handlePlanGenerated} />
          </div>
          
          <div className="planner-trust-badges">
              <div className="trust-item">
                  <span className="trust-icon" role="img" aria-label="secure">🔒</span>
                  <span>Secure & Private</span>
              </div>
              <div className="trust-item">
                  <span className="trust-icon" role="img" aria-label="fast">⚡</span>
                  <span>Instant Generation</span>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Planner;