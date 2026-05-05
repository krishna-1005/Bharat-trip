import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Plus } from 'lucide-react';
import { fetchBudget } from '@/lib/api';
import AddBudgetExpenseModal from '@/components/collabRoom/modals/AddBudgetExpenseModal';
import { useAuth } from '@/components/AuthProvider';
import { useSocket } from '@/context/SocketContext';

const COLORS = {
  cardBg: '#161b22',
  border: '#30363d',
  accent: '#1d9e75',
  amber: '#ef9f27',
  red: '#f85149',
  textPrimary: '#e6edf3',
  textMuted: '#8b949e',
};

const CATEGORY_EMOJI: Record<string, string> = {
  food: '🍛',
  transport: '🚌',
  stay: '🏨',
  activity: '🎯',
  other: '💰'
};

const ExpensePanel = ({ trip, isPreview = false }: { trip: any, isPreview?: boolean }) => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const { user } = useAuth();
  const socket = useSocket();

  const fetchData = async () => {
    try {
      const data = await fetchBudget(trip._id);
      setExpenses(data.expenses);
      setTotalSpent(data.totalSpent);
      setSettlements(data.settlements);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();

    if (socket) {
      const refresh = () => fetchData();
      socket.on('expense:added', refresh);
      socket.on('expense:deleted', refresh);
      socket.on('budget:updated', (data: any) => {
        setExpenses(data.expenses);
        setTotalSpent(data.totalSpent);
        setSettlements(data.settlements);
      });
      return () => {
        socket.off('expense:added', refresh);
        socket.off('expense:deleted', refresh);
        socket.off('budget:updated');
      };
    }
  }, [trip._id, user, socket]);

  if (loading) return <Loader2 className="animate-spin" size={32} />;

  const userOwed = expenses.reduce((sum, e) => {
    const userSplit = e.splitBetween.find((s: any) => s.userId === user?.uid);
    return sum + (userSplit ? userSplit.share : 0);
  }, 0);

  const userPaid = expenses
    .filter(e => e.paidBy.userId === user?.uid)
    .reduce((sum, e) => sum + e.amount, 0);

  const userBalance = userPaid - userOwed;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Expense Split</h2>
        </div>
        {!isPreview && (
            <button 
                onClick={() => setShowAddModal(true)}
                style={{
                    backgroundColor: '#161b22',
                    color: 'white',
                    border: `1px solid ${COLORS.border}`,
                    padding: '8px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: '600',
                    fontSize: '14px'
                }}
            >
                <Plus size={18} /> Add expense
            </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard label="Total spent" value={`₹${totalSpent.toLocaleString()}`} />
        <StatCard label="Your share" value={`₹${userOwed.toLocaleString()}`} color={COLORS.accent} />
        <StatCard label="Outstanding" value={`₹${Math.abs(userBalance).toLocaleString()}`} color={userBalance >= 0 ? COLORS.accent : COLORS.amber} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', backgroundColor: COLORS.border, borderRadius: '8px', overflow: 'hidden' }}>
        {expenses.length === 0 ? (
          <div style={{ backgroundColor: COLORS.cardBg, padding: '24px', textAlign: 'center', color: COLORS.textMuted }}>
            No expenses yet.
          </div>
        ) : (
          expenses.slice(0, isPreview ? 3 : undefined).map((expense, idx) => (
            <div key={idx} style={{
              backgroundColor: COLORS.cardBg,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  backgroundColor: 'rgba(255,255,255,0.05)', 
                  borderRadius: '8px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '20px'
              }}>
                  {CATEGORY_EMOJI[expense.category] || '💰'}
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '15px', fontWeight: 'bold' }}>{expense.title}</h4>
                <p style={{ color: COLORS.textMuted, fontSize: '12px' }}>
                  Paid by {expense.paidBy.name} • {expense.splitBetween.length} people
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>₹{expense.amount.toLocaleString()}</div>
                {expense.splitBetween.some((s: any) => s.userId === user?.uid) && expense.paidBy.userId !== user?.uid && (
                  <div style={{ 
                      backgroundColor: 'rgba(239, 159, 39, 0.1)', 
                      color: COLORS.amber, 
                      fontSize: '11px', 
                      padding: '2px 8px', 
                      borderRadius: '4px', 
                      fontWeight: 'bold',
                      marginTop: '4px'
                  }}>
                      you owe ₹{(expense.splitBetween.find((s: any) => s.userId === user?.uid)?.share || 0).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <AddBudgetExpenseModal 
          tripId={trip._id} 
          members={trip.members}
          onClose={() => setShowAddModal(false)} 
          onSuccess={() => {
            setShowAddModal(false);
            fetchData();
          }} 
        />
      )}
    </div>
  );
};

const StatCard = ({ label, value, color = COLORS.textPrimary }: any) => (
  <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: `1px solid ${COLORS.border}`, borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
    <div style={{ fontSize: '18px', fontWeight: 'bold', color, marginBottom: '4px' }}>{value}</div>
    <div style={{ color: COLORS.textMuted, fontSize: '11px', textTransform: 'capitalize', fontWeight: 'bold' }}>{label}</div>
  </div>
);

export default ExpensePanel;
