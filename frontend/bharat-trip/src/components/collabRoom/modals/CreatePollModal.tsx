import React, { useState } from 'react';
import axios from 'axios';
import { X, Loader2, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

const COLORS = {
  cardBg: '#161b22',
  border: '#30363d',
  accent: '#1d9e75',
  textPrimary: '#e6edf3',
  textMuted: '#8b949e',
};

const CreatePollModal = ({ trip, onClose, onSuccess }: any) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [linkedEventId, setLinkedEventId] = useState('');

  const handleAddOption = () => setOptions([...options, '']);
  const handleRemoveOption = (index: number) => setOptions(options.filter((_, i) => i !== index));
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validOptions = options.filter(o => o.trim() !== '');
    if (!question || validOptions.length < 2 || !user) return;

    setLoading(true);
    try {
      const token = await user.getIdToken();
      await axios.post(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/api/trips/${trip._id}/polls-v2`, 
        { question, options: validOptions, linkedEventId: linkedEventId || undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSuccess();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: '12px', width: '450px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold' }}>Create Poll</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: COLORS.textMuted, cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: COLORS.textMuted, marginBottom: '4px' }}>Question</label>
            <input 
              required
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Which beach should we visit?"
              style={{ width: '100%', backgroundColor: '#0d1117', border: `1px solid ${COLORS.border}`, color: 'white', padding: '10px', borderRadius: '6px' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: COLORS.textMuted, marginBottom: '8px' }}>Options</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {options.map((option, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    required
                    value={option}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                    style={{ flex: 1, backgroundColor: '#0d1117', border: `1px solid ${COLORS.border}`, color: 'white', padding: '8px', borderRadius: '6px' }}
                  />
                  {options.length > 2 && (
                    <button 
                      type="button" 
                      onClick={() => handleRemoveOption(idx)}
                      style={{ background: 'none', border: 'none', color: '#f85149', cursor: 'pointer' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button 
              type="button" 
              onClick={handleAddOption}
              style={{ background: 'none', border: 'none', color: COLORS.accent, cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}
            >
              <Plus size={16} /> Add Option
            </button>
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
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Create Poll'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePollModal;
