import React, { useState, useEffect, useRef } from 'react';
import { sendMessage, listenToMessages, listenToActivities } from '../services/tripRoomService';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/tripChat.css';

const TripChat = ({ roomId, user }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [combinedFeed, setCombinedFeed] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!roomId) return;

    // Listen to chat messages
    const unsubscribeMessages = listenToMessages(roomId, (chatMsgs) => {
      setMessages(chatMsgs);
    });

    // Listen to activities (system messages)
    const unsubscribeActivities = listenToActivities(roomId, (activities) => {
      // We only take the last 20 activities to avoid clutter
      const systemMsgs = activities.map(act => ({
        ...act,
        isSystem: true,
        text: act.message,
        timestamp: act.timestamp
      }));
      
      setCombinedFeed(prev => {
          // This is a simple merge, real-time sync with two collections can be tricky
          // but for a "Focused Discussion" it works well enough.
          return systemMsgs;
      });
    });

    return () => {
      unsubscribeMessages();
      unsubscribeActivities();
    };
  }, [roomId]);

  // Merge and Sort
  const feed = [...messages.map(m => ({...m, isSystem: false})), ...combinedFeed]
    .sort((a, b) => {
        const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : Date.now();
        const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : Date.now();
        return timeA - timeB;
    })
    .slice(-50); // Keep only last 50 total items

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [feed]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const text = inputText;
    setInputText("");
    await sendMessage(roomId, user, text);
  };

  return (
    <div className="trip-chat-container">
      <div className="chat-header">
        <div className="chat-header-info">
          <h3>Discussion</h3>
          <span className="chat-subtitle">Plan your journey together</span>
        </div>
        <div className="chat-online-indicator">
          <span className="pulse-dot"></span> Live
        </div>
      </div>

      <div className="chat-messages" ref={scrollRef}>
        <AnimatePresence initial={false}>
          {feed.length === 0 ? (
            <div className="empty-chat">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            feed.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`message-wrapper ${msg.isSystem ? 'system' : msg.userId === user?.uid ? 'mine' : 'theirs'}`}
              >
                {!msg.isSystem && msg.userId !== user?.uid && (
                  <span className="message-author">{msg.userName}</span>
                )}
                <div className="message-bubble">
                  {msg.text}
                </div>
                {msg.timestamp && (
                   <span className="message-time">
                     {new Date(msg.timestamp?.toDate ? msg.timestamp.toDate() : Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </span>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <form className="chat-input-area" onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Type a message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button type="submit" disabled={!inputText.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

export default TripChat;
