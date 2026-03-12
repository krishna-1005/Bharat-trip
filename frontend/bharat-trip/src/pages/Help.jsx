import React, { useState } from "react";
import Navbar from "../components/Navbar";
import "../styles/global.css";

export default function Help() {
  const [activeFaq, setActiveFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    { q: "How do I create a trip plan?", a: "Go to the 'Planner' page from the navigation menu, select your destination, dates, budget, and interests, then click 'Generate Plan'. Our AI will create a personalized itinerary for you instantly." },
    { q: "Can I modify my itinerary?", a: "Currently, our itineraries are generated based on your inputs. If you want a different plan, you can easily tweak your preferences and generate a new one. Manual editing features are coming soon!" },
    { q: "How does pricing work?", a: "Bharat Trip is currently free to use! You can generate unlimited itineraries and explore various destinations without any cost." },
    { q: "How to contact support?", a: "You can reach out to us via the 'Contact Us' page in the footer. Fill out the form, and our support team will get back to you within 24 hours." },
    { q: "Can I share my trip with friends?", a: "Yes! Once you generate a trip or view it in 'My Trips', click the 'Share' button to copy a link that you can send to anyone." }
  ];

  const filteredFaqs = faqs.filter(faq => faq.q.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="page about-page">
      <Navbar />
      
      <section className="about-hero" style={{ textAlign: "center", margin: "0 auto 60px" }}>
        <div className="premium-badge">SUPPORT</div>
        <h1>How can we <span className="highlight-blue">help you?</span></h1>
        <div style={{ marginTop: "30px", maxWidth: "500px", margin: "30px auto 0" }}>
          <input 
            type="text" 
            placeholder="Search for answers..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%", padding: "16px 20px", borderRadius: "16px",
              border: "1px solid var(--border-main)", background: "var(--glass)",
              color: "var(--text-main)", fontSize: "16px", outline: "none"
            }}
          />
        </div>
      </section>

      <section className="about-section faq-section" style={{ margin: "0 auto", maxWidth: "800px" }}>
        <div className="faq-list">
          {filteredFaqs.length > 0 ? filteredFaqs.map((faq, i) => (
            <div 
              key={i} 
              className={`faq-item ${activeFaq === i ? 'active' : ''}`}
              onClick={() => setActiveFaq(activeFaq === i ? null : i)}
            >
              <div className="faq-question">
                <span>{faq.q}</span>
                <span className="faq-icon">{activeFaq === i ? "−" : "+"}</span>
              </div>
              {activeFaq === i && (
                <div className="faq-answer">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          )) : (
            <p style={{ textAlign: "center", color: "var(--text-dim)" }}>No results found for your search.</p>
          )}
        </div>
      </section>

      <section className="about-cta" style={{ margin: "80px auto", maxWidth: "800px" }}>
        <h2>Still need help?</h2>
        <p>Our support team is always ready to assist you.</p>
        <div className="cta-buttons">
          <a href="/contact" className="pro-btn-primary" style={{ textDecoration: "none" }}>Contact Support</a>
        </div>
      </section>
    </div>
  );
}