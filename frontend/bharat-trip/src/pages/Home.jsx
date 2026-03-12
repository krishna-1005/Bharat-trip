import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useSettings } from "../context/SettingsContext";
import "./home.css";
import img1 from "../assets/images/img1.webp";
import img2 from "../assets/images/img2.webp";
import img3 from "../assets/images/img3.webp";
import img5 from "../assets/images/img5.webp";
import img6 from "../assets/images/img6.png";
import TravelBot from "../components/TravelBot";

function Home() {
  const navigate = useNavigate();
  const { t } = useSettings();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const galleryRef = useRef(null);

  useEffect(() => {
    const handleMove = (xPos, yPos) => {
      const x = (xPos / window.innerWidth - 0.5) * 30;
      const y = (yPos / window.innerHeight - 0.5) * 30;
      
      document.documentElement.style.setProperty("--parallax-x", `${x}px`);
      document.documentElement.style.setProperty("--parallax-y", `${y}px`);
      
      if (galleryRef.current) {
        galleryRef.current.style.transform = `rotateY(${x * 0.5}deg) rotateX(${-y * 0.5}deg)`;
      }
    };

    const onMouseMove = (e) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  return (
    <div className="home">
      
      {/* ── HERO SECTION ── */}
      <section id="home" className="hero">
        
        {/* LEFT TEXT CONTENT */}
        <div className="hero-text">
          <div className="hero-content-reveal">
            <span className="premium-badge">
              <span className="pulse-dot"></span>
              NEXT-GEN AI TRAVEL
            </span>

            <h1 className="main-title">
              {t("home_hero_title").split(" ").map((word, i) => (
                <span key={i} className="title-word">{word} </span>
              ))}
            </h1>

            <p className="hero-description">
              {t("home_hero_sub")}
            </p>

            {/* HERO SEARCH BAR */}
            <div className="hero-search-container">
              <form className="hero-search-form" onSubmit={(e) => {
                e.preventDefault();
                const q = e.target.search.value;
                if (q.trim()) navigate(`/search?q=${encodeURIComponent(q)}`);
              }}>
                <div className="hero-search-input-wrap">
                  <span className="search-icon">🔍</span>
                  <input 
                    name="search"
                    type="text" 
                    placeholder="Search destinations, landmarks, or cities..." 
                    className="hero-search-input"
                  />
                  <button type="submit" className="hero-search-btn">Explore</button>
                </div>
              </form>
            </div>

            <div className="hero-actions">
              <button className="btn-premium-primary" onClick={() => navigate("/planner")}>
                <span className="btn-text">{t("plan_trip_btn")}</span>
                <span className="btn-icon">→</span>
              </button>
              <Link to="/sample-plan" className="btn-premium-outline">
                {t("view_samples_btn")}
              </Link>
            </div>
          </div>
        </div>

        {/* RIGHT VISUAL */}
        <div className="hero-visual">
          <div className="gallery-container" ref={galleryRef}>
            {/* Main Centerpiece */}
            <div 
              className={`gallery-card main-feat ${hoveredCard === 'main' ? 'active' : ''}`}
              onMouseEnter={() => setHoveredCard('main')}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => setHoveredCard(hoveredCard === 'main' ? null : 'main')} // Toggle for mobile
            >
              <img src={img6} alt="Vibrant Bangalore" />
              <div className="card-overlay">
                <span className="card-tag">Featured</span>
                <h4>Vidhana Soudha</h4>
              </div>
            </div>

            {/* Floating Cards */}
            <div className="floating-elements">
              <div className="float-card c1">
                <img src={img1} alt="Cubbon Park" />
              </div>
              <div className="float-card c2">
                <img src={img2} alt="Iskcon" />
              </div>
              <div className="float-card c3">
                <img src={img3} alt="Nandi Hills" />
              </div>
              <div className="float-card c4">
                <img src={img5} alt="Nightlife" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LIVE TRAVEL INDEX MARQUEE ── */}
      <div className="live-index-marquee">
        <div className="marquee-content">
          {[...Array(2)].map((_, j) => (
            <div key={j} style={{ display: "flex", gap: "20px" }}>
              <div className="marquee-item"><span className="status-dot excellent"></span> Bengaluru: 24°C • Tech Parks & Cafes</div>
              <div className="marquee-item"><span className="status-dot good"></span> Goa: 29°C • Beach Weather</div>
              <div className="marquee-item"><span className="status-dot fair"></span> Mumbai: 31°C • Moderate Crowds</div>
              <div className="marquee-item"><span className="status-dot excellent"></span> Jaipur: 22°C • Heritage Walks</div>
              <div className="marquee-item"><span className="status-dot excellent"></span> Manali: 15°C • Clear Skies</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── TRAVEL VIBE SELECTOR ── */}
      <section id="why-choose" className="travel-vibe-section">
        <div className="section-head">
          <h2 className="reveal-text">Discover Your <span className="gradient-text">Travel Vibe</span></h2>
          <p>Not sure where to go? Pick a mood and let our AI do the rest.</p>
        </div>
        <div className="vibe-grid">
          {[
            { icon: "🧘‍♂️", title: "Soul Searching", desc: "Temples & Peace" },
            { icon: "🏔️", title: "Adrenaline", desc: "Treks & Heights" },
            { icon: "🍜", title: "Foodie Heaven", desc: "Street Eats & Spices" },
            { icon: "🏛️", title: "Time Traveler", desc: "Forts & History" },
            { icon: "🌴", title: "Beach Bum", desc: "Sun & Sand" }
          ].map((vibe, i) => (
            <div key={i} className="vibe-card" onClick={() => navigate("/planner")}>
              <span className="vibe-icon">{vibe.icon}</span>
              <span className="vibe-title">{vibe.title}</span>
              <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>{vibe.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <div className="stats-strip">
        <div className="stat-item">
          <span className="stat-num">42k+</span>
          <span className="stat-label">Locations</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <span className="stat-num">98%</span>
          <span className="stat-label">Accuracy</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <span className="stat-num">2sec</span>
          <span className="stat-label">Generation</span>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="how-it-works">
        <div className="section-head">
          <h2 className="reveal-text">Plan Smarter, <span className="gradient-text">Travel Better</span></h2>
          <p>Everything you need to navigate India's most dynamic city.</p>
        </div>
        <div className="features-grid">
          <div className="feature-premium-card">
            <h3>Instant Itinerary</h3>
            <p>Our LLM analyzes millions of data points to create your perfect day-by-day plan.</p>
          </div>
          <div className="feature-premium-card">
            <h3>Real-time Budgets</h3>
            <p>No more surprises. Get accurate estimates for entry fees, transport, and meals.</p>
          </div>
          <div className="feature-premium-card">
            <h3>Route Optimization</h3>
            <p>Smart sequencing that avoids traffic hotspots and maximizes your sightseeing time.</p>
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="cta-premium">
        <div className="cta-glow"></div>
        <div className="cta-content">
          <h2>Ready for your next adventure?</h2>
          <p>Join the community of travelers redefining how India is explored.</p>
          <button className="btn-cta" onClick={() => navigate("/planner")}>Get Started Now</button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer id="footer" className="premium-footer">
        <div className="footer-main">
          <div className="footer-brand">
            <h3>Bharat Trip</h3>
            <p>Crafting memories across the Indian subcontinent with cutting-edge AI.</p>
          </div>
          <div className="footer-links">
            <div className="link-col">
              <h4>Company</h4>
              <Link to="/about">About Us</Link>
              <Link to="/destinations">Destinations</Link>
              <Link to="/sample-plan">Sample Plans</Link>
            </div>
            <div className="link-col">
              <h4>Support</h4>
              <Link to="/help">Help Center</Link>
              <Link to="/contact">Contact Us</Link>
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2024 BharatTrip AI • Designed for the modern explorer</span>
        </div>
      </footer>

      {/* CHATBOT */}
      <TravelBot isOpen={chatOpen} setIsOpen={setChatOpen} />
    </div>
  );
}

export default Home;