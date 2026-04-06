import React from 'react';
import { useSettings } from '../context/SettingsContext';
import { motion } from 'framer-motion';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useSettings();

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'English' ? 'Hindi' : 'English');
  };

  return (
    <button 
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs font-bold text-white/80 overflow-hidden relative group"
      style={{ height: '32px', minWidth: '60px', justifyContent: 'center' }}
    >
      <motion.div
        className="flex flex-col items-center"
        animate={{ y: language === 'English' ? 0 : -20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <span className="h-5 flex items-center justify-center">EN</span>
        <span className="h-5 flex items-center justify-center">HI</span>
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
};

export default LanguageSwitcher;
