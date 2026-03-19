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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);

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

  const bentoFeatures = [
    { title: "AI Neural Planning", desc: "Complex itineraries solved in milliseconds.", icon: "🧠", size: "large", color: "blue" },
    { title: "One-Tap Voting", desc: "consensus without the chaos.", icon: "🗳️", size: "small", color: "purple" },
    { title: "Live Guidance", desc: "Your personal concierge on the map.", icon: "📍", size: "small", color: "emerald" },
    { title: "Curated India", desc: "Handpicked hidden gems across the subcontinent.", icon: "🇮🇳", size: "medium", color: "gold" },
  ];

  const destinations = [
    { name: "Ladakh", tag: "Adventure", img: "https://images.unsplash.com/photo-1581791534721-e599df4417f7?auto=format&fit=crop&w=800&q=80" },
    { name: "Varanasi", tag: "Spiritual", img: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80" },
    { name: "Goa", tag: "Coastal", img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80" },
    { name: "Kerala", tag: "Nature", img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80" },
  ];

  return (
    <div className={`home-luxury ${scrolled ? 'is-scrolled' : ''}`}>
      
      {/* ── CINEMATIC HERO ── */}
      <section className="lux-hero">
        <div className="lux-hero-bg">
          <ThreeScene images={heroImages} />
        </div>
        
        <div className="lux-hero-content container">
          <div className="reveal-on-scroll">
            <span className="lux-badge">The Future of Exploration</span>
            <h1 className="lux-title">Crafting <span className="gradient-gold">Memories</span> <br/>Through Intelligence.</h1>
            <p className="lux-subtitle">Experience India's first AI-powered travel ecosystem designed for groups who value time and clarity.</p>
            
            <div className="lux-hero-actions">
              <button className="btn-lux primary" onClick={() => navigate("/planner")}>
                Begin Your Journey
              </button>
              <button className="btn-lux secondary" onClick={() => navigate("/create-poll")}>
                Decide with Friends
              </button>
            </div>
          </div>
        </div>

        <div className="lux-scroll-indicator">
          <div className="mouse"></div>
          <span>Discover More</span>
        </div>
      </section>

      {/* ── BENTO FEATURES ── */}
      <section className="lux-bento reveal-on-scroll">
        <div className="container">
          <div className="section-head-lux">
            <h2>Superior <span className="gradient-gold">Intelligence</span></h2>
            <p>Every detail of your trip is optimized by our neural engine.</p>
          </div>
          
          <div className="bento-grid">
            {bentoFeatures.map((f, i) => (
              <div key={i} className={`bento-card ${f.size} ${f.color} glass`}>
                <div className="bento-icon">{f.icon}</div>
                <div className="bento-text">
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
                <div className="bento-glow"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE STEP FLOW ── */}
      <section className="lux-flow reveal-on-scroll">
        <div className="container">
          <div className="flow-wrapper">
            <div className="flow-line"></div>
            {[
              { t: "Dream", d: "Start a group poll in seconds" },
              { t: "Decide", d: "Automatic consensus reached" },
              { t: "Design", d: "AI crafts the perfect route" },
              { t: "Discover", d: "Follow the live guided map" }
            ].map((step, i) => (
              <div key={i} className="flow-step">
                <div className="flow-dot"><span>{i+1}</span></div>
                <h4>{step.t}</h4>
                <p>{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LUXURY DESTINATIONS ── */}
      <section className="lux-destinations reveal-on-scroll">
        <div className="container">
          <div className="section-head-lux">
            <h2>The <span className="gradient-gold">Collection</span></h2>
            <p>Signature destinations curated for the modern traveler.</p>
          </div>
        </div>
        
        <div className="lux-gallery">
          {destinations.map((d, i) => (
            <div 
              key={i} 
              className="lux-gallery-card"
              onClick={() => navigate("/planner", { state: { city: d.name } })}
            >
              <img src={d.img} alt={d.name} />
              <div className="lux-overlay">
                <div className="lux-overlay-top">
                  <span>{d.tag}</span>
                </div>
                <div className="lux-overlay-bottom">
                  <h3>{d.name}</h3>
                  <p>Explore Itinerary ›</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SIGNATURE CTA ── */}
      <section className="lux-cta reveal-on-scroll">
        <div className="container">
          <div className="cta-signature glass">
            <h2>Ready for the extraordinary?</h2>
            <p>Join 10,000+ explorers who planned their dream trip today.</p>
            <button className="btn-lux primary lg" onClick={() => navigate("/planner")}>
              Plan Your Trip Now
            </button>
          </div>
        </div>
      </section>

      <MinimalReviewSection />
    </div>
  );
}

export default Home;
