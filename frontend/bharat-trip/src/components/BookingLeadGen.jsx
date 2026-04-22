import React from 'react';
import { motion } from 'framer-motion';
import './bookingLeadGen.css';

/**
 * BookingLeadGen Component
 * Dynamically constructs affiliate/lead-gen links for hotels and flights.
 */
const BookingLeadGen = ({ plan }) => {
  if (!plan) return null;

  const destination = plan.city || 'India';
  const days = plan.days || 1;

  // ── DYNAMIC URL BUILDERS ──
  
  // Construct Booking.com Hotel Search
  const getBookingUrl = () => {
    const baseUrl = "https://www.booking.com/searchresults.html";
    const params = new URLSearchParams({
      ss: destination,
      label: "GoTripo-referral", // Your tracking ID
      aid: "123456" // Theoretical Affiliate ID
    });
    return `${baseUrl}?${params.toString()}`;
  };

  // Construct MakeMyTrip Flight Search
  const getFlightUrl = () => {
    // Note: Most flight engines require specific date formats. 
    // We'll use a general search query here.
    return `https://www.makemytrip.com/flights/search?query=${encodeURIComponent(destination)}`;
  };

  // ── TRACKING LOGIC ──
  const handleReferralClick = (platform) => {
    // In a real app, you'd send this to your analytics (e.g., Firebase Analytics)
    console.log(`[REFERRAL TRACK] User clicked ${platform} for ${destination}`);
    
    // Example: localStorage tracking for simple "lead gen" stats
    const stats = JSON.parse(localStorage.getItem('referral_stats') || '{}');
    stats[platform] = (stats[platform] || 0) + 1;
    localStorage.setItem('referral_stats', JSON.stringify(stats));
  };

  return (
    <motion.div 
      className="booking-sticky-card"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 100 }}
    >
      <div className="booking-content">
        <div className="booking-info">
          <span className="booking-badge">PREMIUM PARTNERS</span>
          <h3>Ready to turn this blueprint into reality?</h3>
          <p>Book your stay and transit at the best rates available today.</p>
        </div>
        
        <div className="booking-actions">
          <a 
            href={getBookingUrl()} 
            target="_blank" 
            rel="noopener noreferrer"
            className="book-btn booking-com"
            onClick={() => handleReferralClick('booking_com')}
          >
            <span className="btn-icon">🏨</span>
            View Hotels
          </a>
          
          <a 
            href={getFlightUrl()} 
            target="_blank" 
            rel="noopener noreferrer"
            className="book-btn makemytrip"
            onClick={() => handleReferralClick('makemytrip')}
          >
            <span className="btn-icon">✈️</span>
            Check Flights
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default BookingLeadGen;
