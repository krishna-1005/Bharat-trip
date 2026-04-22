import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/safetyModal.css';

const EMERGENCY_MAP = {
  "Bangalore": {
    police: "112",
    ambulance: "108",
    fire: "101",
    tourist: "1363",
    women: "1091",
    special: "Bangalore Police: 080 2294 2222"
  },
  "Delhi": {
    police: "112",
    ambulance: "102",
    fire: "101",
    tourist: "1363",
    women: "1091",
    special: "Delhi Police: 011 2349 0233"
  },
  "Mumbai": {
    police: "112",
    ambulance: "108",
    fire: "101",
    tourist: "1363",
    women: "1091",
    special: "Mumbai Police: 022 2262 0111"
  },
  "Default": {
    police: "112",
    ambulance: "108",
    fire: "101",
    tourist: "1363",
    women: "1091",
    special: "National Emergency Number: 112"
  }
};

const SafetyModal = ({ isOpen, onClose, city, userLocation }) => {
  const contacts = EMERGENCY_MAP[city] || EMERGENCY_MAP["Default"];

  const handleShareLocation = async (platform) => {
    let locStr = "My current location";
    if (userLocation) {
      locStr = `https://www.google.com/maps?q=${userLocation.lat},${userLocation.lng}`;
    } else if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const url = `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`;
        sendShare(url, platform);
      }, () => {
        alert("Could not access location. Please enable GPS.");
      });
      return;
    }
    sendShare(locStr, platform);
  };

  const sendShare = (url, platform) => {
    const text = `🚨 Emergency Location Sharing: ${url}`;
    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    } else {
      window.open(`sms:?body=${encodeURIComponent(text)}`, '_blank');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="safety-modal-overlay" onClick={onClose}>
          <motion.div 
            className="safety-modal-content" 
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="safety-modal-header">
              <span className="safety-icon-header">🛡️</span>
              <h3>Safety & Emergency</h3>
              <button className="close-safety-btn" onClick={onClose}>Ã—</button>
            </div>

            <div className="safety-city-badge">
              Exploring: {city || "India"}
            </div>

            <div className="emergency-grid">
              <a href={`tel:${contacts.police}`} className="emergency-card police">
                <span className="em-icon">🚔</span>
                <span className="em-label">Police</span>
                <span className="em-number">{contacts.police}</span>
              </a>
              <a href={`tel:${contacts.ambulance}`} className="emergency-card ambulance">
                <span className="em-icon">🚑</span>
                <span className="em-label">Ambulance</span>
                <span className="em-number">{contacts.ambulance}</span>
              </a>
              <a href={`tel:${contacts.tourist}`} className="emergency-card tourist">
                <span className="em-icon">â„¹ï¸</span>
                <span className="em-label">Tourist Help</span>
                <span className="em-number">{contacts.tourist}</span>
              </a>
              <a href={`tel:${contacts.women}`} className="emergency-card women">
                <span className="em-icon">👩</span>
                <span className="em-label">Women Help</span>
                <span className="em-number">{contacts.women}</span>
              </a>
            </div>

            {contacts.special && (
              <div className="special-contact-info">
                <span>📍 {contacts.special}</span>
              </div>
            )}

            <div className="location-share-section">
              <h4>Instant Location Sharing</h4>
              <p>Share your live coordinates with family or local authorities.</p>
              <div className="share-btns-row">
                <button className="share-btn wa" onClick={() => handleShareLocation('whatsapp')}>
                  Share via WhatsApp
                </button>
                <button className="share-btn sms" onClick={() => handleShareLocation('sms')}>
                  Share via SMS
                </button>
              </div>
            </div>

            <div className="safety-tips-footer">
              <p>GoTripo: Traveling safe is traveling smart.</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SafetyModal;