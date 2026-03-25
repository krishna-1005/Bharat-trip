import React, { useRef } from "react";
import "../pages/imageHero.css";
// ✅ Using your existing asset
import img6 from "../assets/images/img6.png"; 

function ImageHero() {
  const cardRef = useRef();

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    const { left, top, width, height } = card.getBoundingClientRect();
    
    // Calculate cursor position relative to center
    const x = (e.clientX - left - width / 2) / 25;
    const y = (e.clientY - top - height / 2) / 25;

    // Apply 3D Tilt
    card.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;
    
    // Spotlight Effect
    const mouseX = ((e.clientX - left) / width) * 100;
    const mouseY = ((e.clientY - top) / height) * 100;
    card.style.setProperty("--mouse-x", `${mouseX}%`);
    card.style.setProperty("--mouse-y", `${mouseY}%`);
  };

  const handleMouseLeave = () => {
    cardRef.current.style.transform = `rotateY(0deg) rotateX(0deg)`;
  };

  return (
    <div className="image-hero-container" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <div className="image-card" ref={cardRef}>
        <img src={img6} alt="India Destination" className="hero-img" />
        <div className="image-overlay-glow"></div>
        <div className="image-details">
          <span>📍 Discover Bharat</span>
        </div>
      </div>
    </div>
  );
}

export default ImageHero;