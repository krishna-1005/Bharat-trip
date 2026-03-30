import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './tripType.css';

const TripType = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const cardVariants = {
    hidden: { y: 40, opacity: 0, scale: 0.95 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <div className="tt-premium-root">
      {/* Dynamic Background */}
      <div className="tt-bg-ambient">
        <div className="tt-blob tt-blob-1"></div>
        <div className="tt-blob tt-blob-2"></div>
        <div className="tt-grid-overlay"></div>
      </div>

      <motion.div 
        className="tt-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.header className="tt-header" variants={cardVariants}>
          <div className="tt-badge-ai">AI-POWERED PLANNING</div>
          <h1 className="tt-main-title">
            Define your <span>Odyssey</span>
          </h1>
          <p className="tt-subtitle">
            Precision-engineered travel routes tailored to your pace. 
            Choose your architectural foundation for the perfect journey.
          </p>
        </motion.header>

        <div className="tt-selection-grid">
          {/* Single Destination Card */}
          <motion.div 
            className="tt-card tt-card-single"
            variants={cardVariants}
            onClick={() => navigate('/planner')}
            whileHover={{ y: -15, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="tt-card-glass"></div>
            <div className="tt-card-content">
              <div className="tt-icon-box">
                <span className="tt-icon-glow"></span>
                <span className="tt-icon-main">📍</span>
              </div>
              <h2 className="tt-card-title">Single Core</h2>
              <div className="tt-card-divider"></div>
              <p className="tt-card-desc">
                In-depth optimization for a single metropolitan or regional hub. 
                Perfect for immersive weekend escapes.
              </p>
              <div className="tt-card-features">
                <span>✦ Dynamic Itinerary</span>
                <span>✦ Local Gems</span>
              </div>
              <div className="tt-cta-wrap">
                <span className="tt-cta-text">Initialize Blueprint</span>
                <span className="tt-cta-arrow">→</span>
              </div>
            </div>
          </motion.div>

          {/* Multi-City Card */}
          <motion.div 
            className="tt-card tt-card-multi"
            variants={cardVariants}
            onClick={() => navigate('/multi-city')}
            whileHover={{ y: -15, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="tt-card-glass"></div>
            <div className="tt-card-content">
              <div className="tt-icon-box">
                <span className="tt-icon-glow color-purple"></span>
                <span className="tt-icon-main">🗺️</span>
              </div>
              <h2 className="tt-card-title">Multi-Node</h2>
              <div className="tt-card-divider"></div>
              <p className="tt-card-desc">
                Complex route synchronization across multiple geographical nodes. 
                Ideal for cross-country exploration.
              </p>
              <div className="tt-card-features">
                <span>✦ Route Sync</span>
                <span>✦ Transit Logic</span>
              </div>
              <div className="tt-cta-wrap">
                <span className="tt-cta-text">Configure Odyssey</span>
                <span className="tt-cta-arrow">→</span>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.footer className="tt-footer" variants={cardVariants}>
          <div className="tt-footer-line"></div>
          <span className="tt-footer-text">SYNERGY OF HUMAN INTUITION & MACHINE PRECISION</span>
        </motion.footer>
      </motion.div>
    </div>
  );
};

export default TripType;
