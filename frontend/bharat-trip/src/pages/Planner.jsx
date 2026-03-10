import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
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

  const trendingDestinations = [
    { id: 1, name: "Goa Beaches",    tag: "COASTAL",   img: img2, desc: "Vibrant nightlife and sun-kissed shores." },
    { id: 2, name: "Varanasi Ghats", tag: "SPIRITUAL", img: img3, desc: "The eternal soul of ancient India."        },
    { id: 3, name: "Leh Ladakh",     tag: "ADVENTURE", img: img4, desc: "Breathtaking high-altitude vistas."        },
  ];

  return (
    <div className="planner-page">
      <Navbar />

      {/* ── HERO + FORM ── */}
      <section className="planner-hero-section">
        <div className="hero-overlay"></div>

        <div className="hero-content">
          {/* Left: headline */}
          <div className="hero-text-area">
            <span className="premium-badge">✨ PREMIUM TRAVEL EXPERIENCE</span>
            <h1>
              Experience India<br />
              <span className="highlight-blue">Like Never Before</span>
            </h1>
            <p>
              Discover hidden gems and curated itineraries
              tailored to your unique interests.
            </p>
          </div>

          {/* Right: planner form */}
          <div className="planner-form-container">
            <div className="glass-card">
              <h3>🤖 AI Trip Planner</h3>
              <PlannerForm onPlanGenerated={handlePlanGenerated} />
            </div>
          </div>
        </div>
      </section>

      {/* ── TRENDING DESTINATIONS ── */}
      <section className="trending-section">
        <div className="section-header">
          <h2>Trending Destinations</h2>
          <a href="/destinations" className="view-all">View all regions ↗</a>
        </div>

        <div className="destination-grid">
          {trendingDestinations.map((dest) => (
            <div key={dest.id} className="dest-card">
              <img src={dest.img} alt={dest.name} className="dest-image" />
              <div className="dest-info">
                <span className="dest-tag">{dest.tag}</span>
                <h3>{dest.name}</h3>
                <p>{dest.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Planner;