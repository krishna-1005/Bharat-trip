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
      img: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80",
      x: 40, y: -40, rotate: 8, scale: 0.9
    },
    {
      name: "Hawa Mahal",
      img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80",
      x: -30, y: 50, rotate: -10, scale: 1.0
    },
    {
      name: "Hampi",
      img: "https://images.unsplash.com/photo-1524492707941-5f397224bc0b?auto=format&fit=crop&w=800&q=80",
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
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    whileHover={{ y: -10, backgroundColor: 'rgba(255,255,255,0.08)' }}
    className="feature-card"
  >
    <div className="action-icon" style={{ marginBottom: '20px' }}>{icon}</div>
    <h3>{title}</h3>
    <p>{desc}</p>
  </motion.div>
);

const Home = () => {
  const navigate = useNavigate();
  const destRef = useRef(null);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleGlobalMouse = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleGlobalMouse);
    return () => window.removeEventListener('mousemove', handleGlobalMouse);
  }, []);

  const destinations = [
    { name: "Goa", tagline: "Sun, Sand & Portuguese Charm", img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80" },
    { name: "Manali", tagline: "Himalayan Snow Peaks", img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80" },
    { name: "Kerala", tagline: "Backwaters & Tea Gardens", img: "https://images.unsplash.com/photo-1593179241557-bce1eb92e47e?auto=format&fit=crop&w=800&q=80" },
    { name: "Jaipur", tagline: "The Royal Pink City", img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80" },
    { name: "Ladakh", tagline: "Pangong Lake & High Passes", img: "https://images.unsplash.com/photo-1581791534721-e599df4417f7?auto=format&fit=crop&w=800&q=80" },
    { name: "Rishikesh", tagline: "Ganga & Yoga Capital", img: "https://images.unsplash.com/photo-1598970605070-a38a6ccd3a2d?auto=format&fit=crop&w=800&q=80" },
    { name: "Varanasi", tagline: "Ancient Spiritual Ghats", img: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80" },
    { name: "Udaipur", tagline: "Romantic Lake Palace", img: "https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?auto=format&fit=crop&w=800&q=80" },
    { name: "Agra", tagline: "Monument of Eternal Love", img: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80" },
  ];

  const scrollToDestinations = () => {
    destRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="home-redesign">
      {/* ── INTERACTIVE BACKGROUND ── */}
      <div className="interactive-bg">
        <motion.div 
          className="bg-blob"
          animate={{
            x: mousePos.x - 150,
            y: mousePos.y - 150,
          }}
          transition={{ type: 'spring', damping: 30, stiffness: 50 }}
        />
      </div>
      
      {/* 1) HERO SECTION */}
      <section className="hero-section container">
        <div className="hero-grid">
          <motion.div 
            className="hero-content"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h1>Your Indian Odyssey, <br /> Perfected by AI.</h1>
            <p>From hidden Himalayan trails to the vibrant heart of the Pink City—get a bespoke, high-precision itinerary that captures the true soul of your journey.</p>
            <div className="hero-actions">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-large btn-primary" 
                onClick={() => navigate('/planner')}
              >
                Start Planning
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-large btn-secondary" 
                onClick={() => navigate('/create-poll')}
              >
                Create Poll
              </motion.button>
              <button className="btn-tertiary" onClick={() => navigate('/map')}>
                <span>📍</span> View Map
              </button>
            </div>
          </motion.div>
          <div className="hero-preview-container">
            <InteractiveHeroImages />
          </div>
        </div>
      </section>

      {/* 2) QUICK ACTION PANEL */}
      <motion.div 
        className="quick-actions"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        viewport={{ once: true }}
      >
        <div className="container actions-grid">
          {[
            { label: "Create Poll", icon: "🗳️", path: "/create-poll" },
            { label: "Plan Trip with AI", icon: "🤖", path: "/planner" },
            { label: "Open Map", icon: "🗺️", path: "/map" },
            { label: "Explore Destinations", icon: "✨", action: scrollToDestinations },
          ].map((action, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -8, backgroundColor: 'rgba(255,255,255,0.08)' }}
              className="action-card" 
              onClick={() => action.path ? navigate(action.path) : action.action()}
            >
              <div className="action-icon">{action.icon}</div>
              <h3>{action.label}</h3>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 3) VALUE SECTION */}
      <section className="value-section container">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >Why use this?</motion.h2>
        <div className="value-grid">
          {[
            { title: "Smart AI Planning", icon: "🤖" },
            { title: "Personalized Routes", icon: "🗺️" },
            { title: "Clear trip guidance", icon: "🧭" },
          ].map((v, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="value-item"
            >
              <div className="action-icon">{v.icon}</div>
              <div className="value-point">{v.title}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4) FEATURES SECTION */}
      <section className="container">
        <div className="features-grid">
          <FeatureCard 
            title="Easy Planning" 
            icon="✨"
            desc="Answer a few quick questions and get a fully personalized trip in seconds." 
          />
          <FeatureCard 
            title="AI Planner" 
            icon="🤖"
            desc="Generate your trip plan instantly with smart logic and local data." 
          />
          <FeatureCard 
            title="Guided Map" 
            icon="🗺️"
            desc="Follow your trip step-by-step with real-time navigation and routing." 
          />
          <FeatureCard 
            title="Smart Flow" 
            icon="⚡"
            desc="Know exactly what to do next with seamless transition from idea to reality." 
          />
        </div>
      </section>

      {/* 5) HOW IT WORKS */}
      <section className="how-it-works container">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >How it works</motion.h2>
        <div className="flow-grid">
          {[
            { label: "Choose destination", icon: "📍" },
            { label: "Set preferences", icon: "⚙️" },
            { label: "AI generates plan", icon: "🤖" },
            { label: "Explore & enjoy", icon: "🗺️" },
          ].map((step, i) => (
            <React.Fragment key={i}>
              <motion.div 
                className="flow-step"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="step-icon">{step.icon}</div>
                <h3>{step.label}</h3>
              </motion.div>
              {i < 3 && <div className="step-arrow">→</div>}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* 6) DESTINATIONS SECTION */}
      <section className="container" ref={destRef}>
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >Explore Popular Places in India</motion.h2>
        <div className="dest-grid">
          {destinations.map((d, i) => (
            <motion.div 
              key={i} 
              className="dest-card"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: (i % 3) * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate(`/explore/${d.name}`)}
            >
              <img src={d.img} alt={d.name} />
              <div className="dest-overlay">
                <h3>{d.name}</h3>
                <span className="dest-tagline">{d.tagline}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 7) FINAL CTA SECTION */}
      <section className="final-cta container">
        <motion.div 
          className="cta-box"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h2>Ready to plan your next trip?</h2>
          <div className="hero-actions">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-large btn-primary" 
              onClick={() => navigate('/planner')}
            >
              Start Planning
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-large btn-secondary" 
              onClick={() => navigate('/create-poll')}
            >
              Create Poll
            </motion.button>
          </div>
        </motion.div>
      </section>

      <MinimalReviewSection />
    </div>
  );
};

export default Home;
