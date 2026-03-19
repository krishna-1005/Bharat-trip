import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import MinimalReviewSection from "../components/MinimalReviewSection";
import ThreeScene from "../components/ThreeScene";
import "./home.css";

// Assets fallback
import img1 from "../assets/images/img1.webp";
import img2 from "../assets/images/img2.webp";
import img3 from "../assets/images/img3.webp";
import img5 from "../assets/images/img5.webp";
import img6 from "../assets/images/img6.png";

function Home() {
  const navigate = useNavigate();
  const [heroImages, setHeroImages] = useState([img6, img1, img2, img3, img5]);
  const [scrollStep, setScrollStep] = useState(0);
  const splitRef = useRef(null);

  useEffect(() => {
    // Reveal on scroll
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

    // Split Scroll Logic
    const handleScroll = () => {
      if (!splitRef.current) return;
      const rect = splitRef.current.getBoundingClientRect();
      const progress = Math.min(Math.max(-rect.top / rect.height, 0), 1);
      
      if (progress < 0.33) setScrollStep(0);
      else if (progress < 0.66) setScrollStep(1);
      else setScrollStep(2);
    };

    window.addEventListener("scroll", handleScroll);

    // Fetch config
    const fetchConfig = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/config/public`);
        const config = await res.json();
        if (config?.homepage_images?.length > 0) setHeroImages(config.homepage_images);
      } catch (err) { console.log("Using defaults"); }
    };
    fetchConfig();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const destinations = [
    { name: "Goa", img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80", tag: "Tropical" },
    { name: "Ladakh", img: "https://images.unsplash.com/photo-1581791534721-e599df4417f7?auto=format&fit=crop&w=800&q=80", tag: "Adventure" },
    { name: "Kerala", img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80", tag: "Nature" },
    { name: "Varanasi", img: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80", tag: "Spiritual" },
    { name: "Manali", img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80", tag: "Mountains" },
  ];

  return (
    <div className="home-saas-premium">
      
      {/* ── 1) HERO SECTION (CENTERED) ── */}
      <section className="saas-hero">
        <div className="saas-hero-bg">
          <ThreeScene images={heroImages} />
          <div className="saas-hero-overlay"></div>
        </div>
        
        <div className="container saas-hero-content">
          <div className="reveal-on-scroll">
            <span className="saas-badge">✨ NEW: AI-POWERED GROUP DECISIONS</span>
            <h1 className="saas-title">Decide Trips <br/><span className="gradient-blue">in Seconds</span></h1>
            <p className="saas-subtitle">No more group chaos. Vote, finalize, and follow your trip smoothly with India's most advanced travel planner.</p>
            
            <div className="saas-hero-actions">
              <button className="btn-saas primary" onClick={() => navigate("/planner")}>
                Start Planning →
              </button>
              <button className="btn-saas ghost" onClick={() => navigate("/create-poll")}>
                Create Poll
              </button>
            </div>
          </div>

          {/* Floating UI Elements */}
          <div className="saas-floating-elements">
            <div className="saas-float-card poll-card glass reveal-on-scroll">
              <div className="float-icon">🗳️</div>
              <div className="float-text">
                <span className="label">Poll Active</span>
                <span className="val">Goa winning 70%</span>
              </div>
            </div>
            <div className="saas-float-card map-card glass reveal-on-scroll">
              <div className="float-icon">📍</div>
              <div className="float-text">
                <span className="label">Route Optmized</span>
                <span className="val">Baga → Anjuna</span>
              </div>
            </div>
            <div className="saas-float-card step-card glass reveal-on-scroll">
              <div className="float-icon">✨</div>
              <div className="float-text">
                <span className="label">Next Step</span>
                <span className="val">Check-in at 2 PM</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2) FLOATING FEATURE STRIP ── */}
      <section className="saas-feature-strip">
        <div className="container">
          <div className="strip-panel glass reveal-on-scroll">
            <div className="strip-item">
              <span className="icon">🗳️</span>
              <span className="text">Vote → Decision Done</span>
            </div>
            <div className="strip-sep"></div>
            <div className="strip-item">
              <span className="icon">🤖</span>
              <span className="text">AI builds your plan</span>
            </div>
            <div className="strip-sep"></div>
            <div className="strip-item">
              <span className="icon">🧭</span>
              <span className="text">Follow step-by-step</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4) SPLIT SCROLL SECTION ── */}
      <section ref={splitRef} className="saas-split-scroll">
        <div className="container split-wrapper">
          <div className="split-left">
            <div className="sticky-content">
              <div className={`split-text-block ${scrollStep === 0 ? 'active' : ''}`}>
                <span className="step-num">01</span>
                <h2>Create a poll</h2>
                <p>Start by asking your group where they want to go. No more endless WhatsApp debates.</p>
              </div>
              <div className={`split-text-block ${scrollStep === 1 ? 'active' : ''}`}>
                <span className="step-num">02</span>
                <h2>Decision gets finalized</h2>
                <p>Votes are locked and the winner is chosen automatically. Moving you to the next phase instantly.</p>
              </div>
              <div className={`split-text-block ${scrollStep === 2 ? 'active' : ''}`}>
                <span className="step-num">03</span>
                <h2>Follow your trip</h2>
                <p>A live, step-by-step map guide ensures everyone knows the plan. Real-time movement tracking.</p>
              </div>
            </div>
          </div>
          
          <div className="split-right">
            <div className="visual-stack">
              <div className={`visual-frame glass ${scrollStep === 0 ? 'visible' : ''}`}>
                <div className="mock-poll-ui">
                  <div className="mock-title">Select Destination</div>
                  <div className="mock-row active"><div className="bar" style={{width: '80%'}}></div><span>Goa</span></div>
                  <div className="mock-row"><div className="bar" style={{width: '40%'}}></div><span>Manali</span></div>
                </div>
              </div>
              <div className={`visual-frame glass ${scrollStep === 1 ? 'visible' : ''}`}>
                <div className="mock-result-ui">
                  <div className="check-circle">✓</div>
                  <h3>Decision Locked</h3>
                  <p>Destination: Goa</p>
                </div>
              </div>
              <div className={`visual-frame glass ${scrollStep === 2 ? 'visible' : ''}`}>
                <div className="mock-map-ui">
                  <div className="map-line"></div>
                  <div className="map-pin"></div>
                  <p>Arriving at Baga in 10m</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5) DESTINATION SHOWCASE ── */}
      <section className="saas-destinations reveal-on-scroll">
        <div className="container">
          <div className="section-head-saas">
            <h2>Handpicked <span className="gradient-blue">Odysseys</span></h2>
            <p>High-end curated destinations ready for your next decision.</p>
          </div>
        </div>
        
        <div className="saas-carousel-wrapper">
          <div className="saas-carousel-track">
            {destinations.map((d, i) => (
              <div 
                key={i} 
                className="saas-dest-card"
                onClick={() => navigate("/planner", { state: { city: d.name } })}
              >
                <img src={d.img} alt={d.name} />
                <div className="dest-overlay">
                  <span className="tag">{d.tag}</span>
                  <h3>{d.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6) CLEAN CTA ── */}
      <section className="saas-final-cta reveal-on-scroll">
        <div className="container">
          <div className="cta-saas-box glass">
            <h2>Ready to stop overthinking trips?</h2>
            <button className="btn-saas primary lg" onClick={() => navigate("/planner")}>
              Start Now →
            </button>
          </div>
        </div>
      </section>

      <MinimalReviewSection />
    </div>
  );
}

export default Home;
