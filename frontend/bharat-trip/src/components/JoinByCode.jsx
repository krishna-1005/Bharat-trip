import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoomByCode } from '../services/tripRoomService';
import { motion } from 'framer-motion';

const JoinByCode = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!code || code.length < 6) {
      setError('Please enter a valid 6-character code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const room = await getRoomByCode(code);
      if (room) {
        // Redirect to the vote page for this poll
        navigate(`/vote/${room.pollId}`);
      } else {
        setError('Invalid code. Please check and try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="join-code-container"
      style={{
        padding: '30px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        maxWidth: '400px',
        margin: '20px auto',
        textAlign: 'center'
      }}
    >
      <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Join Trip with Code 🔑</h3>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '20px' }}>
        Have a group code? Enter it below to join the planning session.
      </p>

      <form onSubmit={handleJoin}>
        <input
          type="text"
          placeholder="e.g. AB12CD"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          maxLength={6}
          style={{
            width: '100%',
            padding: '15px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white',
            fontSize: '1.2rem',
            textAlign: 'center',
            letterSpacing: '4px',
            fontWeight: '800',
            marginBottom: '15px',
            outline: 'none'
          }}
        />
        
        {error && (
          <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '15px' }}>{error}</p>
        )}

        <button
          type="submit"
          className="btn-premium primary"
          style={{ width: '100%', height: '50px' }}
          disabled={loading || code.length < 6}
        >
          {loading ? 'Searching...' : 'Join Trip Room'}
        </button>
      </form>
    </motion.div>
  );
};

export default JoinByCode;
