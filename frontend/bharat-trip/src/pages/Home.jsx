import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useSettings } from "../context/SettingsContext";
import MinimalReviewSection from "../components/MinimalReviewSection";
import PlaceImage from "../components/PlaceImage";
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

const TripPulse = () => {
  const [activeTrips, setActiveTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActivity = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/public/recent-activity`);
      const data = await res.json();
      if (data.activity && data.activity.length > 0) {
        // Format time to relative string
        const formatted = data.activity.map(a => {
          const diff = Math.floor((new Date() - new Date(a.time)) / 60000);
          let timeStr = "Just now";
          if (diff > 0 && diff < 60) timeStr = `${diff}m ago`;
          else if (diff >= 60 && diff < 1440) timeStr = `${Math.floor(diff / 60)}h ago`;
          else if (diff >= 1440) timeStr = `${Math.floor(diff / 1440)}d ago`;
          
          return { ...a, timeStr };
        });
        setActiveTrips(formatted.slice(0, 3));
      }
    } catch (err) {
      console.error("Error fetching live pulse:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
    const interval = setInterval(fetchActivity, 15000); // Refresh every 15s
    return () => clearInterval(interval);
  }, []);

  if (loading && activeTrips.length === 0) return null;
  if (!loading && activeTrips.length === 0) return null;

  return (
    <section className="pulse-section container">
      <div className="pulse-header">
        <div className="pulse-live-tag">
          <span className="pulse-dot"></span>
          REAL-TIME ACTIVITY
        </div>
        <h2>The Pulse of Bharat Trip</h2>
        <p>Actual destinations being explored by our community right now.</p>
      </div>

      <div className="pulse-grid">
        <AnimatePresence mode="popLayout">
          {activeTrips.map((trip) => (
            <motion.div
              key={trip.id}
              layout
              initial={{ opacity: 0, x: -20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="pulse-card"
            >
              <div className="pulse-card-icon">✨</div>
              <div className="pulse-card-content">
                <div className="pulse-user-info">
                  <strong>{trip.user}</strong> is exploring <span>{trip.type}</span> spots
                </div>
                <div className="pulse-location-info">
                  <h3>{trip.city}</h3>
                  <span className="pulse-time">{trip.timeStr}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        <div className="pulse-stats-mini">
          <div className="mini-stat">
            <span className="stat-num">Live</span>
            <span className="stat-lab">Database Feed</span>
          </div>
          <div className="mini-stat">
            <span className="stat-num">Verified</span>
            <span className="stat-lab">User Interest</span>
          </div>
        </div>
      </div>
    </section>
  );
};

const FeaturedTrips = () => {
  const [trips, setTrips] = useState([]);
  const navigate = useNavigate();
  const { formatPrice } = useSettings();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/public/featured-trips`);
        const data = await res.json();
        if (data.trips) setTrips(data.trips);
      } catch (err) {
        console.error("Featured trips error:", err);
      }
    };
    fetchFeatured();
  }, []);

  const handleClone = (trip) => {
    const itineryObj = {};
    if (Array.isArray(trip.itinerary)) {
      trip.itinerary.forEach((d, idx) => {
        const key = d.day || `Day ${idx + 1}`;
        itineryObj[key] = {
          places: d.places,
          estimatedCost: d.estimatedCost,
          estimatedHours: d.estimatedHours,
          color: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"][idx % 4]
        };
      });
    }
    const planData = {
      city: trip.destination,
      days: trip.days,
      itinerary: Object.keys(itineryObj).length > 0 ? itineryObj : trip.itinerary,
      totalTripCost: trip.cost,
      isCloned: true
    };
    localStorage.setItem("tripPlan", JSON.stringify(planData));
    navigate("/results", { state: { plan: planData, isNew: true } });
  };

  if (trips.length === 0) return null;

  return (
    <section className="featured-section container">
      <div className="section-header-v2">
        <div className="sh-left">
          <span className="premium-badge-v2">COMMUNITY MASTERPIECES</span>
          <h2>Top Rated Itineraries</h2>
          <p>Hand-crafted journeys by our elite travelers. Clone and customize your own.</p>
        </div>
        <button className="sh-btn" onClick={() => navigate('/destinations')}>Explore More →</button>
      </div>

      <div className="featured-grid">
        {trips.map((trip, i) => (
          <motion.div 
            key={trip.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
            className="featured-card"
          >
            <div className="f-card-img">
              <PlaceImage placeName={trip.destination} city={trip.destination} />
              <div className="f-card-badge">{trip.days} Days</div>
              <div className="f-card-saves">🔖 {trip.saves} saves</div>
            </div>
            <div className="f-card-content">
              <div className="f-card-meta">
                <span className="f-dest">📍 {trip.destination}</span>
                <span className="f-price">{formatPrice(trip.cost)}</span>
              </div>
              <h3>{trip.title}</h3>
              
              <div className="f-card-itinerary-preview" style={{ marginTop: '15px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(Array.isArray(trip.itinerary) ? trip.itinerary : Object.entries(trip.itinerary || {})).slice(0, 2).map((item, i) => {
                  const dayLabel = Array.isArray(trip.itinerary) ? (item.day || `Day ${i+1}`) : item[0];
                  const places = Array.isArray(trip.itinerary) ? item.places : item[1].places;
                  return (
                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--accent-blue)', opacity: 0.8, minWidth: '35px' }}>{dayLabel.toUpperCase()}</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {(places || []).slice(0, 2).map((p, pi) => (
                          <span key={pi} style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.05)', padding: '1px 6px', borderRadius: '4px' }}>
                            {p.name}
                          </span>
                        ))}
                        {(places || []).length > 2 && <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>+{places.length - 2}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button className="f-clone-btn" onClick={() => handleClone(trip)}>
                <span className="btn-text">Clone this Journey</span>
                <span className="btn-icon">⚡</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

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
                onClick={() => navigate('/trip-type')}
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
            { label: "AI Planner", icon: "🤖", path: "/trip-type", desc: "Craft custom itinerary." },
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

      <TripPulse />

      <FeaturedTrips />

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
