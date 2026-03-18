import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useSettings } from "../context/SettingsContext";
import MinimalReviewSection from "../components/MinimalReviewSection";
import ThreeScene from "../components/ThreeScene";
import "./home.css";
import img1 from "../assets/images/img1.webp";
import img2 from "../assets/images/img2.webp";
import img3 from "../assets/images/img3.webp";
import img5 from "../assets/images/img5.webp";
import img6 from "../assets/images/img6.png";

function Home() {
  const navigate = useNavigate();
  const { t } = useSettings();
  const [hoveredCard, setHoveredCard] = useState(null);
  const galleryRef = useRef(null);

  useEffect(() => {
    // Parallax logic
    const handleMove = (xPos, yPos) => {
      const x = (xPos / window.innerWidth - 0.5) * 30;
      const y = (yPos / window.innerHeight - 0.5) * 30;
      document.documentElement.style.setProperty("--parallax-x", `${x}px`);
      document.documentElement.style.setProperty("--parallax-y", `${y}px`);
      if (galleryRef.current) {
        galleryRef.current.style.transform = `rotateY(${x * 0.5}deg) rotateX(${-y * 0.5}deg)`;
      }
    };

    const onMouseMove = (e) => {
      handleMove(e.clientX, e.clientY);
      // Update glow positions for cards
      document.querySelectorAll(".premium-card").forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
      });
    };
    
    const onTouchMove = (e) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    // Intersection Observer for reveal animations
    const observerOptions = { threshold: 0.15 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
        }
      });
    }, observerOptions);

    document.querySelectorAll(".reveal-on-scroll").forEach(el => observer.observe(el));
    
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="home">
      
      {/* ── HERO SECTION ── */}
      <section id="home" className="hero">
        <div className="hero-text">
          <div className="hero-content-reveal">
            <span className="premium-badge">
              <span className="pulse-dot"></span>
              NEXT-GEN AI TRAVEL
            </span>

            <h1 className="main-title">
              Crafting <span className="gradient-text">India</span>'s Finest Journeys
            </h1>

            <p className="hero-description">
              Experience the future of exploration. Our AI doesn't just plan trips; it crafts personalized memories tailored to your unique travel style.
            </p>

            {/* HERO SEARCH BAR */}
            <div className="hero-search-container">
              <form className="hero-search-form" onSubmit={(e) => {
                e.preventDefault();
                const q = e.target.search.value;
                if (q.trim()) navigate(`/search?q=${encodeURIComponent(q)}`);
              }}>
                <div className="hero-search-input-wrap">
                  <input 
                    name="search"
                    type="text" 
                    placeholder="Where should we take you next?" 
                    className="hero-search-input"
                  />
                  <button type="submit" className="hero-search-btn">Explore Now</button>
                </div>
              </form>
            </div>

            <div className="hero-actions">
              <button className="btn-premium primary" onClick={() => navigate("/planner")}>
                Start AI Planner →
              </button>
              <Link to="/sample-plan" className="btn-premium outline">
                View Collections
              </Link>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <ThreeScene images={[img6, img1, img2, img3, img5]} />
        </div>
      </section>

      {/* ── LIVE TICKER ── */}
      <div className="live-index-marquee">
        <div className="marquee-content">
          <div className="marquee-group">
            <div className="marquee-item"><span className="pulse-dot"></span> BENGALURU: 24°C • PERFECT FOR PARKS</div>
            <div className="marquee-item"><span className="pulse-dot"></span> GOA: 28°C • PEAK BEACH VIBES</div>
            <div className="marquee-item"><span className="pulse-dot"></span> JAIPUR: 22°C • ROYAL HERITAGE SEASON</div>
            <div className="marquee-item"><span className="pulse-dot"></span> MANALI: 12°C • SNOW TREK WINDOW OPEN</div>
          </div>
          {/* Duplicate for infinite effect */}
          <div className="marquee-group">
            <div className="marquee-item"><span className="pulse-dot"></span> BENGALURU: 24°C • PERFECT FOR PARKS</div>
            <div className="marquee-item"><span className="pulse-dot"></span> GOA: 28°C • PEAK BEACH VIBES</div>
            <div className="marquee-item"><span className="pulse-dot"></span> JAIPUR: 22°C • ROYAL HERITAGE SEASON</div>
            <div className="marquee-item"><span className="pulse-dot"></span> MANALI: 12°C • SNOW TREK WINDOW OPEN</div>
          </div>
        </div>
      </div>

      {/* ── VIBE SECTION ── */}
      <section id="why-choose" className="travel-vibe-section reveal-on-scroll">
        <div className="section-head">
          <h2>Find Your <span className="gradient-text">Vibe</span></h2>
          <p>Our AI analyzes your mood to suggest the perfect destination.</p>
        </div>
        <div className="vibe-grid">
          {[
            { icon: "🧘‍♂️", title: "Soul Searching", desc: "Serene Temples & Peace" },
            { icon: "🏔️", title: "Adrenaline", desc: "Untamed Treks & Heights" },
            { icon: "🍜", title: "Foodie Heaven", desc: "Culinary Heritage Tours" },
            { icon: "🏛️", title: "Time Traveler", desc: "Imperial Forts & History" },
            { icon: "🌴", title: "Beach Bum", desc: "Tropical Sun & Azure Seas" }
          ].map((vibe, i) => (
            <div key={i} className="premium-card vibe-card" onClick={() => navigate("/planner")}>
              <span className="vibe-icon">{vibe.icon}</span>
              <span className="vibe-title">{vibe.title}</span>
              <span style={{ fontSize: "14px", color: "var(--text-dim)" }}>{vibe.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS SECTION ── */}
      <div className="stats-strip reveal-on-scroll">
        <div className="stat-item">
          <span className="stat-num">42k+</span>
          <span className="stat-label">EXPLORED POINTS</span>
        </div>
        <div className="stat-item">
          <span className="stat-num">99.2%</span>
          <span className="stat-label">CLIENT SATISFACTION</span>
        </div>
        <div className="stat-item">
          <span className="stat-num">2ms</span>
          <span className="stat-label">AI RESPONSE TIME</span>
        </div>
      </div>

      {/* ── WHY BHARAT TRIP ── */}
      <section className="why-us-section reveal-on-scroll">
        <div className="section-head">
          <h2>Why <span className="gradient-text">BharatTrip</span></h2>
          <p>The convergence of advanced intelligence and human wanderlust.</p>
        </div>
        <div className="why-us-grid">
          <div className="premium-card why-us-card">
            <div className="why-icon">🎯</div>
            <h3>Hyper-Personalization</h3>
            <p>Every itinerary is mathematically optimized for your specific preferences, pacing, and interests.</p>
          </div>
          <div className="premium-card why-us-card">
            <div className="why-icon">🏘️</div>
            <h3>Local Intelligence</h3>
            <p>Go beyond the surface. Access deep-layer insights into hidden cultural gems across India.</p>
          </div>
          <div className="premium-card why-us-card">
            <div className="why-icon">✨</div>
            <h3>Seamless Experience</h3>
            <p>From conception to execution, we provide a unified interface for your entire travel lifecycle.</p>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="how-it-works reveal-on-scroll">
        <div className="section-head">
          <h2>Intelligence <span className="gradient-text">in Motion</span></h2>
          <p>Revolutionizing the way you discover the subcontinent.</p>
        </div>
        <div className="features-grid">
          <div className="premium-card feature-premium-card">
            <h3>Neural Planning</h3>
            <p>Our LLM models simulate your journey to eliminate bottlenecks and maximize discovery.</p>
          </div>
          <div className="premium-card feature-premium-card">
            <h3>Dynamic Budgets</h3>
            <p>Live market data integration ensures your financial planning is as precise as your route.</p>
          </div>
          <div className="premium-card feature-premium-card">
            <h3>Real-time Logic</h3>
            <p>Adaptive routing that responds to local conditions, ensuring a frictionless adventure.</p>
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="cta-premium reveal-on-scroll">
        <div className="cta-content">
          <h2>Your Odyssey Begins Now</h2>
          <p>Step into the new era of travel. Let BharatTrip AI be your guide to the extraordinary.</p>
          <button className="btn-cta" onClick={() => navigate("/planner")}>Begin Exploration</button>
        </div>
      </section>

      {/* ── REVIEWS SECTION ── */}
      <div className="reveal-on-scroll">
        <MinimalReviewSection />
      </div>

    </div>
  );
}

export default Home;
