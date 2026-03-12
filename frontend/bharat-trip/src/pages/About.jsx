import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import "../styles/global.css";

export default function About() {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState(null);

  const stats = [
    { label: "Happy Travelers", value: "50,000+" },
    { label: "AI Plans Generated", value: "120,000+" },
    { label: "Destinations Covered", value: "450+" },
    { label: "Customer Rating", value: "4.9/5" },
  ];

  const faqs = [
    {
      q: "How does the AI Trip Planner work?",
      a: "Our AI analyzes millions of data points including local attractions, opening hours, traffic patterns, and user preferences to curate a logical, time-efficient itinerary just for you."
    },
    {
      q: "Is Bharat Trip free to use?",
      a: "Yes! The core trip planning and discovery features are completely free for all explorers."
    },
    {
      q: "Can I save my itineraries for offline use?",
      a: "Absolutely. Once you save a trip to your profile, you can access it anytime. We also provide a shareable link so you can access it on any device."
    }
  ];

  return (
    <div className="page about-page">
      <Navbar />
      
      {/* ── HERO SECTION ── */}
      <section className="about-hero">
        <div className="premium-badge">OUR STORY</div>
        <h1>Redefining Travel through <span className="highlight-blue">Intelligence</span></h1>
        <p className="large-text">
          Bharat Trip was born from a simple idea: that planning a journey should be as 
          exciting as the journey itself. We combine deep local insights with 
          cutting-edge AI to help you discover the true soul of India.
        </p>
      </section>

      {/* ── STATS SECTION ── */}
      <section className="about-stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="about-stat-card">
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* ── CORE VALUES ── */}
      <section className="about-section">
        <h2 className="section-title">Our Core Values</h2>
        <div className="page-grid">
          <div className="page-card interactive">
            <div className="card-icon">🎯</div>
            <h3>Hyper-Personalization</h3>
            <p>No two travelers are the same. We ensure your itinerary reflects your specific pace, budget, and vibes.</p>
          </div>
          <div className="page-card interactive">
            <div className="card-icon">🇮🇳</div>
            <h3>Local Authenticity</h3>
            <p>We go beyond the tourist traps, highlighting hidden gems and local secrets that make India unique.</p>
          </div>
          <div className="page-card interactive">
            <div className="card-icon">⚡</div>
            <h3>Efficiency</h3>
            <p>Save hours of research. Get a comprehensive, optimized travel plan in under 5 seconds.</p>
          </div>
        </div>
      </section>

      {/* ── FAQ SECTION ── */}
      <section className="about-section faq-section">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="faq-list">
          {faqs.map((faq, i) => (
            <div 
              key={i} 
              className={`faq-item ${activeFaq === i ? 'active' : ''}`}
              onClick={() => setActiveFaq(activeFaq === i ? null : i)}
            >
              <div className="faq-question">
                <span>{faq.q}</span>
                <span className="faq-icon">{activeFaq === i ? "−" : "+"}</span>
              </div>
              {activeFaq === i && (
                <div className="faq-answer">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── JOIN US SECTION ── */}
      <section className="about-cta">
        <h2>Ready to start your adventure?</h2>
        <p>Join thousands of travelers who plan their trips with Bharat Trip.</p>
        <div className="cta-buttons">
          <button className="pro-btn-primary" onClick={() => navigate("/planner")}>Start Planning</button>
          <button className="pro-btn-outline" onClick={() => navigate("/signup")}>Create Account</button>
        </div>
      </section>

      {/* ── FOOTER SPACING ── */}
      <div style={{ height: '80px' }}></div>
    </div>
  );
}