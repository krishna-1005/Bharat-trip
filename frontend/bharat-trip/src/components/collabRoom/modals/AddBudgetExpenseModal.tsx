import React, { useState, useEffect } from 'react';
import { X, Loader2, Check } from 'lucide-react';
import { addExpense } from '@/lib/api';
import { toast } from 'sonner';

const COLORS = {
  bg: '#0e0e10',
  card: '#141416',
  border: '#2a2a2e',
  purple: '#534AB7',
  text: '#e6edf3',
  textMuted: '#8b949e'
};

const AddBudgetExpenseModal = ({ tripId, members, onClose, onSuccess }: any) => {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [category, setCategory] = useState('food');
  const [paidBy, setPaidBy] = useState(members[0] || {});
  const [splitBetween, setSplitBetween] = useState(members.map(m => ({ ...m, share: 0 })));
  const [isEqualSplit, setIsEqualSplit] = useState(true);

  // Update equal split shares when amount or split members change
  useEffect(() => {
    if (isEqualSplit) {
      const selectedMembers = splitBetween.filter(m => m.selected);
      const totalAmount = parseFloat(amount) || 0;
      const share = totalAmount / (selectedMembers.length || 1);
      setSplitBetween(prev => prev.map(m => ({
        ...m,
        share: m.selected ? parseFloat(share.toFixed(2)) : 0
      })));
    }
  }, [amount, isEqualSplit, splitBetween.filter(m => m.selected).length]);

  const handleToggleMember = (userId: string) => {
    setSplitBetween(prev => prev.map(m => {
      const mId = m.userId?._id || m.userId;
      return mId === userId ? { ...m, selected: !m.selected } : m;
    }));
  };

  const handleCustomShareChange = (userId: string, value: string) => {
    const share = parseFloat(value) || 0;
    setSplitBetween(prev => prev.map(m => {
      const mId = m.userId?._id || m.userId;
      return mId === userId ? { ...m, share } : m;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) {
      toast.error('Please fill in title and amount');
      return;
    }

    const selectedMembers = splitBetween.filter(m => m.selected);
    if (selectedMembers.length === 0) {
      toast.error('Please select at least one person to split with');
      return;
    }

    // Validate custom split sum
    if (!isEqualSplit) {
      const totalShare = splitBetween.reduce((sum, m) => sum + m.share, 0);
      if (Math.abs(totalShare - parseFloat(amount)) > 0.1) {
        toast.error(`Total shares (₹${totalShare}) must equal total amount (₹${amount})`);
        return;
      }
    }

    setLoading(true);
    try {
      const pId = paidBy.userId?._id || paidBy.userId;
      const pName = paidBy.userId?.name || paidBy.userName || paidBy.name || 'Unknown';

      const expenseData = {
        title,
        amount: parseFloat(amount),
        currency,
        category,
        paidBy: {
          userId: pId,
          name: pName
        },
        splitBetween: selectedMembers.map(m => ({
          userId: m.userId?._id || m.userId,
          name: m.userId?.name || m.userName || m.name || 'Unknown',
          share: m.share
        }))
      };

      await addExpense(tripId, expenseData);
      toast.success('Expense added successfully');
      onSuccess();
    } catch (error) {
      toast.error('Failed to add expense');
      setLoading(false);
    }
  };

  // Ensure members have 'selected' property initially
  useEffect(() => {
    if (members && members.length > 0) {
      setSplitBetween(members.map(m => ({ ...m, selected: true, share: 0 })));
      setPaidBy(members[0]);
    }
  }, [members]);

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      backgroundColor: 'rgba(0,0,0,0.8)', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{ 
        backgroundColor: COLORS.card, 
        border: `1px solid ${COLORS.border}`, 
        borderRadius: '20px', 
        width: '480px', 
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '32px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold' }}>Add Expense</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: COLORS.textMuted, cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: COLORS.textMuted, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Title</label>
            <input 
              autoFocus
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What did you pay for?"
              style={{ width: '100%', backgroundColor: COLORS.bg, border: `1px solid ${COLORS.border}`, color: 'white', padding: '12px 16px', borderRadius: '12px', fontSize: '16px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 2 }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: COLORS.textMuted, marginBottom: '8px', textTransform: 'uppercase' }}>Amount</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: COLORS.textMuted }}>₹</span>
                <input 
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  style={{ width: '100%', backgroundColor: COLORS.bg, border: `1px solid ${COLORS.border}`, color: 'white', padding: '12px 16px 12px 32px', borderRadius: '12px', fontSize: '16px' }}
                />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: COLORS.textMuted, marginBottom: '8px', textTransform: 'uppercase' }}>Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', backgroundColor: COLORS.bg, border: `1px solid ${COLORS.border}`, color: 'white', padding: '12px', borderRadius: '12px', fontSize: '15px' }}
              >
                <option value="food">Food</option>
                <option value="transport">Transport</option>
                <option value="stay">Stay</option>
                <option value="activity">Activity</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: COLORS.textMuted, marginBottom: '8px', textTransform: 'uppercase' }}>Paid By</label>
            <select 
              value={paidBy.userId?._id || paidBy.userId}
              onChange={(e) => setPaidBy(members.find(m => (m.userId?._id || m.userId) === e.target.value) || {})}
              style={{ width: '100%', backgroundColor: COLORS.bg, border: `1px solid ${COLORS.border}`, color: 'white', padding: '12px', borderRadius: '12px', fontSize: '15px' }}
            >
              {members.map(m => {
                const mId = m.userId?._id || m.userId;
                const mName = m.userId?.name || m.userName || m.name || 'Unknown';
                return (
                  <option key={mId} value={mId}>{mName}</option>
                );
              })}
            </select>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: COLORS.textMuted, textTransform: 'uppercase' }}>Split Between</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  type="button" 
                  onClick={() => setIsEqualSplit(true)}
                  style={{ 
                    fontSize: '11px', 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    backgroundColor: isEqualSplit ? COLORS.purple : 'transparent',
                    color: 'white',
                    border: `1px solid ${isEqualSplit ? COLORS.purple : COLORS.border}`,
                    cursor: 'pointer'
                  }}
                >
                  Equal
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsEqualSplit(false)}
                  style={{ 
                    fontSize: '11px', 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    backgroundColor: !isEqualSplit ? COLORS.purple : 'transparent',
                    color: 'white',
                    border: `1px solid ${!isEqualSplit ? COLORS.purple : COLORS.border}`,
                    cursor: 'pointer'
                  }}
                >
                  Custom
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {splitBetween.map(m => {
                const mId = m.userId?._id || m.userId;
                const mName = m.userId?.name || m.userName || m.name || 'Unknown';
                return (
                  <div key={mId} style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: COLORS.bg, padding: '8px 12px', borderRadius: '10px', border: `1px solid ${COLORS.border}` }}>
                    <button
                      type="button"
                      onClick={() => handleToggleMember(mId)}
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        backgroundColor: m.selected ? COLORS.purple : 'transparent',
                        border: `1px solid ${m.selected ? COLORS.purple : COLORS.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'white'
                      }}
                    >
                      {m.selected && <Check size={14} />}
                    </button>
                    <span style={{ flex: 1, fontSize: '14px' }}>{mName}</span>
                    {m.selected && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '12px', color: COLORS.textMuted }}>₹</span>
                        <input 
                          type="number"
                          disabled={isEqualSplit}
                          value={m.share}
                          onChange={(e) => handleCustomShareChange(mId, e.target.value)}
                          style={{ 
                            width: '80px', 
                            backgroundColor: isEqualSplit ? 'transparent' : '#000', 
                            border: `1px solid ${isEqualSplit ? 'transparent' : COLORS.border}`, 
                            color: 'white', 
                            padding: '4px 8px', 
                            borderRadius: '6px', 
                            fontSize: '14px',
                            textAlign: 'right'
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              backgroundColor: COLORS.purple, 
              color: 'white', 
              border: 'none', 
              padding: '16px', 
              borderRadius: '12px', 
              marginTop: '12px', 
              fontWeight: 'bold', 
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              transition: 'transform 0.2s',
              boxShadow: '0 8px 16px rgba(83, 74, 183, 0.3)'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : 'Save Expense'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBudgetExpenseModal;
