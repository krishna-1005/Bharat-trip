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
            <p>Vote with friends, finalize decisions quickly, and follow a clear trip plan.</p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => navigate("/planner")}>
                Start Planning
              </button>
              <button className="btn-secondary" onClick={() => navigate("/create-poll")}>
                Create Poll
              </button>
            </div>
          </div>
          <div className="hero-preview">
            <div className="preview-box">
              <div className="preview-placeholder">
                <div className="mock-ui-line" style={{ width: '60%' }}></div>
                <div className="mock-ui-line" style={{ width: '40%' }}></div>
                <div className="mock-ui-line" style={{ width: '80%' }}></div>
                <div className="mock-ui-btn"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2) QUICK VALUE BAR */}
      <div className="value-bar">
        <div className="container value-grid">
          <div className="value-item">
            <div className="dot"></div> No long discussions
          </div>
          <div className="value-item">
            <div className="dot"></div> Instant decisions
          </div>
          <div className="value-item">
            <div className="dot"></div> Step-by-step trip guidance
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
              <div className="feature-icon">🗳️</div>
              <h3>Voting</h3>
              <p>Decide quickly with your group without the endless chat loops.</p>
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

      {/* 4) HOW IT WORKS */}
      <section className="how-section">
        <div className="container how-grid">
          <div className="how-visual">
             <div className="preview-box">
               <div className="preview-placeholder">
                 <div className="mock-ui-line" style={{ width: '70%' }}></div>
                 <div className="mock-ui-line" style={{ width: '30%' }}></div>
                 <div className="mock-ui-btn" style={{ background: '#10b981' }}></div>
               </div>
             </div>
          </div>
          <div className="how-steps">
            <div className="step-item">
              <div className="step-num">1</div>
              <div className="step-content">
                <h3>Create poll</h3>
                <p>Pick a few options and invite your friends to vote.</p>
              </div>
            </div>
            <div className="step-item">
              <div className="step-num">2</div>
              <div className="step-content">
                <h3>Friends vote</h3>
                <p>Everyone picks their favorite spot in one simple interface.</p>
              </div>
            </div>
            <div className="step-item">
              <div className="step-num">3</div>
              <div className="step-content">
                <h3>Decision finalized</h3>
                <p>The winner is automatically selected based on majority.</p>
              </div>
            </div>
            <div className="step-item">
              <div className="step-num">4</div>
              <div className="step-content">
                <h3>Follow the plan</h3>
                <p>Follow the AI-generated itinerary on a live map.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5) DESTINATIONS */}
      <section className="dest-section">
        <div className="container">
          <h2>Popular Destinations</h2>
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
