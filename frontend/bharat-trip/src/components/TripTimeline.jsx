import React from 'react';
import { motion } from 'framer-motion';

const TripTimeline = ({ status, totalMembers, totalVotes }) => {
  const stages = [
    { id: 'polling', label: 'Polling', icon: '🗳️', desc: 'Gathering group votes' },
    { id: 'planning', label: 'Planning', icon: '📝', desc: 'Estimating costs & routes' },
    { id: 'finalized', label: 'Finalized', icon: '🎒', desc: 'Trip ready to roll!' },
  ];

  const currentIdx = stages.findIndex(s => s.id === status);
  const completionPercent = ((currentIdx + (status === 'polling' ? (totalVotes/totalMembers)*0.5 : 0.5)) / (stages.length)) * 100;

  return (
    <div className="trip-timeline-wrapper" style={{ margin: '40px 0', width: '100%' }}>
      <div className="timeline-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>Trip Progress</h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '1.2rem', fontWeight: '800' }}>
            {status === 'polling' ? `${totalVotes} / ${totalMembers} members voted` : 
             status === 'planning' ? 'Destination Decided!' : 'Trip is Finalized 🎉'}
          </p>
        </div>
        <span style={{ fontSize: '0.9rem', color: 'var(--dash-primary)', fontWeight: '700' }}>
          {Math.round(completionPercent)}% Complete
        </span>
      </div>

      <div className="timeline-track-container" style={{ position: 'relative', padding: '20px 0' }}>
        {/* Background Track */}
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '4px', background: 'rgba(255,255,255,0.05)', transform: 'translateY(-50%)', borderRadius: '10px' }} />
        
        {/* Active Progress */}
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(currentIdx / (stages.length - 1)) * 100}%` }}
          style={{ position: 'absolute', top: '50%', left: 0, height: '4px', background: 'var(--dash-primary)', transform: 'translateY(-50%)', borderRadius: '10px', boxShadow: '0 0 15px var(--dash-primary)' }}
        />

        {/* Nodes */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', zIndex: 2 }}>
          {stages.map((stage, idx) => {
            const isCompleted = idx < currentIdx;
            const isActive = idx === currentIdx;

            return (
              <div key={stage.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '80px' }}>
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor: isActive || isCompleted ? 'var(--dash-primary)' : 'rgba(255,255,255,0.1)',
                    scale: isActive ? 1.2 : 1,
                    boxShadow: isActive ? '0 0 20px var(--dash-primary)' : 'none'
                  }}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    border: '4px solid #080808'
                  }}
                >
                  {isCompleted ? '✓' : stage.icon}
                </motion.div>
                <span style={{ 
                  marginTop: '12px', 
                  fontSize: '0.75rem', 
                  fontWeight: isActive ? '800' : '500',
                  color: isActive ? 'white' : 'var(--text-dim)',
                  textAlign: 'center'
                }}>
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TripTimeline;
