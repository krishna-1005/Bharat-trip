import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "./home.css";
import img1 from "../assets/images/img1.webp";
// import img2 from "../assets/images/img2.webp";
import img3 from "../assets/images/img3.webp";
import img4 from "../assets/images/img4.webp";
// import img5 from "../assets/images/img5.webp";
import TravelBot from "../components/TravelBot";

function Home() {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      const yOffset = -80;
      const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="home">

      {/* ── HERO ── */}
      <section id="home" className="hero">

        {/* LEFT TEXT */}
        <div className="hero-text">
          <span className="badge">
            <span className="badge-dot">◉</span> AI-POWERED TRAVEL V2.0
          </span>

          <h1>
            Plan Your<br />
            Bengaluru Trip<br />
            <span className="highlight">Without<br />Confusion</span>
          </h1>

          <p>
            Experience the future of AI-powered travel planning for the
            Silicon Valley of India. Personalized itineraries, live budgets,
            and smart routing.
          </p>

          <div className="hero-actions">
            <button className="primary" onClick={() => navigate("/planner")}>
              Start Planning →
            </button>
            <Link to="/sample-plan">
              <button className="secondary">See Sample Plans</button>
            </Link>
          </div>

          <div className="social-proof">
            <div className="avatars">
              <div className="av av1"></div>
              <div className="av av2"></div>
              <div className="av av3"></div>
              <div className="av av4"></div>
            </div>
            <span><strong>5,000+</strong> travelers planned today</span>
          </div>
        </div>

        {/* RIGHT CARDS */}
        <div className="hero-image">
          <div className="hero-image-wrapper">

            {/* Cubbon Park – top left, tallest */}
            <div
              className={`place-card pc-cubbon ${hoveredCard === "cubbon" ? "card-hovered" : ""}`}
              onMouseEnter={() => setHoveredCard("cubbon")}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="card-img-wrap">
                <img src={img1} alt="Cubbon Park" />
                <div className="card-img-overlay"></div>
              </div>
              <div className="place-info">
                <h4>Cubbon Park</h4>
                <div className="rating-row">
                  <span className="star">★</span>
                  <span className="rating-val">4.8</span>
                </div>
              </div>
              <div className="place-meta">
                <span>🕐 2–3h</span>
                <span>🎟 ₹0</span>
              </div>
            </div>

            {/* Nandi Hills – top right */}
            <div
              className={`place-card pc-nandi ${hoveredCard === "nandi" ? "card-hovered" : ""}`}
              onMouseEnter={() => setHoveredCard("nandi")}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="card-img-wrap">
                <img src={img3} alt="Nandi Hills" />
                <div className="card-img-overlay"></div>
              </div>
              <div className="place-info">
                <h4>Nandi Hills</h4>
                <div className="rating-row">
                  <span className="star">★</span>
                  <span className="rating-val">4.7</span>
                </div>
              </div>
              <div className="place-meta">
                <span>🕐 4–5h</span>
                <span>🎟 ₹100</span>
              </div>
            </div>

            {/* Lalbagh – bottom center */}
            <div
              className={`place-card pc-lalbagh ${hoveredCard === "lalbagh" ? "card-hovered" : ""}`}
              onMouseEnter={() => setHoveredCard("lalbagh")}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="card-img-wrap">
                <img src={img4} alt="Lalbagh" />
                <div className="card-img-overlay"></div>
              </div>
              <div className="place-info">
                <h4>Lalbagh</h4>
                <div className="rating-row">
                  <span className="star">★</span>
                  <span className="rating-val">4.6</span>
                </div>
              </div>
              <div className="place-meta">
                <span>🕐 2h</span>
                <span>🎟 ₹25</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="how-it-works">
        <div className="how-header">
          <h2>Everything you need<br />to travel like a <span className="highlight">Pro</span></h2>
          <p className="section-subtitle">
            Our AI simplifies every step of your journey, from landing to departure.
          </p>
        </div>
        <div className="how-grid">
          <div className="how-card">
            <div className="how-card-icon blue-icon">✦</div>
            <h3>AI Trip Planning</h3>
            <p>Tell us your vibe and preferences. Our LLM-powered engine crafts personalized itineraries in seconds.</p>
          </div>
          <div className="how-card">
            <div className="how-card-icon orange-icon">◎</div>
            <h3>Budget Estimator</h3>
            <p>Stay on track with real-time cost analysis including transit, tickets, and dining for your specific route.</p>
          </div>
          <div className="how-card">
            <div className="how-card-icon cyan-icon">⬡</div>
            <h3>Smart Route Optimization</h3>
            <p>Avoid traffic jams. We find the most efficient sequence to see your favorite spots using local transit data.</p>
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE ── */}
      <section id="why-choose" className="why-choose">
        <h2>Why Choose Bharat Trip?</h2>
        <div className="why-grid">
          <div className="why-card"><div className="small-icon">🛡️</div><h4>Curated by Experts</h4></div>
          <div className="why-card"><div className="small-icon">💰</div><h4>Budget Friendly</h4></div>
          <div className="why-card"><div className="small-icon">⏱️</div><h4>Time Saving</h4></div>
          <div className="why-card"><div className="small-icon">📞</div><h4>24/7 Support</h4></div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta">
        <h2>Ready to explore Bengaluru like never before?</h2>
        <p>Join thousands of travelers using AI to make their trips stress-free and memorable.</p>
        <div className="hero-actions">
          <button className="primary" onClick={() => navigate("/planner")}>Plan My First Trip</button>
          <button className="secondary" onClick={() => setChatOpen(true)}>Talk to an Agent</button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer id="footer" className="footer">
        <div className="footer-grid">
          <div>
            <h3>Bharat Trip</h3>
            <p>Redefining travel planning for the modern Indian explorer.</p>
          </div>
          <div>
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/destinations">Popular Destinations</Link></li>
              <li><Link to="/weekend">Weekend Getaways</Link></li>
            </ul>
          </div>
          <div>
            <h4>Support</h4>
            <ul>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4>Newsletter</h4>
            <div className="newsletter">
              <input type="email" placeholder="Email address" />
              <button>→</button>
            </div>
          </div>
        </div>
        <div className="footer-bottom">© 2024 BharatTrip AI. Crafted for India's digital travelers.</div>
      </footer>

      {/* ── CHATBOT ── */}
      <TravelBot isOpen={chatOpen} setIsOpen={setChatOpen} />

    </div>
  );
}

export default Home;