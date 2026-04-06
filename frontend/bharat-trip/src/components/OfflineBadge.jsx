import React, { useState, useEffect } from 'react';

const OfflineBadge = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-20 right-4 z-[9999] animate-pulse">
      <div className="bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 border border-orange-400">
        <span className="w-2 h-2 bg-white rounded-full"></span>
        OFFLINE MODE
      </div>
    </div>
  );
};

export default OfflineBadge;
