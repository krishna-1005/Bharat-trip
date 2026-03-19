import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import MinimalReviewSection from "../components/MinimalReviewSection";
import "./home.css";

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      { threshold: 0.05 }
    );

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
  }, []);

  const indiaPlaces = [
    { name: "Goa", img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80", tag: "Beach" },
    { name: "Manali", img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80", tag: "Mountains" },
    { name: "Kerala", img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80", tag: "Backwaters" },
    { name: "Jaipur", img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80", tag: "Heritage" },
    { name: "Ladakh", img: "https://images.unsplash.com/photo-1581791534721-e599df4417f7?auto=format&fit=crop&w=600&q=80", tag: "Adventure" },
    { name: "Rishikesh", img: "https://images.unsplash.com/photo-1590050752117-23a9d7f66d41?auto=format&fit=crop&w=600&q=80", tag: "Spiritual" },
  ];

  return (
    <div className="home-mobile-first">
      
      {/* ── 1) HERO SECTION ── */}
      <section className="mobile-hero reveal">
        <div className="hero-text-wrap">
          <span className="mobile-badge">✨ AI Travel Assistant</span>
          <h1>Plan Trips <span className="gradient-text">Faster</span></h1>
          <p>Vote, plan, and follow your trip without confusion.</p>
          
          <div className="mobile-hero-btns">
            <button className="btn-mobile primary" onClick={() => navigate("/planner")}>
              Start Planning
            </button>
            <button className="btn-mobile secondary" onClick={() => navigate("/create-poll")}>
              Create Poll
            </button>
          </div>
        </div>
      </section>

      {/* ── 2) IMAGE SECTION (SWIPEABLE) ── */}
      <section className="mobile-carousel reveal">
        <div className="carousel-track">
          {indiaPlaces.map((p, i) => (
            <div key={i} className="carousel-item" style={{ backgroundImage: `url(${p.img})` }}>
              <div className="item-overlay">
                <span>{p.tag}</span>
                <h4>{p.name}</h4>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3) PROBLEM SECTION ── */}
      <section className="mobile-problem reveal">
        <h3>Group trips are <span className="highlight-red">messy</span></h3>
        <div className="problem-pills">
          <span>Too many opinions</span>
          <span>No clear plan</span>
          <span>Endless chats</span>
        </div>
      </section>

      {/* ── 4) FEATURES (CARD LAYOUT) ── */}
      <section className="mobile-features">
        <div className="features-stack">
          {[
            { title: "Quick Voting", desc: "Finalize locations in seconds", icon: "🗳️" },
            { title: "AI Planner", desc: "Personalized routes & timing", icon: "✨" },
            { title: "Guided Map", desc: "Know exactly where to go", icon: "🗺️" },
            { title: "Step-by-Step", desc: "No confusion, just movement", icon: "🧭" }
          ].map((f, i) => (
            <div key={i} className="m-feature-card glass reveal">
              <span className="m-f-icon">{f.icon}</span>
              <div className="m-f-text">
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5) HOW IT WORKS ── */}
      <section className="mobile-how reveal">
        <h3>How it Works</h3>
        <div className="how-steps">
          {[
            { step: "Create poll", icon: "📱" },
            { step: "Vote", icon: "✔️" },
            { step: "Plan", icon: "🤖" },
            { step: "Follow", icon: "📍" }
          ].map((s, i) => (
            <div key={i} className="how-step-item">
              <div className="how-circle">{s.icon}</div>
              <p>{s.step}</p>
              {i < 3 && <div className="how-arrow">↓</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ── 6) INDIA EXPLORE (GRID 2X2) ── */}
      <section className="mobile-grid-section reveal">
        <h3>Explore India</h3>
        <div className="mobile-2x2-grid">
          {indiaPlaces.slice(0, 4).map((p, i) => (
            <div 
              key={i} 
              className="m-grid-card" 
              style={{ backgroundImage: `url(${p.img})` }}
              onClick={() => navigate("/planner", { state: { city: p.name } })}
            >
              <div className="m-grid-overlay">
                <p>{p.name}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 7) FINAL CTA ── */}
      <section className="mobile-cta reveal">
        <div className="cta-glass glass">
          <h2>Ready to plan?</h2>
          <button className="btn-mobile primary" onClick={() => navigate("/planner")}>
            Start Now
          </button>
        </div>
      </section>

      <MinimalReviewSection />
    </div>
  );
}

export default Home;
