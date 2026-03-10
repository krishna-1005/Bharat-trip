import { useState, useRef, useEffect } from "react";
import "../styles/travelBot.css";
const API = import.meta.env.VITE_API_URL;

export default function TravelBot({ isOpen, setIsOpen }) {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi! I'm BharatTrip AI.\nAsk me about trips around Bangalore — I'll plan your perfect itinerary. 🗺️"
    }
  ]);

  const [input, setInput] = useState("");
  const [internalOpen, setInternalOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const chatEndRef = useRef(null);

  const open    = isOpen    !== undefined ? isOpen    : internalOpen;
  const setOpen = setIsOpen !== undefined ? setIsOpen : setInternalOpen;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = async (customMessage) => {
    const messageToSend = customMessage || input;
    if (!messageToSend.trim()) return;

    setMessages(prev => [...prev, { sender: "user", text: messageToSend }]);
    setInput("");
    setTyping(true);

    try {
      const res = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageToSend })
      });

      const data = await res.json();
      let botText = "";
      const plan = data.plan;

      if (plan && plan.itinerary) {
        botText += `🗺️ Trip Plan — ${plan.days} days in ${plan.city}\n\n`;
        Object.keys(plan.itinerary).forEach(day => {
          botText += `📅 ${day}\n`;
          plan.itinerary[day].places.forEach(place => {
            botText += `  • ${place.name}\n`;
          });
          botText += `  💰 Cost: ₹${plan.itinerary[day].estimatedCost}\n\n`;
        });
        botText += `✨ Total Trip Cost: ₹${plan.totalTripCost}`;
      } else if (data.reply) {
        botText = data.reply;
      } else {
        botText = "Sorry, I couldn't generate a trip plan. Try again!";
      }

      setMessages(prev => [...prev, { sender: "bot", text: botText }]);
    } catch {
      setMessages(prev => [...prev, { sender: "bot", text: "⚠️ Server error. Please try again." }]);
    }

    setTyping(false);
  };

  const quickPrompts = [
    { label: "🌿 2 Day Nature", msg: "Plan a 2 day nature trip near Bangalore" },
    { label: "🏛️ Heritage",     msg: "Plan a heritage trip near Bangalore" },
    { label: "💸 Budget Trip",   msg: "Low budget trip near Bangalore" },
    { label: "🏔️ Weekend",      msg: "Suggest a weekend trip from Bangalore" },
  ];

  return (
    <>
      {/* ── FLOATING BUTTON ── */}
      <button className="cb-fab" onClick={() => setOpen(!open)} aria-label="Chat">
        <span className="cb-fab-icon">{open ? "✕" : "💬"}</span>
        {!open && <span className="cb-fab-ping"></span>}
      </button>

      {/* ── CHAT WINDOW ── */}
      {open && (
        <div className="cb-window">

          {/* Header */}
          <div className="cb-header">
            <div className="cb-header-left">
              <div className="cb-avatar-wrap">
                <span className="cb-avatar-emoji">🤖</span>
                <span className="cb-online-dot"></span>
              </div>
              <div className="cb-header-info">
                <span className="cb-header-name">BharatTrip AI</span>
                <span className="cb-header-status">Online · Replies instantly</span>
              </div>
            </div>
            <button className="cb-close-btn" onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* Quick prompts */}
          <div className="cb-quick-wrap">
            <p className="cb-quick-label">Quick suggestions</p>
            <div className="cb-quick-row">
              {quickPrompts.map((q, i) => (
                <button key={i} className="cb-quick-btn" onClick={() => sendMessage(q.msg)}>
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="cb-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`cb-msg-wrap ${msg.sender}`}>
                {msg.sender === "bot" && (
                  <div className="cb-msg-avatar">🤖</div>
                )}
                <div className={`cb-bubble ${msg.sender}`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {typing && (
              <div className="cb-msg-wrap bot">
                <div className="cb-msg-avatar">🤖</div>
                <div className="cb-bubble bot cb-typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="cb-input-bar">
            <input
              className="cb-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about trips, budget, places…"
              onKeyDown={e => { if (e.key === "Enter") sendMessage(); }}
            />
            <button
              className="cb-send-btn"
              onClick={() => sendMessage()}
              disabled={!input.trim()}
            >
              ➤
            </button>
          </div>

          <div className="cb-footer">Powered by BharatTrip AI · Always free</div>

        </div>
      )}
    </>
  );
}