import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './planner.css';
import './tripType.css';

const TripType = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        cubicBezier: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <div className="planner-onboarding-page">
      {/* Background Ambience */}
      <div className="planner-hero-bg">
        <div className="planner-bg-overlay"></div>
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '400px',
          height: '400px',
          background: 'rgba(59, 130, 246, 0.05)',
          filter: 'blur(100px)',
          borderRadius: '50%',
          zIndex: 0
        }}></div>
      </div>

      <motion.div 
        className="trip-type-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="trip-type-header" variants={itemVariants}>
          <span className="planner-tagline">Journey Selection</span>
          <h1 className="planner-main-title">How would you like to<br /><em>explore</em>?</h1>
          <p className="planner-subtitle" style={{ margin: '0 auto' }}>
            Select your preferred planning mode. Whether it's a deep dive into one city or a grand multi-destination odyssey, our AI will craft the perfect route.
          </p>
        </motion.div>

        <div className="trip-type-grid">
          <motion.div 
            className="choice-card-premium"
            variants={itemVariants}
            onClick={() => navigate('/planner')}
            whileHover={{ y: -10 }}
          >
            <div className="choice-icon-wrap">📍</div>
            <h3 className="choice-title">Single Destination</h3>
            <p className="choice-description">
              Perfect for weekend getaways or in-depth city explorations. Get a highly optimized, localized daily itinerary.
            </p>
            <div className="choice-arrow">→</div>
          </motion.div>

          <motion.div 
            className="choice-card-premium"
            variants={itemVariants}
            onClick={() => navigate('/multi-city')}
            whileHover={{ y: -10 }}
          >
            <div className="choice-icon-wrap">🗺️</div>
            <h3 className="choice-title">Multi-City Odyssey</h3>
            <p className="choice-description">
              For the grand travelers. Plan complex routes across multiple cities with seamless transition logic and travel times.
            </p>
            <div className="choice-arrow">→</div>
          </motion.div>
        </div>

        <motion.div 
          variants={itemVariants}
          style={{ marginTop: '60px', opacity: 0.4, fontSize: '12px', letterSpacing: '2px', fontWeight: '700' }}
        >
          POWERED BY BHARAT TRIP AI
        </motion.div>
      </motion.div>
    </div>
  );
};

export default TripType;
