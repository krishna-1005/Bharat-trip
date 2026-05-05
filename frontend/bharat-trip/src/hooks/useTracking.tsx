import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import api from '@/lib/api';

/**
 * useTracking hook sends a tracking event to the backend on every route change.
 * It handles both registered users and anonymous guests.
 */
export const useTracking = () => {
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // 1. Get or create guestId for anonymous tracking
    let guestId = localStorage.getItem('gt_guest_id');
    if (!guestId) {
      guestId = 'g_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('gt_guest_id', guestId);
    }

    // 2. Prepare tracking data
    const trackData = {
      userId: user?.uid || null,
      userType: user ? 'user' : 'guest',
      guestId: guestId,
      action: 'page_view',
      details: {
        path: location.pathname,
        referrer: document.referrer,
        title: document.title,
        screenRes: `${window.screen.width}x${window.screen.height}`,
      }
    };

    // 3. Send to backend (fire and forget)
    const track = async () => {
      try {
        // Use /public/track which is unauthenticated but allows userId/guestId
        await api.post('/public/track', trackData);
      } catch (err) {
        // Silent fail to not disturb user experience
        console.debug('Analytics ping skipped');
      }
    };

    // Delay slightly to ensure page title is updated if changed by React Helmet or similar
    const timer = setTimeout(track, 500);
    return () => clearTimeout(timer);
  }, [location.pathname, user?.uid]);
};
