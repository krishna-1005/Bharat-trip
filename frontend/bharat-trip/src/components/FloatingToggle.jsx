import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

const FloatingToggle = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMapView = location.pathname.includes("/map");

  const toggleView = () => {
    if (isMapView) {
      navigate("/results");
    } else {
      navigate("/map");
    }
  };

  return (
    <motion.button
      className="mobile-floating-toggle-fab"
      onClick={toggleView}
      initial={{ scale: 0, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <div className="fab-content-inner">
        <AnimatePresence mode="wait">
          <motion.span
            key={isMapView ? "map" : "list"}
            initial={{ rotateY: -180, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 180, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fab-icon"
          >
            {isMapView ? "📝" : "📍"}
          </motion.span>
        </AnimatePresence>
        <span className="fab-text">
          {isMapView ? "View Itinerary" : "View Map"}
        </span>
      </div>
    </motion.button>
  );
};

export default FloatingToggle;
