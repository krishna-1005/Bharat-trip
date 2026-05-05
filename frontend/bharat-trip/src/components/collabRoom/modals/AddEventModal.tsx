import React, { useState } from 'react';
import axios from 'axios';
import { X, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

const COLORS = {
  cardBg: '#161b22',
  border: '#30363d',
  accent: '#1d9e75',
  textPrimary: '#e6edf3',
  textMuted: '#8b949e',
};

const AddEventModal = ({ trip, polls, onClose, onSuccess }: any) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    name: '',
    description: '',
    ownerId: trip.members[0]?.userId || '',
    status: 'pending',
    linkedPollId: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.time || !formData.name || !user) return;

    setLoading(true);
    try {
      const token = await user.getIdToken();
      await axios.post(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/api/trips/${trip._id}/itinerary/event`, 
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSuccess();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const openPolls = polls?.filter((p: any) => p.status === 'open') || [];

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: '12px', width: '400px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold' }}>Add Event</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: COLORS.textMuted, cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: COLORS.textMuted, marginBottom: '4px' }}>Date</label>
            <input 
              type="date" 
              required
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              style={{ width: '100%', backgroundColor: '#0d1117', border: `1px solid ${COLORS.border}`, color: 'white', padding: '8px', borderRadius: '6px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: COLORS.textMuted, marginBottom: '4px' }}>Time</label>
            <input 
              type="time" 
              required
              value={formData.time}
              onChange={(e) => setFormData({...formData, time: e.target.value})}
              style={{ width: '100%', backgroundColor: '#0d1117', border: `1px solid ${COLORS.border}`, color: 'white', padding: '8px', borderRadius: '6px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: COLORS.textMuted, marginBottom: '4px' }}>Event Name</label>
            <input 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Flight to Goa"
              style={{ width: '100%', backgroundColor: '#0d1117', border: `1px solid ${COLORS.border}`, color: 'white', padding: '8px', borderRadius: '6px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: COLORS.textMuted, marginBottom: '4px' }}>Description</label>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Any details..."
              style={{ width: '100%', backgroundColor: '#0d1117', border: `1px solid ${COLORS.border}`, color: 'white', padding: '8px', borderRadius: '6px', height: '60px', resize: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: COLORS.textMuted, marginBottom: '4px' }}>Owner</label>
            <select 
              value={formData.ownerId}
              onChange={(e) => setFormData({...formData, ownerId: e.target.value})}
              style={{ width: '100%', backgroundColor: '#0d1117', border: `1px solid ${COLORS.border}`, color: 'white', padding: '8px', borderRadius: '6px' }}
            >
              {trip.members.map((m: any) => (
                <option key={m.userId} value={m.userId}>{m.userName}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: COLORS.textMuted, marginBottom: '4px' }}>Link to Poll (Optional)</label>
            <select 
              value={formData.linkedPollId}
              onChange={(e) => setFormData({...formData, linkedPollId: e.target.value})}
              style={{ width: '100%', backgroundColor: '#0d1117', border: `1px solid ${COLORS.border}`, color: 'white', padding: '8px', borderRadius: '6px' }}
            >
              <option value="">No poll linked</option>
              {openPolls.map((poll: any) => (
                <option key={poll._id} value={poll._id}>{poll.question}</option>
              ))}
            </select>
            <p style={{ fontSize: '11px', color: COLORS.textMuted, marginTop: '4px' }}>
                Pending events stay amber until the poll closes.
            </p>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              backgroundColor: COLORS.accent, 
              color: 'white', 
              border: 'none', 
              padding: '12px', 
              borderRadius: '6px', 
              marginTop: '8px', 
              fontWeight: '600', 
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Add to Itinerary'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddEventModal;
