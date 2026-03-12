import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useSettings } from "../context/SettingsContext";
import "./home.css";
import img1 from "../assets/images/img1.webp";
import img2 from "../assets/images/img2.webp";
import img3 from "../assets/images/img3.webp";
import img4 from "../assets/images/img4.webp";
import img5 from "../assets/images/img5.webp";
import img6 from "../assets/images/img6.png";
import TravelBot from "../components/TravelBot";
import ThreeScene from "../components/ThreeScene";
import Interactive3DIcon from "../components/Interactive3DIcon";

function Home() {
  const navigate = useNavigate();
  const { t } = useSettings();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    // Parallax Effect
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth - 0.5) * 30;
      const y = (clientY / window.innerHeight - 0.5) * 30;
      
      document.documentElement.style.setProperty("--mouse-x", `${clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${clientY}px`);
      document.documentElement.style.setProperty("--parallax-x", `${x}px`);
      document.documentElement.style.setProperty("--parallax-y", `${y}px`);
    };
    
    // Intersection Observer for Scroll Reveal
    const observerOptions = {
      threshold: 0.15,
      rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll(".reveal-on-scroll");
    revealElements.forEach(el => observer.observe(el));

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      revealElements.forEach(el => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="home">
      {/* ── BACKGROUND THREE.JS SCENE ── */}
      <ThreeScene />

      {/* ── HERO SECTION ── */}
      <section id="home" className="hero">
        
        {/* LEFT TEXT CONTENT */}
        <div className="hero-text reveal-on-scroll">
          <div className="hero-content-reveal">
            <span className="premium-badge">
              <span className="pulse-dot"></span>
              ULTIMATE BENGALURU GUIDE
            </span>

            <h1 className="main-title">
              {t("home_hero_title").split(" ").map((word, i) => (
                <span key={i} className="title-word">{word} </span>
              ))}
            </h1>

            <p className="hero-description">
              Experience the Silicon Valley of India like never before. From heritage palaces to lush parks and vibrant nightlife, plan your perfect Bengaluru escape.
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

            <div className="trust-meter">
              <div className="avatars-group">
                {[1,2,3,4].map(i => <div key={i} className={`avatar-pill av-${i}`}></div>)}
                <div className="avatar-count">+15k</div>
              </div>
              <span className="trust-text">Trusted by 15,000+ travelers in Bengaluru</span>
            </div>
          </div>
        </div>

        {/* RIGHT INTERACTIVE IMAGE GALLERY */}
        <div className="hero-visual reveal-on-scroll">
          <div className="gallery-container">
            
            {/* Main Centerpiece */}
            <div 
              className={`gallery-card main-feat ${hoveredCard === 'main' ? 'active' : ''}`}
              onMouseEnter={() => setHoveredCard('main')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <img src={img6} alt="Vidhana Soudha Bengaluru" />
              <div className="card-overlay">
                <span className="card-tag">Iconic Landmark</span>
                <h4>Vidhana Soudha</h4>
              </div>
            </div>

            {/* Floating Cards */}
            <div className="floating-elements">
              <div className="float-card c1">
                <img src={img1} alt="Cubbon Park" />
                <div className="mini-label">Cubbon Park</div>
              </div>
              <div className="float-card c2">
                <img src={img2} alt="Iskcon Temple" />
                <div className="mini-label">Iskcon Temple</div>
              </div>
              <div className="float-card c3">
                <img src={img3} alt="Nandi Hills" />
                <div className="mini-label">Nandi Hills</div>
              </div>
              <div className="float-card c4">
                <img src={img5} alt="MG Road Nightlife" />
                <div className="mini-label">Brigade Road</div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="decor-circle"></div>
            <div className="decor-grid"></div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <div className="stats-strip reveal-on-scroll">
        <div className="stat-item">
          <span className="stat-num">500+</span>
          <span className="stat-label">Local Spots</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <span className="stat-num">100%</span>
          <span className="stat-label">AI Powered</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <span className="stat-num">24/7</span>
          <span className="stat-label">Live Support</span>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="how-it-works reveal-on-scroll">
        <div className="section-head">
          <h2 className="reveal-text">Explore the <span className="gradient-text">Garden City</span></h2>
          <p>Seamlessly navigate through Bangalore's unique blend of culture and technology.</p>
        </div>
        <div className="features-grid">
          <div className="feature-premium-card reveal-on-scroll">
            <div className="feat-3d-icon">
              <Interactive3DIcon color="#3b82f6" size={1.5} />
            </div>
            <h3>Smart Itinerary</h3>
            <p>Our AI crafts the best routes considering Bangalore's infamous traffic patterns.</p>
          </div>
          <div className="feature-premium-card reveal-on-scroll">
            <div className="feat-3d-icon">
              <Interactive3DIcon color="#a855f7" size={1.5} />
            </div>
            <h3>Local Insights</h3>
            <p>Discover hidden gems in Indiranagar, Koramangala, and beyond.</p>
          </div>
          <div className="feature-premium-card reveal-on-scroll">
            <div className="feat-3d-icon">
              <Interactive3DIcon color="#10b981" size={1.5} />
            </div>
            <h3>Cost Estimator</h3>
            <p>Get real-time price ranges for cafes, pubs, and entry tickets across the city.</p>
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="cta-premium reveal-on-scroll">
        <div className="cta-glow"></div>
        <div className="cta-3d-background">
           <Interactive3DIcon color="#f59e0b" size={3.5} />
        </div>
        <div className="cta-content">
          <h2>Ready to explore Bengaluru?</h2>
          <p>Start planning your customized trip to the heart of Karnataka today.</p>
          <button className="btn-cta" onClick={() => navigate("/planner")}>Plan My Bangalore Trip</button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="premium-footer reveal-on-scroll">
        <div className="footer-3d-layer">
           <Interactive3DIcon color="#334155" size={5} />
        </div>
        <div className="footer-main">
          <div className="footer-brand">
            <h3>Bharat Trip</h3>
            <p>Your ultimate companion for exploring the diverse landscapes of India, starting with the vibrant city of Bangalore.</p>
          </div>
          <div className="footer-links">
            <div className="link-col">
              <h4>Explore</h4>
              <Link to="/about">Heritage</Link>
              <Link to="/destinations">Parks</Link>
              <Link to="/destinations">Nightlife</Link>
            </div>
            <div className="link-col">
              <h4>Support</h4>
              <Link to="/contact">Contact Us</Link>
              <Link to="/privacy">Privacy Policy</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2024 BharatTrip AI • Crafted for Bengaluru Explorers</span>
        </div>
      </footer>

      {/* CHATBOT */}
      <TravelBot isOpen={chatOpen} setIsOpen={setChatOpen} />
    </div>
  );
}

export default Home;