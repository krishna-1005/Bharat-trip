import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { addUserWithPersonaToRoom } from "../services/tripRoomService";
import "./personaSelection.css";

export const PERSONAS = [
  { id: "foodie", title: "The Foodie", emoji: "🍜", desc: "Finding the best local spots and street food." },
  { id: "budget", title: "Budget Master", emoji: "💸", desc: "Keeping the trip affordable and value-packed." },
  { id: "trekker", title: "The Trekker", emoji: "🏔️", desc: "Always ready for the next peak and trail." },
  { id: "photographer", title: "Photographer", emoji: "📸", desc: "Capturing every golden hour and candid moment." },
  { id: "lazy", title: "The Lazy One", emoji: "😴", desc: "Prioritizing relaxation and slow mornings." },
  { id: "driver", title: "The Driver", emoji: "🚗", desc: "Taking the wheel and handling the road trip vibes." }
];

const PersonaSelection = ({ roomId, onComplete }) => {
  const { user, guestId } = useContext(AuthContext);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSelect = async (personaId) => {
    setSelected(personaId);
    setLoading(true);
    try {
      const activeUser = user || { id: guestId, name: "Guest" };
      await addUserWithPersonaToRoom(roomId, activeUser, personaId, !user);
      onComplete(personaId);
    } catch (err) {
      console.error("Failed to select persona:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="persona-selection-overlay">
      <div className="persona-selection-card">
        <h2>Choose Your <span className="gradient-text">Trip Persona</span></h2>
        <p className="subtitle">Every crew needs a balance. What's your vibe for this trip?</p>

        <div className="persona-grid">
          {PERSONAS.map((p) => (
            <div 
              key={p.id} 
              className={`persona-card ${selected === p.id ? 'active' : ''} ${loading && selected !== p.id ? 'disabled' : ''}`}
              onClick={() => !loading && handleSelect(p.id)}
            >
              <div className="persona-emoji">{p.emoji}</div>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
              {selected === p.id && <div className="selection-tick">✓</div>}
            </div>
          ))}
        </div>

        {loading && <div className="persona-loading">Setting your vibe...</div>}
      </div>
    </div>
  );
};

export default PersonaSelection;