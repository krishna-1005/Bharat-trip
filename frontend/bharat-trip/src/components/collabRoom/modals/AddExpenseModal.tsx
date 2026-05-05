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

const AddExpenseModal = ({ trip, onClose, onSuccess }: any) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: 'food',
    paidBy: trip.members[0]?.userId || '',
    splitAmong: trip.members.map((m: any) => m.userId)
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.amount || !user) return;

    setLoading(true);
    try {
      const token = await user.getIdToken();
      await axios.post(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/api/trips/${trip._id}/expenses`, 
        { ...formData, amount: parseFloat(formData.amount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSuccess();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const toggleMember = (userId: string) => {
    setFormData(prev => {
      const splitAmong = prev.splitAmong.includes(userId)
        ? prev.splitAmong.filter(id => id !== userId)
        : [...prev.splitAmong, userId];
      return { ...prev, splitAmong };
    });
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: '12px', width: '400px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold' }}>Add Expense</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: COLORS.textMuted, cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: COLORS.textMuted, marginBottom: '4px' }}>What was it for?</label>
            <input 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Dinner at Fisherman's Wharf"
              style={{ width: '100%', backgroundColor: '#0d1117', border: `1px solid ${COLORS.border}`, color: 'white', padding: '8px', borderRadius: '6px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: COLORS.textMuted, marginBottom: '4px' }}>Amount ($)</label>
            <input 
              type="number"
              step="0.01"
              required
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              placeholder="0.00"
              style={{ width: '100%', backgroundColor: '#0d1117', border: `1px solid ${COLORS.border}`, color: 'white', padding: '8px', borderRadius: '6px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: COLORS.textMuted, marginBottom: '4px' }}>Category</label>
            <select 
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              style={{ width: '100%', backgroundColor: '#0d1117', border: `1px solid ${COLORS.border}`, color: 'white', padding: '8px', borderRadius: '6px' }}
            >
              <option value="food">Food</option>
              <option value="hotel">Hotel</option>
              <option value="transport">Transport</option>
              <option value="activity">Activity</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: COLORS.textMuted, marginBottom: '4px' }}>Paid By</label>
            <select 
              value={formData.paidBy}
              onChange={(e) => setFormData({...formData, paidBy: e.target.value})}
              style={{ width: '100%', backgroundColor: '#0d1117', border: `1px solid ${COLORS.border}`, color: 'white', padding: '8px', borderRadius: '6px' }}
            >
              {trip.members.map(m => (
                <option key={m.userId} value={m.userId}>{m.userName}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: COLORS.textMuted, marginBottom: '8px' }}>Split Among</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {trip.members.map(m => (
                <button
                  key={m.userId}
                  type="button"
                  onClick={() => toggleMember(m.userId)}
                  style={{
                    backgroundColor: formData.splitAmong.includes(m.userId) ? COLORS.accent : '#0d1117',
                    color: 'white',
                    border: `1px solid ${COLORS.border}`,
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  {m.userName}
                </button>
              ))}
            </div>
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
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Save Expense'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;
