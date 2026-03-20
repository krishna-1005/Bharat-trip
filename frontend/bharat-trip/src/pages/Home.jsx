import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import MinimalReviewSection from "../components/MinimalReviewSection";
import "./home.css";

import ThreeScene from "../components/ThreeScene";

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
      name: "Jaipur",
      img: "https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?auto=format&fit=crop&w=800&q=80",
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
  const [heroText, setHeroText] = useState({
    h: "Your Indian Odyssey, <br /> Perfected by AI.",
    p: "From hidden Himalayan trails to the vibrant heart of the Pink City—get a bespoke, high-precision itinerary."
  });

  const heroOptions = [
    {
      h: "Your Indian Odyssey, <br /> Perfected by AI.",
      p: "From hidden Himalayan trails to the vibrant heart of the Pink City—get a bespoke, high-precision itinerary that captures the true soul of your journey."
    },
    {
      h: "Don't Just Travel, <br /> Experience with AI.",
      p: "Skip the hours of research. Our intelligent planner crafts the ultimate route based on your unique travel style and budget."
    },
    {
      h: "Every Detail Handpicked <br /> by Intelligence.",
      p: "Whether it's a weekend getaway or a month-long expedition, get a step-by-step plan that optimizes your time and budget."
    },
    {
      h: "The Smartest Way <br /> to Discover India.",
      p: "Let our AI navigate the complexities of planning. You just focus on the memories while we handle the perfect itinerary."
    },
    {
      h: "Bespoke Itineraries <br /> in Seconds.",
      p: "Enter your dreams, get a roadmap. Experience India exactly how you want to, with precision-engineered travel plans."
    }
  ];

  const [selectedMood, setSelectedMood] = useState('🏖️ Relaxed');
  const [selectedBudget, setSelectedBudget] = useState('Comfort');

  const matchData = {
    '🏔️ Adventure': { name: 'Manali', desc: 'Snow-capped peaks and thrilling paragliding.', img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80' },
    '🏖️ Relaxed': { name: 'Goa', desc: 'Golden sands and soulful sunsets.', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80' },
    '🛕 Heritage': { name: 'Hampi', desc: 'Ancient ruins and architectural marvels.', img: 'https://images.unsplash.com/photo-1600100397608-f010e4aa0984?auto=format&fit=crop&w=800&q=80' },
    '🎭 Culture': { name: 'Varanasi', desc: 'The spiritual heart of timeless India.', img: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80' },
    '💖 Romantic': { name: 'Udaipur', desc: 'Palaces, lakes, and royal romance.', img: 'https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?auto=format&fit=crop&w=800&q=80' },
  };

  const galleryImages = [
    "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1593179241557-bce1eb92e47e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1581791534721-e599df4417f7?auto=format&fit=crop&w=800&q=80"
  ];

  useEffect(() => {
    const randomIdx = Math.floor(Math.random() * heroOptions.length);
    setHeroText(heroOptions[randomIdx]);
  }, []);

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
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            key={heroText.h}
          >
            <h1 dangerouslySetInnerHTML={{ __html: heroText.h }}></h1>
            <p>{heroText.p}</p>
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
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-sample" 
                onClick={() => navigate('/sample-plan')}
              >
                <div className="icon-circle">✨</div>
                <span>Sample Plans</span>
              </motion.button>
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
            { label: "Create Poll", icon: "🗳️", path: "/create-poll", desc: "Start a group vote for your next destination." },
            { label: "AI Trip Planner", icon: "🤖", path: "/planner", desc: "Let AI craft your perfect custom itinerary." },
            { label: "Interactive Map", icon: "🗺️", path: "/map", desc: "Explore routes and hidden gems visually." },
            { label: "Explore India", icon: "✨", action: scrollToDestinations, desc: "Browse our hand-picked top destinations." },
          ].map((action, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -8 }}
              className="action-card" 
              onClick={() => action.path ? navigate(action.path) : action.action()}
            >
              <div className="action-icon">{action.icon}</div>
              <h3>{action.label}</h3>
              <p>{action.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 3) VALUE SECTION */}
      <section id="why-us" className="value-section">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >Why choose Bharat Trip</motion.h2>
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
        </div>
      </section>

      {/* 4) FEATURES SECTION */}
      <section id="features" className="features-section">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '60px' }}
          >Features</motion.h2>
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
        </div>
      </section>

      {/* 5) HOW IT WORKS */}
      <section id="how-it-works" className="how-it-works">
        <div className="container">
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
        </div>
      </section>

      {/* NEW: AI TRAVEL MATCHMAKER */}
      <section className="matchmaker-section">
        <div className="container">
          <div className="matchmaker-card">
            <div className="mm-content">
              <div className="mm-badge">New Feature</div>
              <h2>Find Your Soul Destination</h2>
              <p>Can't decide? Let our AI Matchmaker pick the perfect spot based on your current vibe.</p>
              
              <div className="mm-controls">
                <div className="mm-group">
                  <label>What's your mood?</label>
                  <div className="mm-options">
                    {['🏔️ Adventure', '🏖️ Relaxed', '🛕 Heritage', '🎭 Culture', '💖 Romantic'].map(m => (
                      <button 
                        key={m} 
                        className={`mm-opt ${selectedMood === m ? 'active' : ''}`}
                        onClick={() => setSelectedMood(m)}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mm-group">
                  <label>Budget Level</label>
                  <div className="mm-options">
                    {['Budget', 'Comfort', 'Luxury'].map(b => (
                      <button 
                        key={b} 
                        className={`mm-opt ${selectedBudget === b ? 'active' : ''}`}
                        onClick={() => setSelectedBudget(b)}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <motion.div 
              className="mm-result"
              key={selectedMood + selectedBudget}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="mm-result-card">
                <img src={matchData[selectedMood]?.img} alt="Match" />
                <div className="mm-result-info">
                  <span className="mm-match-tag">Your Perfect Match</span>
                  <h3>{matchData[selectedMood]?.name}</h3>
                  <p>{matchData[selectedMood]?.desc}</p>
                  <button className="btn-primary" onClick={() => navigate('/planner', { state: { city: matchData[selectedMood]?.name } })}>
                    Plan This Trip →
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* NEW: 3D DISCOVERY GALLERY (Desktop Only) */}
      <motion.section 
        className="three-discovery container desktop-only"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="discovery-header">
          <h2>Immersive India</h2>
          <p>Experience the grandeur of India in a high-fidelity 3D space. Drag to explore.</p>
        </div>
        <div className="three-container">
          <ThreeScene images={galleryImages} />
        </div>
      </motion.section>

      {/* 6) DESTINATIONS SECTION */}
      <section id="destinations" className="container" ref={destRef}>
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
