import { useNavigate } from "react-router-dom";
import MinimalReviewSection from "../components/MinimalReviewSection";
import "./home.css";

function Home() {
  const navigate = useNavigate();

  const destinations = [
    { name: "Goa", img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80" },
    { name: "Manali", img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80" },
    { name: "Kerala", img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80" },
    { name: "Jaipur", img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80" },
    { name: "Ladakh", img: "https://images.unsplash.com/photo-1581791534721-e599df4417f7?auto=format&fit=crop&w=800&q=80" },
    { name: "Rishikesh", img: "https://images.unsplash.com/photo-1584126307041-659f77626966?auto=format&fit=crop&w=800&q=80" },
  ];

  return (
    <div className="home-redesign">
      
      {/* 1) HERO SECTION */}
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-content">
            <h1>Plan Trips Without Confusion</h1>
            <p>Intelligent itineraries, real-time guidance, and seamless discovery for your next Indian adventure.</p>
            <div className="hero-actions-stack">
              <button className="btn-primary" onClick={() => navigate("/planner")}>
                Start Planning
              </button>
              <button className="btn-secondary" onClick={() => navigate("/create-poll")}>
                Create Poll
              </button>
            </div>
          </div>
          <div className="hero-preview">
            <div className="hero-image-grid">
              {destinations.slice(0, 4).map((d, i) => (
                <div key={i} className="hero-img-card">
                  <img src={d.img} alt={d.name} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2) QUICK VALUE BAR */}
      <div className="value-bar">
        <div className="container value-grid">
          <div className="value-item">
            <div className="dot"></div> Effortless Planning
          </div>
          <div className="value-item">
            <div className="dot"></div> Accurate Estimates
          </div>
          <div className="value-item">
            <div className="dot"></div> Real-time Map Guidance
          </div>
        </div>
      </div>

      {/* 3) FEATURES */}
      <section className="features-section">
        <div className="container">
          <span className="section-label">Everything you need</span>
          <h2>Travel smarter together</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Precision</h3>
              <p>Every minute of your trip is optimized for the best possible travel experience.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI Planner</h3>
              <p>Generate your perfect trip plan in seconds with smart suggestions.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🗺️</div>
              <h3>Map Guidance</h3>
              <p>Follow your trip step-by-step with integrated real-time maps.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✨</div>
              <h3>Smart Flow</h3>
              <p>Know exactly what to do next with automated trip transitions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4) WHY CHOOSE BHARAT TRIP */}
      <section className="why-choose-section">
        <div className="container">
          <div className="section-head-redesign">
            <span className="section-label">The Bharat Trip Advantage</span>
            <h2>Why choose Bharat Trip?</h2>
            <p className="section-desc">We combine data-driven insights with a passion for discovery to give you the ultimate travel companion.</p>
          </div>
          
          <div className="why-grid">
            <div className="why-card">
              <div className="why-card-icon">🚀</div>
              <h3>AI-Powered Intelligence</h3>
              <p>Our advanced algorithms analyze thousands of locations, traffic patterns, and opening hours to build the most efficient route for your journey.</p>
            </div>
            <div className="why-card">
              <div className="why-card-icon">💎</div>
              <h3>Verified Local Data</h3>
              <p>We don't just guess. Our direct integration with local databases ensures you have the most accurate timing and cost estimates for every attraction.</p>
            </div>
            <div className="why-card">
              <div className="why-card-icon">🧭</div>
              <h3>Live Map Guidance</h3>
              <p>Don't just plan—follow. Our unique live guidance mode keeps you on track, helping you navigate between stops without ever losing your way.</p>
            </div>
            <div className="why-card">
              <div className="why-card-icon">🛡️</div>
              <h3>Reliable & Secure</h3>
              <p>Your data and trip plans are securely stored and accessible whenever you need them, ensuring a worry-free exploration experience.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5) DESTINATIONS */}
      <section className="dest-section">
        <div className="container">
          <div className="section-head-redesign">
            <h2>Popular Destinations</h2>
          </div>
          <div className="dest-grid">
            {destinations.map((d, i) => (
              <div 
                key={i} 
                className="dest-card"
                onClick={() => navigate("/planner", { state: { city: d.name } })}
              >
                <img src={d.img} alt={d.name} />
                <div className="dest-overlay">
                  <h3>{d.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6) FINAL CTA */}
      <section className="final-cta">
        <div className="container cta-container">
          <h2>Start your trip planning now</h2>
          <button className="btn-primary" style={{ padding: '20px 48px', fontSize: '1.25rem' }} onClick={() => navigate("/planner")}>
            Start Now
          </button>
        </div>
      </section>

      <MinimalReviewSection />
    </div>
  );
}

export default Home;
