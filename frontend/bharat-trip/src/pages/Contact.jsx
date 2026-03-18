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

  const contactDetails = [
    { icon: "📍", label: "Our Office", val: "Indiranagar, Bengaluru, KA 560038" },
    { icon: "✉️", label: "Support Email", val: "support@bharattrip.ai" },
    { icon: "📞", label: "Phone", val: "+91 80 4567 8900" },
  ];

  return (
    <div className="page about-page">
      
      <section className="about-hero" style={{ textAlign: "center", margin: "0 auto 40px" }}>
        <div className="premium-badge">GET IN TOUCH</div>
        <h1>Let's <span className="highlight-blue">Connect</span></h1>
        <p className="large-text">Have a special request or found a bug? We're here to listen.</p>
      </section>

      <section style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "40px", padding: "0 20px" }}>
        
        {/* ── LEFT: CONTACT INFO ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "10px" }}>Contact Information</h2>
          {contactDetails.map((item, i) => (
            <div key={i} className="premium-card" style={{ padding: "20px", display: "flex", gap: "16px", alignItems: "center" }}>
              <span style={{ fontSize: "24px" }}>{item.icon}</span>
              <div>
                <h4 style={{ margin: "0 0 4px", fontSize: "14px", color: "var(--text-dim)" }}>{item.label}</h4>
                <p style={{ margin: 0, fontWeight: "600", fontSize: "15px" }}>{item.val}</p>
              </div>
            </div>
          ))}

          <div style={{ marginTop: "20px" }}>
            <h4 style={{ marginBottom: "16px" }}>Follow Our Journey</h4>
            <div style={{ display: "flex", gap: "12px" }}>
              {["𝕏", "📸", "💼", "📘"].map((icon, i) => (
                <div key={i} className="btn-premium outline" style={{ cursor: "pointer", width: '44px', height: '44px', padding: 0 }}>{icon}</div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: FORM ── */}
        <div className="premium-card" style={{ padding: "40px" }}>
          {status === "success" && (
            <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid var(--accent-green)", color: "var(--accent-green)", padding: "16px", borderRadius: "12px", marginBottom: "24px", textAlign: "center", fontWeight: "600" }}>
              ✅ Message sent successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-dim)" }}>Name</label>
                <input type="text" placeholder="Full Name" required className="auth-input-styled" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-dim)" }}>Email</label>
                <input type="email" placeholder="Email" required className="auth-input-styled" />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-dim)" }}>Inquiry Type</label>
              <select className="auth-input-styled" style={{ appearance: "none" }}>
                <option>General Inquiry</option>
                <option>Bug Report</option>
                <option>Partnership</option>
                <option>Media</option>
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-dim)" }}>Message</label>
              <textarea placeholder="Tell us more..." rows="4" required className="auth-input-styled" style={{ resize: "vertical" }} />
            </div>

            <button type="submit" className="btn-premium primary" style={{ marginTop: "10px", width: "100%", justifyContent: "center", height: "54px" }}>
              Send Message
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}