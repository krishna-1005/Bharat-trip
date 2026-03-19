import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import MinimalReviewSection from "../components/MinimalReviewSection";
import "./home.css";

const InteractiveHeroImages = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const sx = useSpring(mouseX, springConfig);
  const sy = useSpring(mouseY, springConfig);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set((clientX - innerWidth / 2) / 25);
    mouseY.set((clientY - innerHeight / 2) / 25);
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const famousPlaces = [
    {
      name: "Taj Mahal",
      img: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80",
      x: -20, y: -20, rotate: -5, scale: 1.1
    },
    {
      name: "Varanasi",
      img: "https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?auto=format&fit=crop&w=800&q=80",
      x: 40, y: -40, rotate: 8, scale: 0.9
    },
    {
      name: "Hawa Mahal",
      img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80",
      x: -30, y: 50, rotate: -10, scale: 1.0
    },
    {
      name: "Hampi",
      img: "https://images.unsplash.com/photo-1620766182966-c6eb5ed2b788?auto=format&fit=crop&w=800&q=80",
      x: 50, y: 30, rotate: 5, scale: 1.05
    }
  ];

  return (
    <div className="hero-interactive-images">
      {famousPlaces.map((place, index) => (
        <motion.div
          key={index}
          className={`floating-image-card card-${index}`}
          style={{
            x: useTransform(sx, (val) => val * (index + 1) * 0.5),
            y: useTransform(sy, (val) => val * (index + 1) * 0.5),
            rotate: place.rotate,
          }}
          whileHover={{ scale: place.scale * 1.1, zIndex: 50, rotate: 0 }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: place.scale }}
          transition={{ duration: 0.8, delay: index * 0.1 }}
        >
          <img src={place.img} alt={place.name} />
          <div className="image-caption">{place.name}</div>
        </motion.div>
      ))}
      
      {/* Mini Poll Card Overlay */}
      {/* <motion.div 
        className="hero-mini-poll"
        style={{
          x: useTransform(sx, (val) => val * 3),
          y: useTransform(sy, (val) => val * 3),
        }}
      >
        <h4>Group Vote: Goa Trip</h4>
        <div className="mini-poll-progress">
          <div className="mini-poll-bar" style={{ width: '73%' }}></div>
        </div>
        <p>Beach Resort (3 votes)</p>
      </motion.div> */}
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const destRef = useRef(null);

  const destinations = [
    { name: "Goa", tagline: "Sun, Sand & Party", img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80" },
    { name: "Manali", tagline: "Snowy Peaks & Adventure", img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80" },
    { name: "Kerala", tagline: "Backwaters & Bliss", img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80" },
    { name: "Jaipur", tagline: "Royal Forts & Culture", img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80" },
    { name: "Ladakh", tagline: "Mountains & Monasteries", img: "https://images.unsplash.com/photo-1581791534721-e599df4417f7?auto=format&fit=crop&w=800&q=80" },
    { name: "Rishikesh", tagline: "Ganga & Yoga", img: "https://images.unsplash.com/photo-1598970605070-a38a6ccd3a2d?auto=format&fit=crop&w=800&q=80" },
    { name: "Varanasi", tagline: "Spiritual Eternity", img: "https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?auto=format&fit=crop&w=800&q=80" },
    { name: "Udaipur", tagline: "The City of Lakes", img: "https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?auto=format&fit=crop&w=800&q=80" },
    { name: "Agra", tagline: "Home of Taj Mahal", img: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80" },
  ];

  const scrollToDestinations = () => {
    destRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="home-redesign">
      
      {/* 1) HERO SECTION */}
      <section className="hero-section container">
        <div className="hero-grid">
          <div className="hero-content">
            <h1>Plan Trips Without Confusion</h1>
            <p>Vote with friends, finalize decisions instantly, and follow a clear step-by-step trip plan.</p>
            <div className="hero-actions">
              <button className="btn-large btn-primary" onClick={() => navigate('/planner')}>
                Start Planning
              </button>
              <button className="btn-large btn-secondary" onClick={() => navigate('/create-poll')}>
                Create Poll
              </button>
              <button className="btn-tertiary" onClick={() => navigate('/map')}>
                <span>📍</span> View Map
              </button>
            </div>
          </div>
          <div className="hero-preview-container">
            <InteractiveHeroImages />
          </div>
        </div>
      </section>

      {/* 2) QUICK ACTION PANEL */}
      <div className="quick-actions">
        <div className="container actions-grid">
          <div className="action-card" onClick={() => navigate('/create-poll')}>
            <div className="action-icon">🗳️</div>
            <h3>Create Poll</h3>
          </div>
          <div className="action-card" onClick={() => navigate('/planner')}>
            <div className="action-icon">🤖</div>
            <h3>Plan Trip with AI</h3>
          </div>
          <div className="action-card" onClick={() => navigate('/map')}>
            <div className="action-icon">🗺️</div>
            <h3>Open Map</h3>
          </div>
          <div className="action-card" onClick={scrollToDestinations}>
            <div className="action-icon">✨</div>
            <h3>Explore Destinations</h3>
          </div>
        </div>
      </div>

      {/* 3) VALUE SECTION */}
      <section className="value-section container">
        <h2>Why use this?</h2>
        <div className="value-grid">
          <div className="value-item">
            <div className="action-icon">💬</div>
            <div className="value-point">No long discussions</div>
          </div>
          <div className="value-item">
            <div className="action-icon">⚡</div>
            <div className="value-point">Instant decisions</div>
          </div>
          <div className="value-item">
            <div className="action-icon">🧭</div>
            <div className="value-point">Clear trip guidance</div>
          </div>
        </div>
      </section>

      {/* 4) FEATURES SECTION */}
      <section className="container">
        <div className="features-grid">
          <div className="feature-card">
            <h3>Voting</h3>
            <p>Quick group decisions without confusion through intuitive polls.</p>
          </div>
          <div className="feature-card">
            <h3>AI Planner</h3>
            <p>Generate your trip plan instantly with smart logic and local data.</p>
          </div>
          <div className="feature-card">
            <h3>Guided Map</h3>
            <p>Follow your trip step-by-step with real-time navigation and routing.</p>
          </div>
          <div className="feature-card">
            <h3>Smart Flow</h3>
            <p>Know exactly what to do next with seamless transition from idea to reality.</p>
          </div>
        </div>
      </section>

      {/* 5) HOW IT WORKS */}
      <section className="how-it-works container">
        <h2>How it works</h2>
        <div className="flow-grid">
          <div className="flow-step">
            <div className="step-icon">✍️</div>
            <h3>Create poll</h3>
          </div>
          <div className="step-arrow">→</div>
          <div className="flow-step">
            <div className="step-icon">👥</div>
            <h3>Friends vote</h3>
          </div>
          <div className="step-arrow">→</div>
          <div className="flow-step">
            <div className="step-icon">✅</div>
            <h3>Decision finalized</h3>
          </div>
          <div className="step-arrow">→</div>
          <div className="flow-step">
            <div className="step-icon">🗺️</div>
            <h3>Follow your trip</h3>
          </div>
        </div>
      </section>

      {/* 6) DESTINATIONS SECTION */}
      <section className="container" ref={destRef}>
        <h2>Explore Popular Places in India</h2>
        <div className="dest-grid">
          {destinations.map((d, i) => (
            <div 
              key={i} 
              className="dest-card"
              onClick={() => navigate(`/explore/${d.name}`)}
            >
              <img src={d.img} alt={d.name} />
              <div className="dest-overlay">
                <h3>{d.name}</h3>
                <span className="dest-tagline">{d.tagline}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7) FINAL CTA */}
      <section className="final-cta container">
        <div className="cta-box">
          <h2>Ready to plan your next trip?</h2>
          <div className="hero-actions">
            <button className="btn-large btn-primary" onClick={() => navigate('/planner')}>
              Start Planning
            </button>
            <button className="btn-large btn-secondary" onClick={() => navigate('/create-poll')}>
              Create Poll
            </button>
          </div>
        </div>
      </section>

      <MinimalReviewSection />
    </div>
  );
};

export default Home;
