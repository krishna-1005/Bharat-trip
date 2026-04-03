import React from 'react';
import { motion } from 'framer-motion';
import { updateMemberConfirmation, addActivity } from '../services/tripRoomService';
import '../styles/tripConfirmation.css';

const TripConfirmation = ({ roomId, user, roomData }) => {
  if (!roomData || !user) return null;

  const confirmations = roomData.confirmations || {};
  const myStatus = confirmations[user.uid] || 'pending';
  const membersInfo = roomData.membersInfo || [];

  const handleConfirm = async (status) => {
    try {
      await updateMemberConfirmation(roomId, user.uid, status);
      const message = status === 'yes' 
        ? `${user.name || 'A traveler'} confirmed they are joining! ✅`
        : `${user.name || 'A traveler'} declined the trip. ❌`;
      await addActivity(roomId, 'confirmation', message, user);
    } catch (err) {
      console.error("Failed to update confirmation:", err);
    }
  };

  const confirmedCount = Object.values(confirmations).filter(s => s === 'yes').length;
  const totalMembers = membersInfo.length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="confirmation-card"
    >
      <div className="confirmation-header">
        <h3>Trip Confirmation</h3>
        <span className="confirmation-summary">
          {confirmedCount} / {totalMembers} confirmed
        </span>
      </div>

      <div className="my-confirmation-status">
        <p>Are you joining this trip?</p>
        <div className="confirmation-actions">
          <button 
            className={`conf-btn yes ${myStatus === 'yes' ? 'active' : ''}`}
            onClick={() => handleConfirm('yes')}
          >
            Yes, I'm in! {myStatus === 'yes' && '✓'}
          </button>
          <button 
            className={`conf-btn no ${myStatus === 'no' ? 'active' : ''}`}
            onClick={() => handleConfirm('no')}
          >
            No {myStatus === 'no' && '✓'}
          </button>
        </div>
      </div>

      <div className="members-status-list">
        {membersInfo.map((member) => {
          const status = confirmations[member.uid] || 'pending';
          return (
            <div key={member.uid} className={`member-status-item ${status}`}>
              <div className="member-avatar">
                {member.name?.charAt(0) || 'T'}
              </div>
              <div className="member-info">
                <span className="member-name">{member.name}</span>
                <span className={`status-badge ${status}`}>
                  {status === 'yes' ? 'Confirmed' : status === 'no' ? 'Declined' : 'Pending'}
                </span>
              </div>
              {status === 'yes' && <span className="confirmed-tick">✓</span>}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default TripConfirmation;
