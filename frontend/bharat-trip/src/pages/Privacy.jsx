import React from "react";
import Navbar from "../components/Navbar";
import "../styles/global.css";

export default function Privacy() {
  return (
    <div className="page about-page">
      <Navbar />
      
      <section className="about-hero" style={{ textAlign: "center", margin: "0 auto 40px" }}>
        <div className="premium-badge">LEGAL</div>
        <h1>Privacy <span className="highlight-blue">Policy</span></h1>
        <p className="large-text">Your privacy is critically important to us.</p>
      </section>

      <section className="premium-card" style={{ maxWidth: "800px", margin: "0 auto", padding: "40px", lineHeight: "1.8", color: "var(--text-dim)" }}>
        <h3 style={{ color: "var(--text-main)", marginBottom: "16px", fontSize: "1.5rem" }}>1. Information We Collect</h3>
        <p style={{ marginBottom: "24px" }}>
          We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, and other information you choose to provide.
        </p>

        <h3 style={{ color: "var(--text-main)", marginBottom: "16px", fontSize: "1.5rem" }}>2. How We Use Information</h3>
        <p style={{ marginBottom: "24px" }}>
          We use the information we collect to provide, maintain, and improve our services. This includes using the information to:
        </p>
        <ul style={{ marginBottom: "24px", paddingLeft: "20px" }}>
          <li>Create and update your account.</li>
          <li>Process and facilitate your travel plans.</li>
          <li>Send you communications, including updates, security alerts, and support messages.</li>
          <li>Personalize and improve the Services.</li>
        </ul>

        <h3 style={{ color: "var(--text-main)", marginBottom: "16px", fontSize: "1.5rem" }}>3. Sharing of Information</h3>
        <p style={{ marginBottom: "24px" }}>
          We do not sell or share your personal information with third parties for their direct marketing purposes without your consent. We may share information with vendors, consultants, and other service providers who need access to such information to carry out work on our behalf.
        </p>

        <h3 style={{ color: "var(--text-main)", marginBottom: "16px", fontSize: "1.5rem" }}>4. Security</h3>
        <p>
          We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction. However, no internet or email transmission is ever fully secure or error free.
        </p>
      </section>
    </div>
  );
}