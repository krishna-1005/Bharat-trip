import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <button
          key={item.path}
          className={`bn-item ${location.pathname === item.path ? 'active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          <span className="bn-icon">{item.icon}</span>
          <span className="bn-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
