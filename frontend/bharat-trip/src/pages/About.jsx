import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";

export default function About() {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState(null);

  const stats = [
    { label: "Happy Travelers", value: "50,000+" },
    { label: "AI Plans Generated", value: "120,000+" },
    { label: "Destinations Covered", value: "450+" },
    { label: "Customer Rating", value: "4.9/5" },
  ];

  const cityImages = [
    "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80"
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
    <div className="home-redesign">
      
      {/* ── HERO SECTION ── */}
      <section className="about-hero-section">
        <div className="container about-hero-grid">
          <div className="hero-content">
            <span className="section-label">Our Story</span>
            <h1>Redefining Travel through Intelligence</h1>
            <p>
              Bharat Trip was born from a simple idea: that planning a journey should be as 
              exciting as the journey itself. We combine deep local insights with 
              cutting-edge AI.
            </p>
          </div>
          <div className="hero-preview">
            <div className="hero-image-grid">
              {cityImages.map((img, i) => (
                <div key={i} className="hero-img-card">
                  <img src={img} alt="City" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS SECTION ── */}
      <section style={{ padding: '60px 0', background: 'var(--bg-card)' }}>
        <div className="container">
          <div className="features-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            {stats.map((s, i) => (
              <div key={i} className="feature-card" style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '2.5rem', color: 'var(--accent-blue)', marginBottom: '8px' }}>{s.value}</h3>
                <p style={{ fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ SECTION ── */}
      <section className="features-section">
        <div className="container" style={{ maxWidth: '800px' }}>
          <span className="section-label">Questions?</span>
          <h2>Frequently Asked Questions</h2>
          <div className="how-steps" style={{ textAlign: 'left', marginTop: '60px' }}>
            {faqs.map((faq, i) => (
              <div 
                key={i} 
                className="feature-card"
                style={{ cursor: 'pointer', marginBottom: '16px' }}
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0 }}>{faq.q}</h3>
                  <span style={{ fontSize: '1.5rem', color: 'var(--accent-blue)' }}>{activeFaq === i ? "−" : "+"}</span>
                </div>
                {activeFaq === i && (
                  <p style={{ marginTop: '16px', borderTop: '1px solid var(--border-main)', paddingTop: '16px' }}>{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── JOIN US SECTION ── */}
      <section className="final-cta">
        <div className="container cta-container">
          <h2>Ready to start your adventure?</h2>
          <div className="hero-actions" style={{ marginTop: '40px' }}>
            <button className="btn-primary" onClick={() => navigate("/planner")}>Start Planning</button>
            <button className="btn-secondary" onClick={() => navigate("/signup")}>Create Account</button>
          </div>
        </div>
      </section>

    </div>
  );
}
