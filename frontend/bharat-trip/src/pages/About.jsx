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

      {/* ── BENEFITS SECTION ── */}
      <section className="about-section">
        <h2 className="section-title">The Benefits of Choosing Me</h2>
        <div className="page-grid">
          <div className="page-card interactive">
            <div className="card-icon">🧘</div>
            <h3>Stress-free planning</h3>
            <p>Let me handle the planning, and you can focus on enjoying your trip.</p>
          </div>
          <div className="page-card interactive">
            <div className="card-icon">🗺️</div>
            <h3>Tailored experiences</h3>
            <p>Get customized recommendations that cater to your interests and preferences.</p>
          </div>
          <div className="page-card interactive">
            <div className="card-icon">⚡</div>
            <h3>Increased efficiency</h3>
            <p>Save time and effort in researching and planning your trip. I'll do the heavy lifting!</p>
          </div>
          <div className="page-card interactive">
            <div className="card-icon">💡</div>
            <h3>Improved decision-making</h3>
            <p>Make informed decisions with my expert guidance and local Bengaluru insights.</p>
          </div>
        </div>
      </section>

      {/* ── COMPARISON SECTION ── */}
      <section className="about-section comparison-section" style={{ background: 'var(--bg-panel)', borderRadius: '30px', padding: '60px 40px', marginTop: '40px' }}>
        <h2 className="section-title">Why choose me over generic AI tools?</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px', margin: '0 auto' }}>
          <div className="comparison-item">
            <strong>Contextual Understanding:</strong> I understand the nuances of travel planning and provide context-specific advice.
          </div>
          <div className="comparison-item">
            <strong>Human Touch:</strong> I offer a personalized, human-like experience to make planning enjoyable.
          </div>
          <div className="comparison-item">
            <strong>Accurate Information:</strong> I strive to provide reliable data, reducing the risk of misinformation.
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