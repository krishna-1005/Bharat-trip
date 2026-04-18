import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useSettings } from "../context/SettingsContext";
import MinimalReviewSection from "../components/MinimalReviewSection";
import BrandPromotion from "../components/BrandPromotion";
import PlaceImage from "../components/PlaceImage";
import JoinByCode from "../components/JoinByCode";
import "./home.css";

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
      initial={{ opacity: 1, scale: place.scale }}
      animate={{ opacity: 1, scale: place.scale }}
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

const TravelFeed = () => {
  const navigate = useNavigate();
  const { formatPrice } = useSettings();

  const trending = [
    { id: 3001, title: "Golden Triangle Luxury", city: "Delhi, Jaipur", days: 5, cost: 42000, tags: ["History", "Royal"], img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=800" },
    { id: 3002, title: "Kerala Backwater Bliss", city: "Alleppey", days: 4, cost: 22000, tags: ["Nature", "Relaxed"], img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800" },
    { id: 3003, title: "Goa Beach Party", city: "North Goa", days: 3, cost: 15000, tags: ["Party", "Beach"], img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800" }
  ];

  const ideas = [
    { id: 3004, title: "Spirituality in Kashi", city: "Varanasi", days: 3, cost: 12000, tags: ["Culture", "Spiritual"], img: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=800" },
    { id: 3005, title: "Yoga Retreat", city: "Rishikesh", days: 5, cost: 18000, tags: ["Wellness", "Adventure"], img: "https://images.unsplash.com/photo-1545105511-923f63f29e07?q=80&w=800" }
  ];

  const FeedRow = ({ title, items, badge }) => (
    <div style={{ marginBottom: '60px', display: 'block', width: '100%' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#ffffff', opacity: 1, margin: 0 }}>{title}</h2>
        {badge && <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '4px 14px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '800', opacity: 1 }}>{badge}</span>}
      </div>
      <div style={{ display: 'flex', gap: '24px', overflowX: 'auto', padding: '10px 20px 40px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', alignItems: 'flex-start' }}>
        {items.map(item => (
          <div 
            key={item.id} 
            style={{ minWidth: '280px', width: '280px', background: '#16161a', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column', flexShrink: 0, cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', opacity: 1 }}
            onClick={() => navigate('/planner', { state: { prefilledCity: item.city.split(',')[0].trim() } })}
          >
            <div style={{ width: '100%', height: '180px', background: '#000', position: 'relative', display: 'block' }}>
              <img src={item.img} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 1 }} />
              <span style={{ position: 'absolute', top: '16px', left: '16px', background: '#3b82f6', color: '#ffffff', padding: '5px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '900', opacity: 1, zIndex: 10 }}>{badge || 'HOT'}</span>
            </div>
            <div style={{ padding: '24px', background: '#16161a', display: 'flex', flexDirection: 'column', gap: '12px', opacity: 1, visibility: 'visible' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8', fontWeight: '700', opacity: 1 }}>
                <span>📍 {item.city}</span>
                <span>{item.days}d</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff', margin: '0', display: 'block', opacity: 1 }}>{item.title}</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', opacity: 1 }}>
                {item.tags.map(t => <span key={t} style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: '800', opacity: 1 }}>{t}</span>)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px', marginTop: '4px', opacity: 1 }}>
                <span style={{ fontWeight: '900', color: '#ffffff', fontSize: '1.2rem', opacity: 1 }}>{formatPrice(item.cost)}</span>
                <button style={{ padding: '10px 20px', background: '#3b82f6', color: '#ffffff', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '0.85rem', opacity: 1 }}>Plan ⚡</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <section style={{ padding: '80px 0', background: '#050505', position: 'relative', zIndex: 10 }}>
      <FeedRow title="Trending Destinations" items={trending} badge="TRENDING" />
      <FeedRow title="Travel Ideas" items={ideas} />
    </section>
  );
};

const FeaturedTrips = () => {
  const [trips, setTrips] = useState([]);
  const navigate = useNavigate();
  const { formatPrice } = useSettings();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/public/featured-trips`)
      .then(res => res.json())
      .then(data => { if (data.trips) setTrips(data.trips); })
      .catch(err => console.error("Featured trips error:", err));
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
    <section className="featured-section">
      <div className="section-header-v2 container">
        <div className="sh-left">
          <span className="premium-badge-v2">COMMUNITY MASTERPIECES</span>
          <h2>Top Rated Itineraries</h2>
        </div>
        <button className="sh-btn" onClick={() => navigate('/destinations')}>Explore More →</button>
      </div>

      <div className="featured-grid">
        {trips.map((trip) => (
          <div key={trip.id} className="featured-card">
            <div className="f-card-img">
              <PlaceImage placeName={trip.destination} city={trip.destination} />
              <div className="f-card-badge">{trip.days} Days</div>
            </div>
            <div className="f-card-content">
              <div className="f-card-meta">
                <span className="f-dest">📍 {trip.destination}</span>
                <span className="f-price">{formatPrice(trip.cost)}</span>
              </div>
              <h3>{trip.title}</h3>
              <button className="f-clone-btn" onClick={() => handleClone(trip)}>
                Clone Journey ⚡
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
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

  const [heroText, setHeroText] = useState(heroOptions[0]);

  useEffect(() => {
    const idx = Math.floor(Math.random() * heroOptions.length);
    setHeroText(heroOptions[idx]);
  }, []);

  useEffect(() => {
    const handleGlobalMouse = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleGlobalMouse);
    return () => window.removeEventListener('mousemove', handleGlobalMouse);
  }, []);

  const destinations = [
    { name: "Goa", tagline: "Sun, Sand & Charms", img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800" },
    { name: "Manali", tagline: "Himalayan Snow Peaks", img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80" },
    { name: "Kerala", tagline: "Backwaters & Tea", img: "https://images.unsplash.com/photo-1593179241557-bce1eb92e47e?auto=format&fit=crop&w=800&q=80" },
    { name: "Jaipur", tagline: "Royal Pink City", img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80" },
  ];

  return (
    <div className="home-redesign">
      <div className="interactive-bg">
        <motion.div 
          className="bg-blob"
          animate={{ x: mousePos.x - 150, y: mousePos.y - 150 }}
          transition={{ type: 'spring', damping: 30, stiffness: 50 }}
        />
      </div>

      <section className="hero-section container">
        <div className="hero-grid">
          <div className="hero-content">
            <h1 dangerouslySetInnerHTML={{ __html: heroText.h }}></h1>
            <p>{heroText.p}</p>
            <div className="hero-actions">
              <button className="btn-large btn-primary" onClick={() => navigate('/trip-type')}>
                Start Planning
              </button>
              <button className="btn-large btn-secondary" onClick={() => navigate('/destinations')}>
                Explore Trips
              </button>
            </div>
          </div>
          <div className="hero-preview-container desktop-only">
            <InteractiveHeroImages />
          </div>
        </div>
      </section>

      <BrandPromotion />

      <section className="container onboarding-decision-section">
        <div className="section-header">
          <h2>Quick Actions</h2>
        </div>
        <div className="decision-grid">
          <div className="decision-card" onClick={() => navigate('/trip-type')}>
            <div className="decision-icon">🤖</div>
            <h3>Plan New</h3>
          </div>
          <div className="decision-card" onClick={() => navigate('/destinations')}>
            <div className="decision-icon">✨</div>
            <h3>Top Rated</h3>
          </div>
          <div className="decision-card" onClick={() => navigate('/create-poll')}>
            <div className="decision-icon">🗳️</div>
            <h3>Group Poll</h3>
          </div>
        </div>
      </section>

      <TravelFeed />

      <FeaturedTrips />

      <section className="container">
        <div className="section-header">
          <h2>Trending Now</h2>
        </div>
        <div className="dest-grid">
          {destinations.map((d, i) => (
            <div key={i} className="dest-card" onClick={() => navigate(`/explore/${d.name}`)}>
              <img src={d.img} alt={d.name} />
              <div className="dest-overlay">
                <h3>{d.name}</h3>
                <span className="dest-tagline">{d.tagline}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <MinimalReviewSection />
    </div>
  );
};

export default Home;
