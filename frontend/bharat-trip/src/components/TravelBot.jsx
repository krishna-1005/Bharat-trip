import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import "../styles/travelBot.css";
const API = import.meta.env.VITE_API_URL;

export default function TravelBot({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi! I'm your personal Bengaluru travel assistant. 😊\n\nI specialize in creating **personalized itineraries** based on your interests and budget. Whether you're looking for hidden gems, local food, or off-the-beaten-path spots, I'm here to help!\n\nHow can I make your Bengaluru trip unforgettable today?"
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

  const handleLocateOnMap = (loc) => {
    if (!loc) return;
    const singlePlacePlan = {
      city: "Bengaluru",
      days: 1,
      itinerary: {
        "Day 1": {
          places: [{
            name: loc.name,
            lat: loc.lat,
            lng: loc.lng,
            category: "Sightseeing",
            timeHours: 2,
            estimatedCost: 0
          }],
          estimatedCost: 0,
          estimatedHours: 2,
          color: "#3b82f6"
        }
      }
    };
    navigate("/results", { state: { plan: singlePlacePlan } });
    setOpen(false);
  };

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    const updatedMessages = [...messages, { sender: "user", text: userMsg }];
    setMessages(updatedMessages);
    setInput("");
    setTyping(true);

    try {
      const res = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMsg,
          history: messages 
        })
      });

      const data = await res.json();
      const plan = data.plan;
      const botLocation = data.location;
      const botReply = data.reply || data.message;

      if (plan?.itinerary) {
        let botText = botReply ? `${botReply}\n\n` : "";
        botText += `🗺️ I've crafted a ${plan.days}-day plan for you!\n\n`;
        
        Object.keys(plan.itinerary).forEach(day => {
          const dayData = plan.itinerary[day];
          const placeNames = dayData.places.map(p => p.name).join(", ");
          botText += `📍 ${day}: ${placeNames}\n`;
        });

        setMessages(prev => [...prev, { sender: "bot", text: botText, plan }]);
      } else if (botLocation) {
        setMessages(prev => [...prev, { sender: "bot", text: botReply, location: botLocation }]);
      } else {
        setMessages(prev => [...prev, { sender: "bot", text: botReply || "I'm here to help with your Bangalore travels!" }]);
      }
    } catch (err) {
      console.error("Chat Error:", err);
      setMessages(prev => [...prev, { sender: "bot", text: "⚠️ Connection issue. Please try again." }]);
    }
    setTyping(false);
  };

  return (
    <>
      {/* ── FLOATING BUTTON ── */}
      <div className={`cb-fab ${open ? 'active' : ''}`} onClick={() => setOpen(!open)}>
        <span className="cb-fab-icon">{open ? '✕' : '🤖'}</span>
      </div>

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
                <ReactMarkdown>{msg.text}</ReactMarkdown>
                {msg.plan && (
                  <button className="cb-map-redirect-btn" onClick={() => handleViewOnMap(msg.plan)}>
                    🗺️ View Full Plan on Map →
                  </button>
                )}
                {msg.location && (
                  <button className="cb-map-redirect-btn" onClick={() => handleLocateOnMap(msg.location)}>
                    📍 Locate {msg.location.name} on Map →
                  </button>
                )}
              </div>
            ))}
            {typing && (
              <div className="cb-typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form className="cb-input-area" onSubmit={sendMessage}>
            <input
              className="cb-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
            />
            <button className="cb-send" type="submit" disabled={!input.trim()}>➤</button>
          </form>
        </div>
      )}
    </>
  );
}
