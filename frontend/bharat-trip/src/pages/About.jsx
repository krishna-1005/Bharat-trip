import React from "react";
import Navbar from "../components/Navbar";
import "../styles/global.css";

export default function About() {
  return (
    <div className="page">
      <Navbar />
      <h1>About Bharat Trip</h1>
      <p>
        Bharat Trip is an AI-powered travel planning platform designed to help you
        discover the beauty and diversity of India. Our mission is to make travel
        planning effortless, personalized, and inspiring.
      </p>
      
      <div className="page-grid">
        <div className="page-card">
          <h3>Our Vision</h3>
          <p>To be the leading companion for every traveler exploring the Indian subcontinent.</p>
        </div>
        <div className="page-card">
          <h3>Our Tech</h3>
          <p>We use advanced AI models to curate itineraries that match your unique vibes and interests.</p>
        </div>
      </div>

      <div style={{ marginTop: '40px' }}>
        <h3>Why Choose Us?</h3>
        <ul className="page-list">
          <li>✨ Hyper-personalized itineraries</li>
          <li>📍 Real-time location data</li>
          <li>💰 Accurate budget estimations</li>
          <li>📱 Mobile-first interactive experience</li>
        </ul>
      </div>
    </div>
  );
}