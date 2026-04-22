import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import "../styles/global.css";

export default function Help() {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "planner", label: "AI Planner", icon: "🤖" },
    { id: "account", label: "Account", icon: "👤" },
    { id: "safety", label: "Safety", icon: "🛡️" },
    { id: "billing", label: "Billing", icon: "💳" },
  ];

  const faqs = [
    { cat: "planner", q: "How accurate are the AI itineraries?", a: "Our AI uses real-time data from OpenStreetMap and Google. While highly accurate, we always recommend checking local conditions and official attraction websites for the most up-to-date hours." },
    { cat: "planner", q: "Can I generate plans for cities outside Bangalore?", a: "Yes! GoTripo supports planning across major Indian cities including Goa, Jaipur, Mumbai, and Delhi, with more regions being added weekly." },
    { cat: "account", q: "Is my data secure?", a: "We use Firebase's industry-standard authentication. Your personal data and saved trips are encrypted and never shared without your explicit permission." },
    { cat: "billing", q: "Are there any hidden costs?", a: "No. GoTripo is a free tool for travelers. We may show affiliate links for hotels or transport, but using our AI planner costs you nothing." },
    { cat: "safety", q: "What should I do in case of a travel emergency?", a: "While we provide travel info, we are not a 24/7 emergency service. Please keep local emergency numbers (112) handy and consult your embassy if traveling internationally." }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.cat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page about-page">
      
      <section className="about-hero" style={{ textAlign: "center", margin: "0 auto 60px" }}>
        <div className="premium-badge">SUPPORT CENTER</div>
        <h1>How can we <span className="highlight-blue">help you?</span></h1>
        <div style={{ marginTop: "30px", maxWidth: "600px", margin: "30px auto 0" }}>
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Search for answers (e.g., 'security', 'itinerary')..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%", padding: "18px 24px 18px 50px", borderRadius: "20px",
                border: "1px solid var(--border-main)", background: "var(--bg-panel)",
                color: "var(--text-main)", fontSize: "16px", outline: "none",
                boxShadow: "0 10px 30px var(--shadow-main)"
              }}
            />
            <span style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px' }}>🔍</span>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section style={{ maxWidth: "1000px", margin: "0 auto 80px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
        {categories.map(c => (
          <div key={c.id} className="premium-card" style={{ textAlign: "center", cursor: "pointer", padding: "30px" }} onClick={() => setSearchQuery(c.id)}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>{c.icon}</div>
            <h3 style={{ fontSize: "16px", margin: 0 }}>{c.label}</h3>
          </div>
        ))}
      </section>

      {/* ── FAQS ── */}
      <section className="about-section faq-section" style={{ margin: "0 auto", maxWidth: "800px" }}>
        <h2 className="section-title">Common Questions</h2>
        <div className="faq-list">
          {filteredFaqs.length > 0 ? filteredFaqs.map((faq, i) => (
            <div 
              key={i} 
              className={`faq-item ${activeFaq === i ? 'active' : ''}`}
              onClick={() => setActiveFaq(activeFaq === i ? null : i)}
            >
              <div className="faq-question">
                <span>{faq.q}</span>
                <span className="faq-icon">{activeFaq === i ? "âˆ’" : "+"}</span>
              </div>
              {activeFaq === i && (
                <div className="faq-answer">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          )) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: "var(--text-dim)" }}>No results found. Try a different keyword.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── CONTACT METHODS ── */}
      <section className="about-cta" style={{ margin: "100px auto", maxWidth: "900px" }}>
        <h2>Still have questions?</h2>
        <p>If you can't find what you're looking for, our team is here to support you.</p>
        <div className="cta-buttons" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "30px", marginTop: "40px" }}>
          <div style={{ textAlign: 'center', minWidth: '200px' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>✉️</div>
            <h4 style={{ margin: '0 0 5px' }}>Email Us</h4>
            <p style={{ fontSize: '14px', color: 'var(--text-dim)' }}>support@gotripo.tech</p>
          </div>
          <div style={{ textAlign: 'center', minWidth: '200px' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>💬</div>
            <h4 style={{ margin: '0 0 5px' }}>Live Chat</h4>
            <p style={{ fontSize: '14px', color: 'var(--text-dim)' }}>Available 9AM - 6PM IST</p>
          </div>
          <div style={{ textAlign: 'center', minWidth: '200px' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>📲</div>
            <h4 style={{ margin: '0 0 5px' }}>Social Media</h4>
            <p style={{ fontSize: '14px', color: 'var(--text-dim)' }}>@GoTripo_ai</p>
          </div>
        </div>
        <button 
          className="btn-premium primary" 
          style={{ marginTop: '50px', width: '240px', justifyContent: 'center' }}
          onClick={() => navigate("/contact")}
        >
          Send a Message
        </button>
      </section>
    </div>
  );
}