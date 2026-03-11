import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/travelBot.css";
const API = import.meta.env.VITE_API_URL;

export default function TravelBot({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi! I'm BharatTrip AI. 🤖\nI can plan your perfect Bangalore itinerary in seconds. What's on your mind?"
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

  const handleViewOnMap = (plan) => {
    if (!plan) return;
    localStorage.setItem("tripPlan", JSON.stringify(plan));
    sessionStorage.setItem("tripPlan", JSON.stringify(plan));
    navigate("/results", { state: { plan } });
    setOpen(false);
  };

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setInput("");
    setTyping(true);

    try {
      const res = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg })
      });

      const data = await res.json();
      const plan = data.plan;

      if (plan?.itinerary) {
        let botText = `🗺️ I've crafted a ${plan.days}-day plan for you!\n\n`;
        Object.keys(plan.itinerary).forEach(day => {
          botText += `📍 ${day}: ${plan.itinerary[day].places.length} spots\n`;
        });
        setMessages(prev => [...prev, { sender: "bot", text: botText, plan }]);
      } else {
        setMessages(prev => [...prev, { sender: "bot", text: data.reply || "I'm here to help with your Bangalore travels!" }]);
      }
    } catch {
      setMessages(prev => [...prev, { sender: "bot", text: "⚠️ Connection issue. Please try again." }]);
    }
    setTyping(false);
  };

  return (
    <>
      {/* ── FLOATING BUTTON ── */}
      {!open && (
        <div className="cb-fab" onClick={() => setOpen(true)}>
          <span className="cb-fab-icon">💬</span>
        </div>
      )}

      {/* ── CHAT WINDOW ── */}
      {open && (
        <div className="cb-window">
          <div className="cb-header">
            <div className="cb-header-info">
              <h3>BharatTrip AI</h3>
              <div className="cb-status">
                <span className="pulse-dot"></span>
                Online & Ready
              </div>
            </div>
            <button className="cb-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="cb-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`cb-bubble ${msg.sender}`}>
                {msg.text}
                {msg.plan && (
                  <button className="cb-map-redirect-btn" onClick={() => handleViewOnMap(msg.plan)}>
                    🗺️ View Full Plan on Map →
                  </button>
                )}
              </div>
            ))}
            {typing && <div className="cb-bubble bot">AI is thinking...</div>}
            <div ref={chatEndRef} />
          </div>

          <form className="cb-input-area" onSubmit={sendMessage}>
            <input
              className="cb-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
            />
            <button className="cb-send" type="submit">➤</button>
          </form>
        </div>
      )}
    </>
  );
}