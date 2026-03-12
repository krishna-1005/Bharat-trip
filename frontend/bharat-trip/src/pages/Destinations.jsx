import React from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import "../styles/global.css";

// Assuming we can use sample images from assets
import img2 from "../assets/images/img2.webp";
import img3 from "../assets/images/img3.webp";
import img4 from "../assets/images/img4.webp";
import img6 from "../assets/images/img6.png";

export default function Destinations() {
  const navigate = useNavigate();

  const destinations = [
    { id: 1, name: "Bengaluru", tag: "Tech & Parks", img: img6, desc: "The Silicon Valley of India with lush parks, palaces, and vibrant nightlife." },
    { id: 2, name: "Goa", tag: "Coastal", img: img2, desc: "Pristine beaches, stunning sunsets, and unforgettable coastal vibes." },
    { id: 3, name: "Varanasi", tag: "Spiritual", img: img3, desc: "The eternal soul of ancient India with majestic ghats along the Ganges." },
    { id: 4, name: "Manali", tag: "Adventure", img: img4, desc: "Snow-capped mountains, serene valleys, and thrilling adventure experiences." },
  ];

  return (
    <div className="page about-page">
      <Navbar />
      
      <section className="about-hero" style={{ textAlign: "center", margin: "0 auto 60px" }}>
        <div className="premium-badge">EXPLORE</div>
        <h1>Popular <span className="highlight-blue">Destinations</span></h1>
        <p className="large-text">Discover the most loved travel spots across India, curated by experts.</p>
      </section>

      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
          {destinations.map((dest) => (
            <div key={dest.id} className="premium-card" style={{ padding: "0", overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column" }} onClick={() => navigate("/planner")}>
              <div style={{ height: "200px", overflow: "hidden", position: "relative" }}>
                <img src={dest.img} alt={dest.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} />
                <span style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", color: "white", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: "700", textTransform: "uppercase" }}>
                  {dest.tag}
                </span>
              </div>
              <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column" }}>
                <h3 style={{ margin: "0 0 12px", fontSize: "1.25rem", color: "var(--text-main)", fontWeight: "800" }}>{dest.name}</h3>
                <p style={{ margin: "0 0 20px", color: "var(--text-dim)", fontSize: "0.95rem", lineHeight: "1.6", flex: 1 }}>{dest.desc}</p>
                <button className="pro-btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={(e) => { e.stopPropagation(); navigate("/planner"); }}>
                  Plan Trip
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}