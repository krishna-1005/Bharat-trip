import React, { useState } from "react";
import "./home.css";

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

  const cityImages = [
    "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1581791534721-e599df4417f7?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1584126307041-659f77626966?auto=format&fit=crop&w=800&q=80"
  ];

  return (
    <div className="home-redesign">
      
      {/* ── HERO SECTION ── */}
      <section className="about-hero-section">
        <div className="container about-hero-grid">
          <div className="hero-content">
            <span className="section-label">Get in Touch</span>
            <h1>Let's Connect</h1>
            <p>Have a special request or found a bug? We're here to listen.</p>
          </div>
          <div className="hero-preview">
            <div className="hero-image-grid">
              {cityImages.map((img, i) => (
                <div key={i} className="hero-img-card">
                  <img src={img} alt="City" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '60px 0' }}>
        <div className="container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "60px" }}>
          
          {/* ── LEFT: CONTACT INFO ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            <h2 style={{ fontSize: "2rem", marginBottom: "0" }}>Contact Information</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {contactDetails.map((item, i) => (
                <div key={i} className="feature-card" style={{ padding: "24px", display: "flex", gap: "20px", alignItems: "center" }}>
                  <span style={{ fontSize: "2rem" }}>{item.icon}</span>
                  <div>
                    <h4 style={{ margin: "0 0 4px", fontSize: "0.8rem", color: "var(--accent-blue)", textTransform: 'uppercase', letterSpacing: '1px' }}>{item.label}</h4>
                    <p style={{ margin: 0, fontWeight: "600", fontSize: "1.1rem" }}>{item.val}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "20px" }}>
              <h4 className="section-label" style={{ marginBottom: "16px" }}>Follow Our Journey</h4>
              <div style={{ display: "flex", gap: "16px" }}>
                {["𝕏", "📸", "💼", "📘"].map((icon, i) => (
                  <div key={i} className="btn-secondary" style={{ width: '54px', height: '54px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, fontSize: '1.2rem' }}>{icon}</div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: FORM ── */}
          <div className="feature-card" style={{ padding: "48px" }}>
            <h2 style={{ fontSize: "2rem", marginBottom: "32px" }}>Send a Message</h2>
            {status === "success" && (
              <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid #10b981", color: "#10b981", padding: "16px", borderRadius: "12px", marginBottom: "24px", textAlign: "center", fontWeight: "600" }}>
                ✅ Message sent successfully!
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "var(--text-dim)" }}>Name</label>
                  <input type="text" placeholder="Full Name" required className="btn-secondary" style={{ textAlign: 'left', width: '100%', cursor: 'text' }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "var(--text-dim)" }}>Email</label>
                  <input type="email" placeholder="Email" required className="btn-secondary" style={{ textAlign: 'left', width: '100%', cursor: 'text' }} />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "var(--text-dim)" }}>Inquiry Type</label>
                <select className="btn-secondary" style={{ appearance: "none", textAlign: 'left', width: '100%', cursor: 'pointer' }}>
                  <option>General Inquiry</option>
                  <option>Bug Report</option>
                  <option>Partnership</option>
                  <option>Media</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "var(--text-dim)" }}>Message</label>
                <textarea placeholder="Tell us more..." rows="4" required className="btn-secondary" style={{ resize: "vertical", textAlign: 'left', width: '100%', cursor: 'text', height: 'auto' }} />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: "12px", width: "100%", justifyContent: "center", padding: '18px' }}>
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

    </div>
  );
}
