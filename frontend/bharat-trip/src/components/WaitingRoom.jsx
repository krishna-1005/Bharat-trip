import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { listenToRoom } from "../services/tripRoomService";
import { PERSONAS } from "./PersonaSelection";
import "./waitingRoom.css";

const WaitingRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user, guestId } = useContext(AuthContext);
  const [room, setRoom] = useState(null);
  const [copied, setShareCopied] = useState(false);

  useEffect(() => {
    if (!roomId) return;
    const unsubscribe = listenToRoom(roomId, (data) => {
      setRoom(data);
    });
    return () => unsubscribe();
  }, [roomId]);

  if (!room) return <div className="wr-loading">Entering Waiting Room...</div>;

  const members = room.membersInfo || [];
  const activeUserPersona = members.find(m => m.uid === (user?.id || guestId))?.persona;

  const personaStatus = PERSONAS.map(p => {
    const occupant = members.find(m => m.persona === p.id);
    return { ...p, occupant };
  });

  const missingPersonas = personaStatus.filter(p => !p.occupant);

  const handleShare = () => {
    const url = `${window.location.origin}/vote/${room.pollId}`;
    navigator.clipboard.writeText(url);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 3000);
  };

  return (
    <div className="waiting-room-container">
      <header className="wr-header">
        <div className="wr-badge">Trip ID: {room.joinCode}</div>
        <h1>{room.name} <span className="wr-status-tag">{room.status}</span></h1>
        <p className="wr-subtitle">Waiting for the crew to gear up...</p>
      </header>

      <div className="wr-layout">
        {/* LEFT: Current Crew */}
        <div className="wr-crew-section">
          <h2>Joined Crew ({members.length})</h2>
          <div className="members-list">
            {members.map((m, i) => (
              <div key={i} className="member-item">
                <div className="member-avatar">
                  {PERSONAS.find(p => p.id === m.persona)?.emoji || "👤"}
                </div>
                <div className="member-info">
                  <span className="member-name">{m.name} {m.uid === (user?.id || guestId) && "(You)"}</span>
                  <span className="member-persona">{PERSONAS.find(p => p.id === m.persona)?.title || "Explorer"}</span>
                </div>
              </div>
            ))}
          </div>
          
          <button className="wr-share-btn" onClick={handleShare}>
            {copied ? "✓ Link Copied!" : "Invite Friends to Complete the Crew"}
          </button>
        </div>

        {/* RIGHT: Persona Status */}
        <div className="wr-status-section">
          <h2>Crew Balance</h2>
          <div className="wr-status-grid">
            {personaStatus.map(p => (
              <div key={p.id} className={`status-card ${p.occupant ? 'filled' : 'missing'}`}>
                <span className="status-emoji">{p.emoji}</span>
                <span className="status-title">{p.title}</span>
                <span className={`status-badge ${p.occupant ? 'filled' : 'missing'}`}>
                  {p.occupant ? `✅ ${p.occupant.name}` : "❌ Missing"}
                </span>
              </div>
            ))}
          </div>

          {missingPersonas.length > 0 && (
            <div className="missing-vibes">
              <h3>⚠️ Missing Vibes</h3>
              <div className="vibes-list">
                {missingPersonas.slice(0, 2).map(p => (
                  <div key={p.id} className="vibe-alert">
                    No <strong>{p.title}</strong> yet {p.emoji} — Who's {p.desc.toLowerCase().replace('.', '')}?
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="wr-actions">
        <button className="wr-proceed-btn" onClick={() => navigate(`/vote/${room.pollId}`)}>
          Go to Poll Dashboard →
        </button>
      </div>
    </div>
  );
};

export default WaitingRoom;