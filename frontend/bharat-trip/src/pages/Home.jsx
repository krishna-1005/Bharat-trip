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
import ThreeScene from "../components/ThreeScene";
import TravelAnimation from "../components/TravelAnimation";
import Interactive3DIcon from "../components/Interactive3DIcon";

function Home() {
  const navigate = useNavigate();
  const { t } = useSettings();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const galleryRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth - 0.5) * 30;
      const y = (clientY / window.innerHeight - 0.5) * 30;
      
      document.documentElement.style.setProperty("--parallax-x", `${x}px`);
      document.documentElement.style.setProperty("--parallax-y", `${y}px`);
      
      if (galleryRef.current) {
        galleryRef.current.style.transform = `rotateY(${x * 0.5}deg) rotateX(${-y * 0.5}deg)`;
      }
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="home">
      <ThreeScene />
      
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

        {/* RIGHT INTERACTIVE 3D VISUAL */}
        <div className="hero-visual">
          <div className="flight-3d-container">
            <TravelAnimation />
          </div>
          
          <div className="gallery-container" ref={galleryRef}>
            {/* Main Centerpiece */}
            <div 
              className={`gallery-card main-feat ${hoveredCard === 'main' ? 'active' : ''}`}
              onMouseEnter={() => setHoveredCard('main')}
              onMouseLeave={() => setHoveredCard(null)}
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
                <img src={
                  img1} alt="Cubbon Park" />
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
            <div key={j} style={{ display: "flex", gap: "40px" }}>
              <div className="marquee-item"><span className="status-dot excellent"></span> Bengaluru: 24°C • Perfect for Tech Parks & Cafes</div>
              <div className="marquee-item"><span className="status-dot good"></span> Goa: 29°C • Ideal Beach Weather</div>
              <div className="marquee-item"><span className="status-dot fair"></span> Mumbai: 31°C • Moderate Crowds</div>
              <div className="marquee-item"><span className="status-dot excellent"></span> Jaipur: 22°C • Great for Heritage Walks</div>
              <div className="marquee-item"><span className="status-dot excellent"></span> Manali: 15°C • Clear Skies</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── TRAVEL VIBE SELECTOR ── */}
      <section className="travel-vibe-section">
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
              <span style={{ fontSize: "12px", color: "var(--p-muted)" }}>{vibe.desc}</span>
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
            <div className="feat-3d-icon">
              <Interactive3DIcon color="#3b82f6" size={1.2} />
            </div>
            <h3>Instant Itinerary</h3>
            <p>Our LLM analyzes millions of data points to create your perfect day-by-day plan.</p>
          </div>
          <div className="feature-premium-card">
            <div className="feat-3d-icon">
              <Interactive3DIcon color="#a855f7" size={1.2} />
            </div>
            <h3>Real-time Budgets</h3>
            <p>No more surprises. Get accurate estimates for entry fees, transport, and meals.</p>
          </div>
          <div className="feature-premium-card">
            <div className="feat-3d-icon">
              <Interactive3DIcon color="#10b981" size={1.2} />
            </div>
            <h3>Route Optimization</h3>
            <p>Smart sequencing that avoids traffic hotspots and maximizes your sightseeing time.</p>
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="cta-premium">
        <div className="cta-glow"></div>
        <div className="cta-3d-background">
           <Interactive3DIcon color="#f59e0b" size={2.5} />
        </div>
        <div className="cta-content">
          <h2>Ready for your next adventure?</h2>
          <p>Join the community of travelers redefining how India is explored.</p>
          <button className="btn-cta" onClick={() => navigate("/planner")}>Get Started Now</button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="premium-footer">
        <div className="footer-3d-layer">
           <Interactive3DIcon color="#334155" size={4} />
        </div>
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
            </div>
            <div className="link-col">
              <h4>Support</h4>
              <Link to="/contact">Help Center</Link>
              <Link to="/privacy">Privacy</Link>
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