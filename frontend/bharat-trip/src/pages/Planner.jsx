import React, { useEffect } from "react";
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

          <div className="planner-featured-strip">
            <span className="strip-label">MOST POPULAR THIS WEEK</span>
            <div className="featured-mini-list">
              {featuredSpots.map((spot, i) => (
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
        </div>

        {/* ── RIGHT: FORM CARD ── */}
        <div className="planner-form-section reveal-on-scroll" style={{ animationDelay: "0.2s" }}>
          <div className="planner-glass-card">
            <div className="card-top-accent"></div>
            <div className="planner-form-header">
                <h3>Start Your Adventure</h3>
                <p>Tell us your preferences to begin.</p>
            </div>
            <PlannerForm onPlanGenerated={handlePlanGenerated} />
          </div>
          
          <div className="planner-trust-badges">
              <div className="trust-item">
                  <span className="trust-icon">🔒</span>
                  <span>Secure & Private</span>
              </div>
              <div className="trust-item">
                  <span className="trust-icon">⚡</span>
                  <span>Instant Generation</span>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Planner;