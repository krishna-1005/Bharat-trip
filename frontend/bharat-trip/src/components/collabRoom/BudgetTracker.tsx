import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  IndianRupee, 
  TrendingUp, 
  CreditCard, 
  Trash2, 
  Utensils, 
  Car, 
  Home, 
  Ticket, 
  MoreHorizontal,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchBudget, deleteExpense } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { useSocket } from '@/context/SocketContext';
import AddBudgetExpenseModal from './modals/AddBudgetExpenseModal';

const COLORS = {
  bg: '#0e0e10',
  card: '#141416',
  border: '#2a2a2e',
  green: '#1D9E75',
  coral: '#993C1D',
  purple: '#534AB7',
  text: '#e6edf3',
  textMuted: '#8b949e'
};

const CATEGORY_MAP: Record<string, { icon: any, color: string }> = {
  food: { icon: Utensils, color: '#ef9f27' },
  transport: { icon: Car, color: '#3b82f6' },
  stay: { icon: Home, color: '#8b5cf6' },
  activity: { icon: Ticket, color: '#14b8a6' },
  other: { icon: MoreHorizontal, color: '#6b7280' }
};

const BudgetTracker = ({ tripId, members }: { tripId: string, members: any[] }) => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();
  const socket = useSocket();

  const userId = user?.uid;

  const loadData = async () => {
    try {
      const data = await fetchBudget(tripId);
      setExpenses(data.expenses);
      setTotalSpent(data.totalSpent);
      setSettlements(data.settlements);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    if (socket) {
      socket.on('expense:added', () => loadData());
      socket.on('expense:deleted', () => loadData());
      socket.on('budget:updated', (data: any) => {
        setExpenses(data.expenses);
        setTotalSpent(data.totalSpent);
        setSettlements(data.settlements);
      });

      return () => {
        socket.off('expense:added');
        socket.off('expense:deleted');
        socket.off('budget:updated');
      };
    }
  }, [tripId, socket]);

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense(tripId, id);
      toast.success('Expense deleted');
    } catch (error) {
      toast.error('Failed to delete expense');
    }
  };

  // Calculate user's specific stats
  const userPaid = expenses
    .filter(e => e.paidBy.userId === userId)
    .reduce((sum, e) => sum + e.amount, 0);
  
  const userOwed = expenses.reduce((sum, e) => {
    const userSplit = e.splitBetween.find((s: any) => s.userId === userId);
    return sum + (userSplit ? userSplit.share : 0);
  }, 0);

  const userBalance = userPaid - userOwed;

  if (loading) return <div className="p-8 text-center text-gray-500">Loading budget...</div>;

  return (
    <div className="rounded-3xl bg-card border border-border p-6 shadow-soft relative overflow-visible">
      <div className="flex items-center gap-3 mb-6">
        <div className="size-10 rounded-xl bg-primary-soft text-primary grid place-items-center">
          <IndianRupee className="size-5" />
        </div>
        <div>
          <h2 className="font-display font-bold text-xl">Group Budget</h2>
          <p className="text-xs text-muted-foreground">Track expenses and settle balances</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <MetricCard 
          icon={<IndianRupee size={16} />} 
          label="Total cost" 
          value={`₹${totalSpent.toLocaleString()}`} 
        />
        <MetricCard 
          icon={<TrendingUp size={16} />} 
          label="Your share" 
          value={`₹${userOwed.toLocaleString()}`} 
          color={COLORS.purple}
        />
        <MetricCard 
          icon={<CreditCard size={16} />} 
          label="Balance" 
          value={`${userBalance >= 0 ? '+' : ''}₹${Math.abs(userBalance).toLocaleString()}`} 
          color={userBalance >= 0 ? COLORS.green : COLORS.coral}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', lgGridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Expense List */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }} className="flex items-center gap-2">
              Expenses <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-full">{expenses.length}</span>
            </h3>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px',
            }}>
              {expenses.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: COLORS.textMuted, border: `1px dashed ${COLORS.border}`, borderRadius: '12px' }}>
                  No expenses yet.
                </div>
              ) : (
                expenses.map((expense) => (
                  <ExpenseItem 
                    key={expense.id} 
                    expense={expense} 
                    onDelete={() => handleDelete(expense.id)}
                    currentUserId={userId}
                  />
                ))
              )}
            </div>
          </div>

          {/* Settle Up Panel */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>Settle Up</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {settlements.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: COLORS.textMuted, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: `1px solid ${COLORS.border}` }}>
                  All settled! 🏖️
                </div>
              ) : (
                settlements.map((s, idx) => (
                  <SettlementCard key={idx} settlement={s} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button - Positioned relative to this card for hub view */}
      <button
        onClick={() => setShowModal(true)}
        className="absolute top-6 right-6 size-10 rounded-xl bg-primary text-white shadow-cta grid place-items-center hover:scale-105 active:scale-95 transition-all"
        title="Add Expense"
      >
        <Plus size={20} />
      </button>

      {showModal && (
        <AddBudgetExpenseModal 
          tripId={tripId} 
          members={members} 
          onClose={() => setShowModal(false)} 
          onSuccess={() => {
            setShowModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
};

const MetricCard = ({ icon, label, value, color = COLORS.text }: any) => (
  <div style={{ 
    backgroundColor: 'rgba(255,255,255,0.02)', 
    border: `1px solid ${COLORS.border}`, 
    borderRadius: '16px', 
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  }}>
    <div style={{ color: COLORS.textMuted, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.05em' }}>
      {icon} {label}
    </div>
    <div style={{ fontSize: '20px', fontWeight: 'bold', color }}>{value}</div>
  </div>
);

const ExpenseItem = ({ expense, onDelete, currentUserId }: any) => {
  const CategoryIcon = CATEGORY_MAP[expense.category]?.icon || MoreHorizontal;
  const categoryColor = CATEGORY_MAP[expense.category]?.color || COLORS.textMuted;

  return (
    <div style={{ 
      backgroundColor: COLORS.card, 
      border: `1px solid ${COLORS.border}`, 
      borderRadius: '12px', 
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    }}>
      <div style={{ 
        width: '44px', 
        height: '44px', 
        borderRadius: '10px', 
        backgroundColor: `${categoryColor}20`, 
        color: categoryColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <CategoryIcon size={22} />
      </div>
      
      <div style={{ flex: 1 }}>
        <h4 style={{ fontWeight: '600', fontSize: '15px' }}>{expense.title}</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
          <div style={{ 
            width: '20px', 
            height: '20px', 
            borderRadius: '50%', 
            backgroundColor: COLORS.purple, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: 'bold'
          }}>
            {expense.paidBy.name[0]}
          </div>
          <span style={{ fontSize: '12px', color: COLORS.textMuted }}>
            Paid by {expense.paidBy.name} • {expense.splitBetween.length} people
          </span>
        </div>
      </div>

      <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>₹{expense.amount.toLocaleString()}</div>
          <div style={{ fontSize: '11px', color: COLORS.textMuted }}>{new Date(expense.createdAt).toLocaleDateString()}</div>
        </div>
        {expense.paidBy.userId === currentUserId && (
          <button 
            onClick={onDelete}
            style={{ color: COLORS.coral, background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

const SettlementCard = ({ settlement }: any) => (
  <div style={{ 
    backgroundColor: COLORS.card, 
    border: `1px solid ${COLORS.border}`, 
    borderRadius: '12px', 
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  }}>
    <div style={{ fontSize: '14px' }}>
      <span style={{ fontWeight: 'bold' }}>{settlement.from}</span>
      <span style={{ color: COLORS.textMuted, margin: '0 8px' }}>owes</span>
      <span style={{ fontWeight: 'bold' }}>{settlement.to}</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ color: COLORS.coral, fontWeight: 'bold' }}>₹{settlement.amount.toLocaleString()}</div>
      <button style={{ 
        backgroundColor: 'rgba(29, 158, 117, 0.1)', 
        color: COLORS.green, 
        border: 'none', 
        padding: '6px 12px', 
        borderRadius: '6px', 
        fontSize: '12px', 
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        <CheckCircle2 size={14} /> Paid
      </button>
    </div>
  </div>
);

export default BudgetTracker;
