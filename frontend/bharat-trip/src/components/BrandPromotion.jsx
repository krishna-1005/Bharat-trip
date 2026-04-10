import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import "./brandPromotion.css";

const BrandPromotion = () => {
  const slogans = [
    "Plan Smarter.",
    "Travel Together.",
    "Explore Further.",
    "Go Anywhere with GoTripo."
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slogans.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="brand-promo-container">
      <div className="promo-overlay"></div>
      
      <div className="animated-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="promo-content">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="promo-logo-glitch"
        >
          <h1 className="promo-title">GoTripo</h1>
          <div className="promo-title-copy copy-1">GoTripo</div>
          <div className="promo-title-copy copy-2">GoTripo</div>
        </motion.div>

        <div className="promo-slogan-wrapper">
          <AnimatePresence mode="wait">
            <motion.span 
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="promo-slogan-active"
            >
              {slogans[index]}
            </motion.span>
          </AnimatePresence>
        </div>

        <motion.div 
          className="promo-stats"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="stat-item">
            <span className="stat-number">100+</span>
            <span className="stat-label">Destinations</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">AI</span>
            <span className="stat-label">Itineraries</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">Real-time</span>
            <span className="stat-label">Collaboration</span>
          </div>
        </motion.div>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="promo-cta"
        >
          Experience the Future of Travel
        </motion.button>
      </div>

      <motion.div 
        animate={{ 
          x: [0, 50, -50, 0],
          y: [0, -30, 30, 0],
          rotate: [0, 10, -10, 0]
        }}
        transition={{ duration: 10, repeat: Infinity }}
        className="floating-plane-v2"
      >
        ✈️
      </motion.div>
    </section>
  );
};

export default BrandPromotion;
