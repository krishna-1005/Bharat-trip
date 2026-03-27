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

  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth > 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [heroText, setHeroText] = useState({
    h: "Your Indian Odyssey, <br /> Perfected by AI.",
    p: "From hidden Himalayan trails to the vibrant heart of the Pink City—get a bespoke, high-precision itinerary."
  });

  const heroOptions = [
    {
      h: "Your Indian Odyssey, <br /> Perfected by AI.",
      p: "From hidden Himalayan trails to the vibrant heart of the Pink City—get a bespoke, high-precision itinerary."
    },
    {
      h: "Don't Just Travel, <br /> Experience with AI.",
      p: "Skip the hours of research. Our intelligent planner crafts the ultimate route based on your unique travel style."
    },
    {
      h: "The Smartest Way <br /> to Discover India.",
      p: "Let our AI navigate the complexities of planning. You focus on the memories while we handle the perfect itinerary."
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
    { name: "Goa", tagline: "Sun, Sand & Charms", img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80" },
    { name: "Manali", tagline: "Himalayan Snow Peaks", img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80" },
    { name: "Kerala", tagline: "Backwaters & Tea", img: "https://images.unsplash.com/photo-1593179241557-bce1eb92e47e?auto=format&fit=crop&w=800&q=80" },
    { name: "Jaipur", tagline: "Royal Pink City", img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80" },
  ];

  const scrollToDestinations = () => {
    destRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="home-redesign">
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
      
      <section className="hero-section container">
        <div className="hero-grid">
          <motion.div 
            className="hero-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 dangerouslySetInnerHTML={{ __html: heroText.h }}></h1>
            <p>{heroText.p}</p>
            <div className="hero-actions">
              <motion.button 
                whileTap={{ scale: 0.95 }}
                className="btn-large btn-primary" 
                onClick={() => navigate('/planner')}
              >
                Start Planning
              </motion.button>
              <motion.button 
                whileTap={{ scale: 0.95 }}
                className="btn-large btn-secondary" 
                onClick={() => navigate('/create-poll')}
              >
                Group Vote
              </motion.button>
            </div>
          </motion.div>
          <div className="hero-preview-container desktop-only">
            <InteractiveHeroImages />
          </div>
        </div>
      </section>

      <div className="container">
        <div className="actions-grid">
          {[
            { label: "AI Planner", icon: "🤖", path: "/planner", desc: "Craft custom itinerary." },
            { label: "Polls", icon: "🗳️", path: "/create-poll", desc: "Vote with friends." },
            { label: "Map", icon: "🗺️", path: "/map", desc: "Visual exploration." },
            { label: "Explore", icon: "✨", action: scrollToDestinations, desc: "Top destinations." },
          ].map((action, i) => (
            <motion.div 
              key={i}
              whileTap={{ scale: 0.97 }}
              className="action-card" 
              onClick={() => action.path ? navigate(action.path) : action.action()}
            >
              <div className="action-icon">{action.icon}</div>
              <div className="action-info">
                <h3>{action.label}</h3>
                <p className="desktop-only">{action.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <section className="matchmaker-section container">
        <div className="matchmaker-card">
          <div className="mm-content">
            <div className="mm-badge">AI Matchmaker</div>
            <h2>Find Your Soul Destination</h2>
            <div className="mm-controls">
              <div className="mm-group">
                <label>Vibe</label>
                <div className="mm-options">
                  {['🏔️ Adventure', '🏖️ Relaxed', '🛕 Heritage'].map(m => (
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
            </div>
          </div>
          <motion.div 
            className="mm-result"
            key={selectedMood}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="mm-result-card" onClick={() => navigate('/planner', { state: { prefilledCity: matchData[selectedMood]?.name } })}>
              <img src={matchData[selectedMood]?.img} alt="Match" />
              <div className="mm-result-info">
                <h3>{matchData[selectedMood]?.name}</h3>
                <p>{matchData[selectedMood]?.desc}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="destinations" className="container" ref={destRef}>
        <div className="section-header">
          <h2>Trending Now</h2>
          <button className="btn-tertiary" onClick={() => navigate('/destinations')}>View All →</button>
        </div>
        <div className="dest-grid">
          {destinations.map((d, i) => (
            <motion.div 
              key={i} 
              className="dest-card"
              whileTap={{ scale: 0.98 }}
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

      <MinimalReviewSection />
    </div>
  );
};

export default Home;
