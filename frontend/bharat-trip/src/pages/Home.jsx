import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import MinimalReviewSection from "../components/MinimalReviewSection";
import "./home.css";

function Home() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    
    // Intersection Observer for scroll animations
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

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const indiaPlaces = [
    { name: "Goa", img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80", tag: "Beach" },
    { name: "Manali", img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80", tag: "Mountains" },
    { name: "Kerala", img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80", tag: "Backwaters" },
    { name: "Jaipur", img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80", tag: "Heritage" },
    { name: "Rishikesh", img: "https://images.unsplash.com/photo-1590050752117-23a9d7f66d41?auto=format&fit=crop&w=800&q=80", tag: "Spiritual" },
    { name: "Ladakh", img: "https://images.unsplash.com/photo-1581791534721-e599df4417f7?auto=format&fit=crop&w=800&q=80", tag: "Adventure" },
  ];

  return (
    <div className="home-premium">
      
      {/* ── HERO SECTION ── */}
      <section className="hero-v2">
        <div className="hero-bg-slideshow">
          <div className="hero-slide" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1548013146-72479768bbf4?auto=format&fit=crop&w=1920&q=80')` }}></div>
        </div>
        
        <div className="hero-content">
          <span className="hero-badge reveal">Next-Gen Travel Planning</span>
          <h1 className="reveal">Plan Trips Faster. <br/>Decide Together. <br/><span className="gradient-text">Travel Smarter.</span></h1>
          <p className="reveal">Stop endless group discussions. Vote, finalize, and follow a clear trip plan with AI assistance and guided maps.</p>
          
          <div className="hero-btns reveal">
            <button className="btn-main" onClick={() => navigate("/planner")}>Start Planning</button>
            <button className="btn-sub" onClick={() => navigate("/create-poll")}>Create Poll</button>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: PROBLEM/SOLUTION ── */}
      <section className="problem-solution reveal">
        <div className="container">
          <div className="problem-grid">
            <div className="problem-text">
              <h2>Tired of Group <br/><span className="highlight-red">Trip Confusion?</span></h2>
              <div className="points">
                <div className="point">
                  <span className="point-icon">💬</span>
                  <p>Too many opinions in chats</p>
                </div>
                <div className="point">
                  <span className="point-icon">❌</span>
                  <p>No clear plan or direction</p>
                </div>
                <div className="point">
                  <span className="point-icon">⚠️</span>
                  <p>Last-minute booking chaos</p>
                </div>
              </div>
            </div>
            <div className="solution-card glass">
              <h3>The Solution</h3>
              <p>Our platform helps you decide quickly, plan efficiently, and follow a structured trip without confusion.</p>
              <div className="solution-stats">
                <div className="stat"><span>10x</span><p>Faster Decisions</p></div>
                <div className="stat"><span>100%</span><p>Clarity</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: CORE FEATURES ── */}
      <section className="features-v2">
        <div className="container">
          <div className="section-header reveal">
            <h2>Real Value. <span className="gradient-text">Real Planning.</span></h2>
          </div>
          
          <div className="features-grid">
            {[
              { title: "Instant Group Decisions", desc: "Create a poll, share with friends, and finalize your destination automatically without long discussions.", icon: "🗳️" },
              { title: "AI Trip Planner", desc: "Get a structured itinerary based on your destination, preferences, and travel style.", icon: "✨" },
              { title: "Guided Map View", desc: "Follow your trip step-by-step with a map that shows what to do next and where to go.", icon: "🗺️" },
              { title: "Smart Trip Flow", desc: "Know your current location, next stop, and overall journey clearly.", icon: "🧭" }
            ].map((f, i) => (
              <div key={i} className="feature-card glass reveal">
                <div className="f-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: HOW IT WORKS ── */}
      <section className="how-it-works-v2">
        <div className="container">
          <h2 className="reveal">How it Works</h2>
          <div className="steps-grid">
            {[
              "Create a poll and share with your group",
              "Friends vote and decision gets finalized automatically",
              "Generate your trip plan using AI",
              "Follow the guided map during your trip"
            ].map((step, i) => (
              <div key={i} className="step-item reveal">
                <div className="step-num">{i + 1}</div>
                <p>{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 5: INDIA FOCUS ── */}
      <section className="india-focus">
        <div className="container">
          <div className="section-header reveal">
            <h2>Explore <span className="gradient-text">Incredible India</span></h2>
            <p>From beaches to mountains, plan trips across India's most loved destinations.</p>
          </div>
          
          <div className="india-grid">
            {indiaPlaces.map((p, i) => (
              <div key={i} className="india-card reveal" style={{ backgroundImage: `url(${p.img})` }}>
                <div className="india-overlay">
                  <span className="i-tag">{p.tag}</span>
                  <h3>{p.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 6: TRUST ── */}
      <section className="trust-simplicity reveal">
        <div className="container glass">
          <div className="trust-content">
            <h2>Built for Simplicity</h2>
            <div className="trust-points">
              <span>✓ No long discussions</span>
              <span>✓ No confusion</span>
              <span>✓ Just smooth trips</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 7: FINAL CTA ── */}
      <section className="final-cta reveal">
        <div className="container">
          <h2>Ready to Plan Your Next Trip?</h2>
          <button className="btn-main lg" onClick={() => navigate("/planner")}>Start Now</button>
        </div>
      </section>

      <MinimalReviewSection />
    </div>
  );
}

export default Home;
