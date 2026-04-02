import React from 'react';
import { motion } from 'framer-motion';

/**
 * CategoryCostBreakdown
 * 
 * Breaks down a daily cost into consistent categories based on percentage weights.
 * Ensures the sum of categories always equals the daily cost.
 */
const CategoryCostBreakdown = ({ dailyCost = 0, customWeights = null }) => {
  // Default percentage weights
  const defaultWeights = [
    { id: 'nature', label: 'Nature', icon: '🌿', weight: 15 },
    { id: 'food', label: 'Food', icon: '🍜', weight: 25 },
    { id: 'culture', label: 'Culture', icon: '🏛️', weight: 10 },
    { id: 'adventure', label: 'Adventure', icon: '🏔️', weight: 20 },
    { id: 'shopping', label: 'Shopping', icon: '🛍️', weight: 15 },
    { id: 'nightlife', label: 'Nightlife', icon: '🍸', weight: 15 },
  ];

  const categories = customWeights || defaultWeights;

  // Calculate breakdown
  const calculateBreakdown = () => {
    if (dailyCost <= 0) {
      return categories.map(cat => ({ ...cat, amount: 0 }));
    }

    let runningTotal = 0;
    const breakdown = categories.map((cat, index) => {
      // For all categories except the last one, calculate based on weight
      if (index < categories.length - 1) {
        const amount = Math.round((dailyCost * cat.weight) / 100);
        runningTotal += amount;
        return { ...cat, amount };
      }
      
      // For the last category, take the remainder to ensure sum consistency
      const lastAmount = Math.max(0, dailyCost - runningTotal);
      return { ...cat, amount: lastAmount };
    });

    return breakdown;
  };

  const breakdownData = calculateBreakdown();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="category-breakdown-card"
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        padding: '20px',
        marginTop: '12px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Daily Spending Estimate
        </h4>
        <span style={{ fontWeight: '800', color: 'var(--accent-blue)', fontSize: '1.1rem' }}>
          {formatCurrency(dailyCost)}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {breakdownData.map((item) => (
          <div 
            key={item.id} 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '8px 12px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.02)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>{item.label}</span>
            </div>
            <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>
              {formatCurrency(item.amount)}
            </span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', display: 'flex', overflow: 'hidden' }}>
          {breakdownData.map((item, index) => (
            <div 
              key={item.id}
              style={{ 
                height: '100%', 
                width: `${(item.amount / dailyCost) * 100}%`,
                background: [
                  '#10b981', // Nature
                  '#f59e0b', // Food
                  '#8b5cf6', // Culture
                  '#3b82f6', // Adventure
                  '#ec4899', // Shopping
                  '#6366f1'  // Nightlife
                ][index % 6],
                opacity: 0.8
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default CategoryCostBreakdown;
