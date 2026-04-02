import React, { useState, useEffect } from 'react';
import { listenToActivities } from '../services/tripRoomService';
import { motion, AnimatePresence } from 'framer-motion';

const ActivityFeed = ({ roomId }) => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if (!roomId) return;

    // Start real-time listener
    const unsubscribe = listenToActivities(roomId, (data) => {
      setActivities(data);
    });

    // Cleanup on unmount
    return () => unsubscribe();
  }, [roomId]);

  if (!roomId) return null;

  return (
    <div className="activity-feed-container" style={{ marginTop: '30px' }}>
      <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: 'var(--text-dim)' }}>
        Live Activity ⚡
      </h3>
      
      <div className="activity-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <AnimatePresence initial={false}>
          {activities.length === 0 ? (
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Waiting for activity...</p>
          ) : (
            activities.slice(0, 5).map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  fontSize: '0.9rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{activity.message}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {activity.timestamp?.toDate ? new Date(activity.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'just now'}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ActivityFeed;
