const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "");

export const trackActivity = async (action, details = {}) => {
  try {
    // Generate or get guest ID from localStorage
    let guestId = localStorage.getItem('gotripo_guest_id');
    if (!guestId) {
      guestId = 'guest_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('gotripo_guest_id', guestId);
    }

    // Try to get current user from a global way if possible, or just pass it in
    // For now, we'll rely on the backend to identify the user via Bearer token if present
    
    const token = localStorage.getItem('token'); // Check if we have a custom JWT
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    await fetch(`${API}/api/public/track`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        action,
        guestId,
        details,
        platform: 'web',
        timestamp: new Date().toISOString()
      })
    });
  } catch (err) {
    console.warn("Tracking failed:", err.message);
  }
};
