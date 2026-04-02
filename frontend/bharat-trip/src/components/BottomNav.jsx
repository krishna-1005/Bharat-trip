import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import './bottomNav.css';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Home', icon: '🏠', path: '/' },
    { label: 'Explore', icon: '🌍', path: '/destinations' },
    { label: 'AI Plan', icon: '✨', path: '/planner' },
    { label: 'Trips', icon: '🗺️', path: '/trips' },
    { label: 'Profile', icon: '👤', path: '/profile' },
  ];

  return (
    <nav className="bottom-nav mobile-only">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <motion.button
            key={item.path}
            className={`bn-item ${isActive ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
            whileTap={{ scale: 0.9 }}
            initial={false}
          >
            <span className="bn-icon">{item.icon}</span>
            <span className="bn-label">{item.label}</span>
            {isActive && (
              <motion.div 
                layoutId="activeTab"
                className="bn-active-bg"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </motion.button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
