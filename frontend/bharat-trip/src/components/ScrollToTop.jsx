import React, { useState, useEffect } from 'react';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Check window scroll (standard pages)
      const winScroll = window.pageYOffset;
      const winHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      // Check for fixed sidebar scroll (results/planner pages)
      const sidebar = document.querySelector('.sidebar-scroll-content');
      const sidebarScroll = sidebar ? sidebar.scrollTop : 0;
      const sidebarHeight = sidebar ? (sidebar.scrollHeight - sidebar.clientHeight) : 0;

      // Use whichever is currently active
      const currentScroll = winScroll || sidebarScroll;
      const totalScroll = winHeight > 0 ? winHeight : (sidebarHeight > 0 ? sidebarHeight : 1);
      
      const progress = (currentScroll / totalScroll) * 100;
      setScrollProgress(progress);
      setIsVisible(currentScroll > 300);
    };

    window.addEventListener('scroll', handleScroll, true); // Capture phase to catch nested scrolls
    
    // Also add listener specifically to sidebar if it exists
    const sidebar = document.querySelector('.sidebar-scroll-content');
    if (sidebar) sidebar.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      if (sidebar) sidebar.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    // Scroll window
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Scroll sidebar if in fixed layout
    const sidebar = document.querySelector('.sidebar-scroll-content');
    if (sidebar) {
      sidebar.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div 
      className={`scroll-to-top ${isVisible ? 'visible' : ''}`}
      onClick={scrollToTop}
    >
      <svg className="progress-ring" width="50" height="50">
        <circle
          className="progress-ring-circle-bg"
          stroke="var(--border-main)"
          strokeWidth="3"
          fill="transparent"
          r="20"
          cx="25"
          cy="25"
        />
        <circle
          className="progress-ring-circle"
          stroke="var(--accent-blue)"
          strokeWidth="3"
          strokeDasharray="125.6"
          strokeDashoffset={125.6 - (125.6 * scrollProgress) / 100}
          strokeLinecap="round"
          fill="transparent"
          r="20"
          cx="25"
          cy="25"
        />
      </svg>
      <span className="scroll-arrow">↑</span>
      
      <style>{`
        .scroll-to-top {
          position: fixed;
          bottom: 90px;
          right: 30px;
          width: 50px;
          height: 50px;
          background: var(--bg-panel);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 1500;
          opacity: 0;
          transform: translateY(20px) scale(0.8);
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 10px 30px var(--shadow-main);
          border: 1px solid var(--border-main);
        }
        
        .scroll-to-top.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        
        .scroll-to-top:hover {
          transform: translateY(-5px) scale(1.1);
          background: var(--border-main);
        }
        
        .progress-ring {
          position: absolute;
          top: 0;
          left: 0;
          transform: rotate(-90deg);
        }
        
        .scroll-arrow {
          font-size: 20px;
          color: var(--text-main);
          font-weight: 800;
        }
        
        @media (max-width: 900px) {
          .scroll-to-top {
            bottom: 150px; /* Above BottomNav and Results Toggles */
            right: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default ScrollToTop;
