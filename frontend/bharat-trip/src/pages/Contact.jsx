import React, { useState } from "react";
import Navbar from "../components/Navbar";
import "../styles/global.css";

export default function Contact() {
  const [status, setStatus] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("success");
    e.target.reset();
    setTimeout(() => setStatus(null), 5000);
  };

  return (
    <div className="page about-page">
      <Navbar />
      
      <section className="about-hero" style={{ textAlign: "center", margin: "0 auto 40px" }}>
        <div className="premium-badge">GET IN TOUCH</div>
        <h1>Contact <span className="highlight-blue">Us</span></h1>
        <p className="large-text">Have a question or feedback? We'd love to hear from you.</p>
      </section>

      <section style={{ maxWidth: "600px", margin: "0 auto", padding: "0 20px" }}>
        <div className="premium-card">
          {status === "success" && (
            <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid var(--accent-green)", color: "var(--accent-green)", padding: "16px", borderRadius: "12px", marginBottom: "24px", textAlign: "center", fontWeight: "600" }}>
              ✅ Message sent successfully! We'll get back to you soon.
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-dim)" }}>Name</label>
              <input 
                type="text" 
                placeholder="John Doe" 
                required 
                style={{
                  padding: "14px 16px", borderRadius: "12px", border: "1px solid var(--border-main)",
                  background: "var(--glass)", color: "var(--text-main)", outline: "none", fontSize: "15px"
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-dim)" }}>Email</label>
              <input 
                type="email" 
                placeholder="john@example.com" 
                required 
                style={{
                  padding: "14px 16px", borderRadius: "12px", border: "1px solid var(--border-main)",
                  background: "var(--glass)", color: "var(--text-main)", outline: "none", fontSize: "15px"
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-dim)" }}>Message</label>
              <textarea 
                placeholder="How can we help?" 
                rows="5" 
                required 
                style={{
                  padding: "14px 16px", borderRadius: "12px", border: "1px solid var(--border-main)",
                  background: "var(--glass)", color: "var(--text-main)", outline: "none", fontSize: "15px",
                  resize: "vertical"
                }}
              />
            </div>

            <button type="submit" className="pro-btn-primary" style={{ marginTop: "10px", width: "100%", justifyContent: "center", padding: "16px" }}>
              Send Message
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}