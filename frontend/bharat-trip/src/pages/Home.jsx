import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import MinimalReviewSection from "../components/MinimalReviewSection";
import ThreeScene from "../components/ThreeScene";
import "./home.css";

// Sample images for the India grid
import img1 from "../assets/images/img1.webp";
import img2 from "../assets/images/img2.webp";
import img3 from "../assets/images/img3.webp";
import img5 from "../assets/images/img5.webp";
import img6 from "../assets/images/img6.png";

function Home() {
  const navigate = useNavigate();
  const [heroImages, setHeroImages] = useState([img6, img1, img2, img3, img5]);

  useEffect(() => {
    // Reveal on scroll logic
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".reveal-on-scroll").forEach((el) => observer.observe(el));
    
    // Fetch Dynamic Site Config (Public)
    const fetchConfig = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/config/public`);
        if (!res.ok) throw new Error("API Error");
        const config = await res.json();
        if (config && config.homepage_images && Array.isArray(config.homepage_images) && config.homepage_images.length > 0) {
          setHeroImages(config.homepage_images);
        }
      } catch (err) {
        console.log("Using default assets");
      }
    };
    fetchConfig();
  }, []);

  const indiaGrid = [
    { name: "Goa", img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80" },
    { name: "Manali", img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80" },
    { name: "Kerala", img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80" },
    { name: "Jaipur", img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80" },
    { name: "Ladakh", img: "https://images.unsplash.com/photo-1581791534721-e599df4417f7?auto=format&fit=crop&w=800&q=80" },
    { name: "Rishikesh", img: "https://images.unsplash.com/photo-1590050752117-23a9d7f66d41?auto=format&fit=crop&w=800&q=80" },
  ];

  return (
    <div className="home-v3">
      
      {/* ── 1) HERO SECTION ── */}
      <section className="h3-hero">
        <div className="container h3-hero-grid">
          <div className="h3-hero-text reveal-on-scroll">
            <span className="h3-badge">✦ Smart Travel Era</span>
            <h1>Plan Trips <span className="gradient-text">Faster.</span> <br/>Decide Together.</h1>
            <p>Stop endless group discussions. Vote once, finalize instantly, and follow a clear trip plan.</p>
            
            <div className="h3-hero-btns">
              <button className="btn-premium primary lg" onClick={() => navigate("/planner")}>
                Start Planning
              </button>
              <button className="btn-premium outline lg" onClick={() => navigate("/create-poll")}>
                Create Poll
              </button>
            </div>
          </div>
          
          <div className="h3-hero-visual reveal-on-scroll">
            <div className="h3-visual-inner">
              <ThreeScene images={heroImages} />
              {/* Overlay glass element to simulate app UI preview */}
              <div className="h3-app-preview glass">
                <div className="preview-header">
                  <div className="dot red"></div><div className="dot yellow"></div><div className="dot green"></div>
                </div>
                <div className="preview-body">
                  <div className="preview-line long"></div>
                  <div className="preview-line med"></div>
                  <div className="preview-line short"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2) TRUST STRIP ── */}
      <div className="h3-trust-strip">
        <div className="container">
          <div className="h3-trust-items">
            <span>✓ No long discussions</span>
            <div className="dot-sep"></div>
            <span>✓ Instant group decisions</span>
            <div className="dot-sep"></div>
            <span>✓ Step-by-step trip guidance</span>
          </div>
        </div>
      </div>

      {/* ── 3) FEATURES SECTION ── */}
      <section className="h3-features reveal-on-scroll">
        <div className="container">
          <div className="h3-grid-2x2">
            {[
              { title: "Quick Group Voting", desc: "Create a poll and finalize decisions automatically.", icon: "🗳️" },
              { title: "AI Trip Planner", desc: "Generate structured travel plans instantly.", icon: "✨" },
              { title: "Guided Map View", desc: "Follow your trip step-by-step with clear directions.", icon: "🗺️" },
              { title: "Smart Trip Flow", desc: "Know where to go next without confusion.", icon: "🧭" }
            ].map((f, i) => (
              <div key={i} className="h3-feature-card glass">
                <div className="h3-f-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4) HOW IT WORKS ── */}
      <section className="h3-how reveal-on-scroll">
        <div className="container">
          <h2 className="h3-section-title">How It Works</h2>
          <div className="h3-how-flow">
            {[
              { t: "Create Poll", d: "Start your group" },
              { t: "Friends Vote", d: "Get consensus" },
              { t: "Decision Finalized", d: "Auto-magic" },
              { t: "Follow Plan", d: "Enjoy the trip" }
            ].map((s, i) => (
              <div key={i} className="h3-how-item">
                <div className="h3-how-circle">{i+1}</div>
                <h4>{s.t}</h4>
                <p>{s.d}</p>
                {i < 3 && <div className="h3-how-arrow">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5) INDIA DESTINATIONS ── */}
      <section className="h3-destinations reveal-on-scroll">
        <div className="container">
          <h2 className="h3-section-title">Explore <span className="gradient-text">Incredible India</span></h2>
          <div className="h3-india-grid">
            {indiaGrid.map((p, i) => (
              <div 
                key={i} 
                className="h3-india-card" 
                style={{ backgroundImage: `url(${p.img})` }}
                onClick={() => navigate("/planner", { state: { city: p.name } })}
              >
                <div className="h3-india-overlay">
                  <h3>{p.name}</h3>
                  <span>Plan Now ›</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7) FINAL CTA ── */}
      <section className="h3-final-cta reveal-on-scroll">
        <div className="container">
          <div className="h3-cta-box glass">
            <h2>Ready to plan your next trip?</h2>
            <button className="btn-premium primary lg" onClick={() => navigate("/planner")}>
              Start Now
            </button>
          </div>
        </div>
      </section>

      <MinimalReviewSection />
    </div>
  );
}

export default Home;
