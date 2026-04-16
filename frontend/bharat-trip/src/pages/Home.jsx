import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useSettings } from "../context/SettingsContext";
import MinimalReviewSection from "../components/MinimalReviewSection";
import BrandPromotion from "../components/BrandPromotion";
import PlaceImage from "../components/PlaceImage";
import JoinByCode from "../components/JoinByCode";
import "./home.css";

import ThreeScene from "../components/ThreeScene";

const FloatingImageCard = ({ place, index, sx, sy }) => {
  const x = useTransform(sx, (val) => val * (index + 1) * 0.5);
  const y = useTransform(sy, (val) => val * (index + 1) * 0.5);

  return (
    <motion.div
      className={`floating-image-card card-${index}`}
      style={{
        x,
        y,
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
  );
};

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
      img: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80",
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
      name: "Amber Fort",
      img: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80",
      x: 50, y: 30, rotate: 5, scale: 1.05
    }
  ];

  return (
    <div className="hero-interactive-images">
      {famousPlaces.map((place, index) => (
        <FloatingImageCard 
          key={index} 
          place={place} 
          index={index} 
          sx={sx} 
          sy={sy} 
        />
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
    const interval = setInterval(fetchActivity, 15000);
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
        <h2>The Pulse of GoTripo</h2>
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

const TravelFeed = () => {
  const navigate = useNavigate();
  const { formatPrice } = useSettings();

  const trending = [
    { id: 1, title: "Golden Triangle Luxury", city: "Delhi, Agra, Jaipur", days: 6, cost: 45000, tags: ["History", "Luxury"], img: "https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&w=800&q=80" },
    { id: 2, title: "Kerala Backwater Bliss", city: "Alleppey", days: 4, cost: 22000, tags: ["Nature", "Relaxed"], img: "https://images.unsplash.com/photo-1593179241557-bce1eb92e47e?auto=format&fit=crop&w=800&q=80" },
    { id: 3, title: "Goa Beach Party", city: "North Goa", days: 3, cost: 15000, tags: ["Party", "Beach"], img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80" }
  ];

  const ideas = [
    { id: 4, title: "Spirituality in Kashi", city: "Varanasi", days: 3, cost: 12000, tags: ["Culture", "Spiritual"], img: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80" },
    { id: 5, title: "Yoga Retreat", city: "Rishikesh", days: 5, cost: 18000, tags: ["Wellness", "Adventure"], img: "https://images.unsplash.com/photo-1545105511-923f63f29e07?auto=format&fit=crop&w=800&q=80" },
    { id: 6, title: "Tea Gardens Escape", city: "Munnar", days: 4, cost: 20000, tags: ["Nature", "Hills"], img: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80" }
  ];

  const gems = [
    { id: 7, title: "The Ruins of Hampi", city: "Hampi", days: 3, cost: 10000, tags: ["Heritage", "Ancient"], img: "https://images.unsplash.com/photo-1600100397608-f010e4aa0984?auto=format&fit=crop&w=800&q=80" },
    { id: 8, title: "French Quarter Stroll", city: "Pondicherry", days: 3, cost: 14000, tags: ["Culture", "Coastal"], img: "https://images.unsplash.com/photo-1589793907316-f94025b46850?auto=format&fit=crop&w=800&q=80" },
    { id: 9, title: "Boulders & Bicycles", city: "Badami", days: 2, cost: 8000, tags: ["Adventure", "History"], img: "https://images.unsplash.com/photo-1623150502742-6a849aa94be4?auto=format&fit=crop&w=800&q=80" }
  ];

  const FeedRow = ({ title, items, badge }) => (
    <div className="feed-row">
      <div className="feed-row-header">
        <h2>{title}</h2>
        <span className="btn-tertiary">View All →</span>
      </div>
      <div className="feed-scroll-container">
        {items.map(item => (
          <motion.div 
            key={item.id} 
            className="feed-card"
            whileHover={{ y: -5 }}
            onClick={() => navigate('/planner', { state: { prefilledCity: item.city.split(',')[0].trim() } })}
          >
            <div className="feed-card-img">
              <img src={item.img} alt={item.title} />
              {badge && <span className="feed-badge">{badge}</span>}
            </div>
            <div className="feed-card-content">
              <div className="feed-card-meta">
                <span>📍 {item.city}</span>
                <span>{item.days} Days</span>
              </div>
              <h3 className="feed-card-title">{item.title}</h3>
              <div className="feed-card-tags">
                {item.tags.map(t => <span key={t} className="feed-tag">{t}</span>)}
              </div>
              <div style={{ marginTop: '10px', fontWeight: '800', color: 'var(--text-main)' }}>
                {formatPrice(item.cost)}
              </div>
              <button className="feed-plan-btn">
                Plan this trip ⚡
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <section className="travel-feed-section container">
      <div className="feed-container">
        <FeedRow title="Trending Destinations" items={trending} badge="TRENDING" />
        <FeedRow title="Travel Ideas" items={ideas} />
        <FeedRow title="Hidden Gems" items={gems} badge="RARE" />
      </div>
    </section>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const destRef = useRef(null);

  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipStep, setTooltipStep] = useState(0);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth > 1024);
    window.addEventListener('resize', handleResize);
    
    const hasSeenGuide = localStorage.getItem("hasSeenGuide");
    if (!hasSeenGuide) {
      setTimeout(() => setShowTooltip(true), 2000);
    }

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const tooltips = [
    { title: "Welcome to GoTripo!", text: "Your AI-powered travel companion. Let's show you around." },
    { title: "Smart Planning", text: "Click 'Start Planning' to get a bespoke itinerary in seconds." },
    { title: "Group Polls", text: "Planning with friends? Create a poll and let the group decide." }
  ];

  const handleNextTooltip = () => {
    if (tooltipStep < tooltips.length - 1) {
      setTooltipStep(tooltipStep + 1);
    } else {
      setShowTooltip(false);
      localStorage.setItem("hasSeenGuide", "true");
    }
  };

  const handleQuickStart = () => {
    navigate('/planner', { 
      state: { 
        prefilledCity: "Goa",
        prefilledDays: 3,
        prefilledBudget: "Comfort"
      } 
    });
  };

  const handleViewSample = () => {
    navigate('/explore/Goa');
  };

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

  const matchData = {
    '🏔️ Adventure': { name: 'Manali', desc: 'Snow-capped peaks and thrilling paragliding.', img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80' },
    '🏖️ Relaxed': { name: 'Goa', desc: 'Golden sands and soulful sunsets.', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80' },
    '🛕 Heritage': { name: 'Hampi', desc: 'Ancient ruins and architectural marvels.', img: 'https://images.unsplash.com/photo-1600100397608-f010e4aa0984?auto=format&fit=crop&w=800&q=80' },
    '🎭 Culture': { name: 'Varanasi', desc: 'The spiritual heart of timeless India.', img: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80' },
    '💖 Romantic': { name: 'Udaipur', desc: 'Palaces, lakes, and royal romance.', img: 'https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?auto=format&fit=crop&w=800&q=80' },
  };

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

      <AnimatePresence>
        {showTooltip && (
          <motion.div 
            className="tooltip-guide-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="tooltip-card"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
            >
              <div className="tooltip-dot" />
              <h3>{tooltips[tooltipStep].title}</h3>
              <p>{tooltips[tooltipStep].text}</p>
              <div className="tooltip-actions">
                <button className="btn-tertiary" onClick={() => { setShowTooltip(false); localStorage.setItem("hasSeenGuide", "true"); }}>Skip</button>
                <button className="btn-primary" style={{ padding: '10px 24px', borderRadius: '10px' }} onClick={handleNextTooltip}>
                  {tooltipStep === tooltips.length - 1 ? "Finish" : "Next →"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
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
              
              <button className="btn-sample" onClick={handleViewSample}>
                <div className="icon-circle">▶</div>
                View Sample Trip
              </button>
            </div>
          </motion.div>
          <div className="hero-preview-container desktop-only">
            <InteractiveHeroImages />
          </div>
        </div>

        <motion.div 
          className="hero-scroll-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
          onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
        >
          <span className="scroll-text">Explore GoTripo</span>
          <div className="scroll-arrow">↓</div>
        </motion.div>
      </section>

      <BrandPromotion />

      {/* Added ID for scrolling */}
      <section id="features" className="container onboarding-decision-section">
        <div className="section-header">
          <h2>What do you want to do?</h2>
          <p className="dashboard-subtitle">Quickly jump into your next travel phase</p>
        </div>
        <div className="decision-grid">
          <motion.div whileHover={{ y: -5 }} className="decision-card" onClick={() => navigate('/trip-type')}>
            <div className="decision-icon">🤖</div>
            <h3>Plan a Trip</h3>
            <p>Get an AI-crafted itinerary for any destination.</p>
          </motion.div>
          <motion.div whileHover={{ y: -5 }} className="decision-card" onClick={() => navigate('/destinations')}>
            <div className="decision-icon">✨</div>
            <h3>Explore Trips</h3>
            <p>Discover hand-picked journeys from the community.</p>
          </motion.div>
          <motion.div whileHover={{ y: -5 }} className="decision-card" onClick={() => navigate('/create-poll')}>
            <div className="decision-icon">🗳️</div>
            <h3>Use Polls</h3>
            <p>Can't decide? Let your group vote on the best spot.</p>
          </motion.div>
        </div>

        <JoinByCode />

        <div className="quick-start-bar">
          <div className="quick-start-info">
            <h4>Plan a trip in 30 seconds</h4>
            <p>Let us pre-fill a popular 3-day Goa itinerary for you.</p>
          </div>
          <button className="btn-primary" style={{ padding: '14px 28px', borderRadius: '12px' }} onClick={handleQuickStart}>
            Quick Start ✨
          </button>
        </div>
      </section>

      {/* Added ID for scrolling */}
      <section id="how-it-works" className="container travel-feed-section">
        <div className="feed-container">
          <TravelFeed />
        </div>
      </section>

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

      <BrandPromotion />
      <MinimalReviewSection />
    </div>
  );
};

export default Home;
