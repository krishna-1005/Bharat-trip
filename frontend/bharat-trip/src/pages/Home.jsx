import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import MinimalReviewSection from "../components/MinimalReviewSection";
import ThreeScene from "../components/ThreeScene";
import "./home.css";

// Sample images for the carousel
import img1 from "../assets/images/img1.webp";
import img2 from "../assets/images/img2.webp";
import img3 from "../assets/images/img3.webp";
import img5 from "../assets/images/img5.webp";
import img6 from "../assets/images/img6.png";

function Home() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [heroImages, setHeroImages] = useState([img6, img1, img2, img3, img5]);
  const stepsRef = useRef([]);

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
      const scrollPos = window.scrollY + window.innerHeight / 2;
      stepsRef.current.forEach((ref, i) => {
        if (ref && scrollPos > ref.offsetTop) {
          setActiveStep(i);
        }
      });
    };
    window.addEventListener("scroll", handleScroll);

    // Fetch Config
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
    { name: "Kerala", img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80", tag: "Serene" },
    { name: "Manali", img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80", tag: "Mountains" },
    { name: "Jaipur", img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80", tag: "Royal" },
  ];

  return (
    <div className="home-saas">
      
      {/* ── HERO SECTION (CENTERED) ── */}
      <section className="saas-hero">
        <div className="hero-glow"></div>
        <div className="container hero-container">
          <div className="hero-content reveal-on-scroll">
            <span className="saas-badge">✨ Redefining Travel Coordination</span>
            <h1>Decide Trips <span className="gradient-text">in Seconds</span></h1>
            <p>No more group chaos. Vote, finalize, and follow your trip smoothly with India's first product-led travel planner.</p>
            
            <div className="hero-actions">
              <button className="btn-saas primary" onClick={() => navigate("/planner")}>
                Start Planning →
              </button>
              <button className="btn-saas ghost" onClick={() => navigate("/create-poll")}>
                Create Poll
              </button>
            </div>
          </div>

          {/* Floating Visual Elements */}
          <div className="floating-elements">
            <div className="float-card poll-preview glass reveal-on-scroll">
              <div className="p-dot"></div>
              <p>Poll: Goa or Manali?</p>
              <div className="p-bar"><div className="p-fill" style={{width: '70%'}}></div></div>
            </div>
            <div className="float-card map-preview glass reveal-on-scroll">
              <span className="m-icon">📍</span>
              <p>Next: Baga Beach</p>
            </div>
            <div className="float-card step-preview glass reveal-on-scroll">
              <span className="s-icon">✨</span>
              <p>Itinerary Ready</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FLOATING FEATURE STRIP ── */}
      <section className="saas-strip container">
        <div className="strip-inner glass">
          <div className="strip-item"><span>🗳️</span> Vote → Decision Done</div>
          <div className="strip-sep"></div>
          <div className="strip-item"><span>🤖</span> AI builds your plan</div>
          <div className="strip-sep"></div>
          <div className="strip-item"><span>🧭</span> Follow step-by-step</div>
        </div>
      </section>

      {/* ── SPLIT SCROLL SECTION ── */}
      <section className="saas-split-scroll">
        <div className="container split-grid">
          <div className="split-left">
            <div className="sticky-text">
              <div className={`step-text ${activeStep === 0 ? 'active' : ''}`}>
                <h2>Create a poll</h2>
                <p>Start with a simple question. Let your group decide the vibe without the long chat threads.</p>
              </div>
              <div className={`step-text ${activeStep === 1 ? 'active' : ''}`}>
                <h2>Decision gets finalized</h2>
                <p>Our algorithm locks the decision as soon as a majority is reached. No second-guessing.</p>
              </div>
              <div className={`step-text ${activeStep === 2 ? 'active' : ''}`}>
                <h2>Follow your trip</h2>
                <p>Use the live guided map to stay on track. Everyone knows where to meet and what's next.</p>
              </div>
            </div>
          </div>
          
          <div className="split-right">
            <div ref={el => stepsRef.current[0] = el} className="split-visual glass">
               <div className="mock-poll">
                  <div className="mock-option"><span>🏔️</span> Manali</div>
                  <div className="mock-option active"><span>🏖️</span> Goa</div>
               </div>
            </div>
            <div ref={el => stepsRef.current[1] = el} className="split-visual glass">
               <div className="mock-result">
                  <span className="crown">👑</span>
                  <h3>Goa Finalized</h3>
                  <button className="btn-mini">Generate Plan</button>
               </div>
            </div>
            <div ref={el => stepsRef.current[2] = el} className="split-visual glass">
               <div className="mock-map">
                  <div className="mock-marker"></div>
                  <p>Arriving at Chapora Fort</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DESTINATION SHOWCASE (CAROUSEL) ── */}
      <section className="saas-showcase reveal-on-scroll">
        <div className="container">
          <div className="section-head">
            <h2>Explore <span className="gradient-text">India</span></h2>
            <p>High-end curated destinations ready for your next odyssey.</p>
          </div>
        </div>
        <div className="saas-carousel">
          <div className="carousel-track">
            {destinations.map((d, i) => (
              <div key={i} className="saas-card" onClick={() => navigate("/planner", { state: { city: d.name } })}>
                <img src={d.img} alt={d.name} />
                <div className="card-overlay">
                  <span>{d.tag}</span>
                  <h3>{d.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="saas-cta reveal-on-scroll">
        <div className="container">
          <div className="cta-box glass">
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
