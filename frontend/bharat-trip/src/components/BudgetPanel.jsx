import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BudgetPanel = ({ budgetData, formatPrice, variant = "floating" }) => {
  const [isExpanded, setIsExpanded] = useState(variant === "inline");

  const isInline = variant === "inline";

  return (
    <div className={isInline ? "budget-inline-wrapper" : "budget-floating-wrapper"}>
      <motion.div 
        className={`budget-card-premium ${isExpanded ? 'expanded' : 'compact'} ${isInline ? 'inline' : 'floating'}`}
        initial={false}
        animate={{ 
          height: isExpanded ? 'auto' : '70px',
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 120 }}
      >
        {/* Compact Header - Always Visible */}
        <div 
          className="budget-compact-header" 
          onClick={() => !isInline && setIsExpanded(!isExpanded)}
          style={{ cursor: isInline ? 'default' : 'pointer' }}
        >
          <div className="budget-summary-info">
            <span className={`budget-status-dot ${budgetData.isOver ? 'over' : 'under'}`}></span>
            <div className="budget-text-group">
              <span className="budget-main-label">{budgetData.isOver ? 'Budget Alert' : 'Budget Precision'}</span>
              <span className="budget-main-value">
                {formatPrice(budgetData.total)} 
                <span className="budget-slash"> / </span>
                <span className="budget-target-small">{formatPrice(budgetData.target)}</span>
              </span>
            </div>
          </div>
          
          {!isInline && (
            <div className="budget-toggle-icon">
              <motion.span
                animate={{ rotate: isExpanded ? 180 : 0 }}
                style={{ display: 'inline-block' }}
              >
                ▲
              </motion.span>
            </div>
          )}
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              className="budget-expanded-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="budget-divider"></div>
              
              <div className="budget-detailed-status">
                <span className={`detailed-status-text ${budgetData.isOver ? 'over' : 'under'}`}>
                  {budgetData.isOver ? '⚠️ Over Budget' : '✅ Within Budget'}
                </span>
                <span className="detailed-percent-text">
                  {Math.round(budgetData.percent)}% Used
                </span>
              </div>

              <div className="budget-scale-bar-wrapper">
                <div className="budget-scale-bar-bg">
                  <motion.div 
                    className={`budget-scale-bar-fill ${budgetData.isOver ? 'over' : ''}`} 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(budgetData.percent, 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  ></motion.div>
                  {budgetData.targetPercent < 100 && (
                    <div 
                      className="budget-target-marker" 
                      style={{ left: `${budgetData.targetPercent}%` }}
                    >
                      <span className="target-marker-label">Goal</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="budget-stats-grid">
                <div className="budget-stat-item">
                  <span className="stat-label">Spent</span>
                  <span className="stat-value">{formatPrice(budgetData.total)}</span>
                </div>
                <div className="budget-stat-item">
                  <span className="stat-label">Remaining</span>
                  <span className={`stat-value ${budgetData.isOver ? 'negative' : 'positive'}`}>
                    {budgetData.isOver ? '-' : ''}{formatPrice(Math.abs(budgetData.target - budgetData.total))}
                  </span>
                </div>
              </div>

              {budgetData.breakdown && (
                <div className="budget-breakdown-area">
                  <div className="breakdown-header">
                    <span>RESOURCE BREAKDOWN</span>
                  </div>
                  <div className="breakdown-items">
                    <div className="breakdown-row">
                      <span>🏨 Accommodation</span>
                      <span>{formatPrice(budgetData.breakdown.hotel)}</span>
                    </div>
                    <div className="breakdown-row">
                      <span>🍜 Food & Dining</span>
                      <span>{formatPrice(budgetData.breakdown.food)}</span>
                    </div>
                    <div className="breakdown-row">
                      <span>🚕 Transport</span>
                      <span>{formatPrice(budgetData.breakdown.transport)}</span>
                    </div>
                    <div className="breakdown-row">
                      <span>🎟️ Activities</span>
                      <span>{formatPrice(budgetData.breakdown.activities)}</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <style dangerouslySetInnerHTML={{ __html: `
        .budget-floating-wrapper {
          position: absolute;
          bottom: 100px;
          left: 20px;
          right: 20px;
          z-index: 200;
          pointer-events: none;
        }

        .budget-inline-wrapper {
          margin-bottom: 32px;
          width: 100%;
        }

        .budget-card-premium {
          pointer-events: auto;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 0 24px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0,0,0,0.4);
          width: 100%;
          box-sizing: border-box;
        }

        .budget-card-premium.inline {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: none;
          box-shadow: none;
        }

        .budget-compact-header {
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .budget-summary-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .budget-status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          box-shadow: 0 0 10px currentColor;
        }

        .budget-status-dot.under { color: #10b981; background: #10b981; }
        .budget-status-dot.over { color: #ef4444; background: #ef4444; }

        .budget-text-group {
          display: flex;
          flex-direction: column;
        }

        .budget-main-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: rgba(255,255,255,0.5);
          font-weight: 800;
        }

        .budget-main-value {
          font-size: 16px;
          font-weight: 800;
          color: #fff;
        }

        .budget-slash {
          opacity: 0.3;
          margin: 0 4px;
        }

        .budget-target-small {
          color: rgba(255,255,255,0.4);
          font-size: 14px;
        }

        .budget-toggle-icon {
          color: rgba(255,255,255,0.3);
          font-size: 10px;
        }

        .budget-expanded-content {
          padding-bottom: 24px;
        }

        .budget-divider {
          height: 1px;
          background: rgba(255,255,255,0.05);
          margin-bottom: 20px;
        }

        .budget-detailed-status {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
        }

        .detailed-status-text {
          font-size: 13px;
          font-weight: 800;
        }

        .detailed-status-text.under { color: #10b981; }
        .detailed-status-text.over { color: #ef4444; }

        .detailed-percent-text {
          font-size: 12px;
          color: rgba(255,255,255,0.5);
          font-weight: 700;
        }

        .budget-scale-bar-wrapper {
          margin: 15px 0 25px;
        }

        .budget-scale-bar-bg {
          height: 8px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          position: relative;
          overflow: visible;
        }

        .budget-scale-bar-fill {
          height: 100%;
          background: linear-gradient(to right, #3b82f6, #8b5cf6);
          border-radius: 10px;
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.4);
        }

        .budget-scale-bar-fill.over {
          background: linear-gradient(to right, #ef4444, #f59e0b);
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.4);
        }

        .budget-target-marker {
          position: absolute;
          top: -4px;
          width: 2px;
          height: 16px;
          background: #fff;
          z-index: 5;
        }

        .target-marker-label {
          position: absolute;
          top: -18px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 9px;
          font-weight: 900;
          text-transform: uppercase;
          color: #fff;
          white-space: nowrap;
        }

        .budget-stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }

        .budget-stat-item {
          display: flex;
          flex-direction: column;
        }

        .stat-label {
          font-size: 10px;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          margin-bottom: 6px;
          font-weight: 800;
        }

        .stat-value {
          font-size: 15px;
          font-weight: 800;
        }

        .stat-value.positive { color: #10b981; }
        .stat-value.negative { color: #ef4444; }

        .budget-breakdown-area {
          background: rgba(255,255,255,0.03);
          border-radius: 16px;
          padding: 16px;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .breakdown-header {
          font-size: 9px;
          font-weight: 900;
          color: rgba(255,255,255,0.3);
          letter-spacing: 1px;
          margin-bottom: 12px;
        }

        .breakdown-items {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .breakdown-row {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          font-weight: 700;
          color: rgba(255,255,255,0.7);
        }

        @media (max-width: 900px) {
          .budget-floating-wrapper {
            bottom: 120px;
          }
        }
      `}} />
    </div>
  );
};

export default BudgetPanel;
