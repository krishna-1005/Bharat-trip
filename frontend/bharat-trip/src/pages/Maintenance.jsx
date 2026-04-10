import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/global.css';

const Maintenance = () => {
  const navigate = useNavigate();

  return (
    <div className="page" style={{ 
      justifyContent: 'center', 
      alignItems: 'center', 
      textAlign: 'center',
      background: 'radial-gradient(circle at center, #0a0a0a 0%, #020202 100%)'
    }}>
      <div className="premium-card" style={{ maxWidth: '600px', padding: '60px 40px' }}>
        <div style={{ 
          fontSize: '80px', 
          marginBottom: '20px',
          animation: 'pulse 2s infinite ease-in-out'
        }}>
          🛠️
        </div>
        
        <h1 className="section-title" style={{ marginBottom: '16px' }}>
          Under Maintenance
        </h1>
        
        <p className="large-text" style={{ marginBottom: '40px' }}>
          We're currently performing some scheduled updates to improve your experience. 
          GoTripo will be back online shortly. Thank you for your patience!
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button 
            className="btn-premium primary" 
            onClick={() => window.location.reload()}
          >
            Check Again
          </button>
          <button 
            className="btn-premium outline" 
            onClick={() => navigate('/contact')}
          >
            Contact Support
          </button>
        </div>

        <div style={{ marginTop: '40px', color: 'var(--text-dim)', fontSize: '14px' }}>
          Estimated downtime: ~15 minutes
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}} />
    </div>
  );
};

export default Maintenance;
