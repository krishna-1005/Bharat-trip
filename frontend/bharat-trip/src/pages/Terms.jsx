import React from "react";
import Navbar from "../components/Navbar";
import "../styles/global.css";

export default function Terms() {
  return (
    <div className="page about-page">
      
      <section className="about-hero" style={{ textAlign: "center", margin: "0 auto 40px" }}>
        <div className="premium-badge">LEGAL</div>
        <h1>Terms of <span className="highlight-blue">Service</span></h1>
        <p className="large-text">Please read these terms carefully before using our platform.</p>
      </section>

      <section className="premium-card" style={{ maxWidth: "800px", margin: "0 auto", padding: "40px", lineHeight: "1.8", color: "var(--text-dim)" }}>
        <h3 style={{ color: "var(--text-main)", marginBottom: "16px", fontSize: "1.5rem" }}>1. Acceptance of Terms</h3>
        <p style={{ marginBottom: "24px" }}>
          By accessing and using Bharat Trip, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
        </p>

        <h3 style={{ color: "var(--text-main)", marginBottom: "16px", fontSize: "1.5rem" }}>2. Use of the Service</h3>
        <p style={{ marginBottom: "24px" }}>
          You must not use the service for any illegal or unauthorized purpose. You must not, in the use of the service, violate any laws in your jurisdiction (including but not limited to copyright laws).
        </p>

        <h3 style={{ color: "var(--text-main)", marginBottom: "16px", fontSize: "1.5rem" }}>3. AI-Generated Itineraries</h3>
        <p style={{ marginBottom: "24px" }}>
          Bharat Trip uses artificial intelligence to generate travel itineraries. While we strive for accuracy, we do not guarantee that the generated plans are perfectly accurate, safe, or optimal. You are responsible for verifying operating hours, travel times, and safety conditions before embarking on your trip.
        </p>

        <h3 style={{ color: "var(--text-main)", marginBottom: "16px", fontSize: "1.5rem" }}>4. Modifications to the Service</h3>
        <p>
          We reserve the right at any time and from time to time to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice. We shall not be liable to you or to any third party for any modification, price change, suspension or discontinuance of the Service.
        </p>
      </section>
    </div>
  );
}