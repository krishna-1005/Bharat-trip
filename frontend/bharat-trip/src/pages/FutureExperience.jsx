import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ThreeScene from "../components/ThreeScene";
import "../styles/global.css";

const FutureExperience = () => {
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState("vision"); // vision, prediction, teleport
  const [glitchActive, setGlitchActive] = useState(false);

  // Futuristic Data Points
  const insights = [
    { title: "AI Traffic Prediction", value: "Low Crowd Expected", icon: "📊" },
    { title: "Smart Weather", value: "Optimal for Photos", icon: "🌤️" },
    { title: "Carbon Neutrality", value: "98% Offset", icon: "🌱" },
    { title: "AI Guide Match", value: "Expert (99% Match)", icon: "🤖" },
  ];

  const destinations = [
    { name: "Neo-Varanasi", desc: "Spiritual heritage meets sustainable smart-tech.", img: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80" },
    { name: "Digital-Goa", desc: "Eco-resorts with integrated neural-link experiences.", img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80" },
    { name: "Himalayan Hub", desc: "High-altitude retreats powered by 100% solar.", img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 200);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="future-experience-page" style={{ background: '#020617', minHeight: '100vh', color: '#fff', overflowX: 'hidden' }}>
      <Navbar />
      
      {/* Background Grid Effect */}
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <main className="container" style={{ position: 'relative', zIndex: 1, paddingTop: '120px' }}>
        
        {/* Header Section */}
        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="future-badge"
            style={{
              display: 'inline-block',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid #3b82f6',
              padding: '4px 16px',
              borderRadius: '100px',
              color: '#3b82f6',
              fontSize: '0.8rem',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              marginBottom: '16px'
            }}
          >
            GoTripo Vision 2030
          </motion.div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: '900', letterSpacing: '-2px', marginBottom: '20px' }}>
            The Future of <span style={{ color: '#3b82f6', fontStyle: 'italic' }}>Travel</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto' }}>
            Step into the next decade of exploration. AI-driven simulation, real-time climate prediction, and immersive digital twinning.
          </p>
        </header>

        {/* 3D Visualization Area */}
        <section style={{ height: '600px', width: '100%', borderRadius: '40px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: '#000', position: 'relative', marginBottom: '100px' }}>
          <ThreeScene mode={activeMode} images={destinations.map(d => d.img)} />
          
          {/* Overlay UI */}
          <div style={{ position: 'absolute', bottom: '40px', left: '40px', right: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', pointerEvents: 'none' }}>
            <div style={{ pointerEvents: 'auto' }}>
              <div style={{ display: 'flex', gap: '12px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', padding: '8px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                {["vision", "prediction", "teleport"].map(mode => (
                  <button
                    key={mode}
                    onClick={() => setActiveMode(mode)}
                    style={{
                      background: activeMode === mode ? '#3b82f6' : 'transparent',
                      color: activeMode === mode ? '#fff' : '#94a3b8',
                      border: 'none',
                      padding: '8px 20px',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      textTransform: 'capitalize',
                      cursor: 'pointer',
                      transition: '0.3s'
                    }}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ textAlign: 'right', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', padding: '20px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', width: '300px' }}>
              <h4 style={{ color: '#3b82f6', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '10px' }}>Live Digital Twin Feed</h4>
              <p style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '0' }}>
                Analyzing current architectural integrity and carbon flux for <strong>{destinations[0].name}</strong>.
              </p>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '100px' }}>
          {insights.map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10, borderColor: '#3b82f6' }}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '24px',
                padding: '32px',
                textAlign: 'center',
                cursor: 'default'
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>{stat.icon}</div>
              <h3 style={{ fontSize: '1rem', color: '#94a3b8', marginBottom: '8px' }}>{stat.title}</h3>
              <p style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <section style={{ textAlign: 'center', padding: '100px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 style={{ fontSize: '3rem', marginBottom: '32px' }}>Ready for the <br /> <span style={{ color: '#3b82f6' }}>Next Generation</span>?</h2>
          <button
            onClick={() => navigate('/planner')}
            style={{
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              padding: '20px 60px',
              borderRadius: '100px',
              fontSize: '1.1rem',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)'
            }}
          >
            Start Your Future Plan Now
          </button>
        </section>

      </main>

      <style>{`
        .future-experience-page {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }
        ${glitchActive ? 'h1 { animation: glitch 0.2s infinite; }' : ''}
      `}</style>
    </div>
  );
};

export default FutureExperience;
