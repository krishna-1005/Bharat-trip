import React, { useState, useEffect } from 'react';
import './installPrompt.css';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can add to home screen
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsVisible(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="install-banner">
      <div className="install-content">
        <div className="install-icon">📲</div>
        <div className="install-text">
          <strong>Install Bharat Trip</strong>
          <span>Add to home screen for faster access & offline use</span>
        </div>
      </div>
      <div className="install-actions">
        <button className="install-btn" onClick={handleInstallClick}>Install</button>
        <button className="install-close" onClick={() => setIsVisible(false)}>✕</button>
      </div>
    </div>
  );
};

export default InstallPrompt;
