import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BudgetPanel = ({ budgetData, formatPrice }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="budget-floating-wrapper">
      <motion.div 
        className={`budget-floating-card ${isExpanded ? 'expanded' : 'compact'}`}
        initial={false}
        animate={{ 
          height: isExpanded ? 'auto' : '70px',
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 120 }}
      >
        {/* Compact Header - Always Visible */}
        <div 
          className="budget-compact-header" 
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ cursor: 'pointer' }}
        >
          <div className="budget-summary-info">
            <span className={`budget-status-dot ${budgetData.isOver ? 'over' : 'under'}`}></span>
            <div className="budget-text-group">
              <span className="budget-main-label">Budget Precision</span>
              <span className="budget-main-value">
                {formatPrice(budgetData.total)} 
                <span className="budget-slash"> / </span>
                <span className="budget-target-small">{formatPrice(budgetData.target)}</span>
              </span>
            </div>
          </div>
          
          <div className="budget-toggle-icon">
            <motion.span
              animate={{ rotate: isExpanded ? 180 : 0 }}
              style={{ display: 'inline-block' }}
            >
              ▲
            </motion.span>
          </div>
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
                  <div 
                    className="budget-target-marker" 
                    style={{ left: `${budgetData.targetPercent}%` }}
                  >
                    <span className="target-marker-label">Goal</span>
                  </div>
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

        .budget-floating-card {
          pointer-events: auto;
          background: rgba(15, 15, 15, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 0 20px;
          overflow: auto;
          box-shadow: 0 10px 40px rgba(0,0,0,0.4);
          width: 100%;
          max-width: 400px;
          margin: 0 auto;
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
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: rgba(255,255,255,0.5);
          font-weight: 700;
        }

        .budget-main-value {
          font-size: 15px;
          font-weight: 800;
          color: #fff;
        }

        .budget-slash {
          opacity: 0.3;
          margin: 0 4px;
        }

        .budget-target-small {
          color: rgba(255,255,255,0.4);
          font-size: 13px;
        }

        .budget-toggle-icon {
          color: rgba(255,255,255,0.3);
          font-size: 10px;
        }

        .budget-expanded-content {
          padding-bottom: 20px;
        }

        .budget-divider {
          height: 1px;
          background: rgba(255,255,255,0.05);
          margin-bottom: 15px;
        }

        .budget-detailed-status {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
        }

        .detailed-status-text {
          font-size: 12px;
          font-weight: 800;
        }

        .detailed-status-text.under { color: #10b981; }
        .detailed-status-text.over { color: #ef4444; }

        .detailed-percent-text {
          font-size: 11px;
          color: rgba(255,255,255,0.5);
          font-weight: 600;
        }

        .budget-stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-top: 20px;
        }

        .budget-stat-item {
          display: flex;
          flex-direction: column;
        }

        .stat-label {
          font-size: 10px;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 14px;
          font-weight: 800;
        }

        .stat-value.positive { color: #10b981; }
        .stat-value.negative { color: #ef4444; }

        @media (max-width: 900px) {
          .budget-floating-wrapper {
            bottom: 160px; /* Above mobile navigation */
          }
        }
      `}} />
    </div>
  );
};

export default BudgetPanel;
