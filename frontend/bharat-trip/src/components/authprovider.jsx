import { useState, useEffect, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";

// Helper to get or create guestId
const getGuestId = () => {
  let gid = localStorage.getItem("bharat_trip_guest_id");
  if (!gid) {
    gid = `guest_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
    localStorage.setItem("bharat_trip_guest_id", gid);
  }
  return gid;
};

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guestId, setGuestId] = useState(getGuestId());
  const [showAuthModal, setShowAuthModal] = useState(false);

  const trackActivity = useCallback(async (u, action = "page_view") => {
    try {
      const payload = {
        action,
        userType: u ? "user" : "guest",
        userId: u?.id || u?.uid,
        guestId: localStorage.getItem("bharat_trip_guest_id"),
        email: u?.email
      };
      
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      await axios.post(`${API_URL}/api/public/track`, payload);
    } catch (err) {
      console.error("Failed to track:", err);
    }
  }, []);

  useEffect(() => {
    const gid = getGuestId();
    setGuestId(gid);

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userData = {
          uid: firebaseUser.uid,
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Traveler",
          email: firebaseUser.email,
          photo: firebaseUser.photoURL,
          userType: "user"
        };
        setUser(userData);
        trackActivity(userData, "login_detected");
        // Automatically close modal when user is authenticated
        setShowAuthModal(false);
      } else {
        setUser(null);
        trackActivity(null, "guest_session");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [trackActivity]);

  const login = useCallback((userData) => {
    setUser({ ...userData, userType: "user" });
    trackActivity(userData, "manual_login");
    setShowAuthModal(false);
  }, [trackActivity]);

  const logout = useCallback(() => {
    auth.signOut();
    setUser(null);
    trackActivity(null, "logout");
  }, [trackActivity]);

  const updateUser = useCallback((updates) => {
    setUser((prev) => ({ ...(prev || {}), ...updates }));
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      updateUser, 
      guestId,
      showAuthModal,
      setShowAuthModal
    }}>
      {children}
    </AuthContext.Provider>
  );
}