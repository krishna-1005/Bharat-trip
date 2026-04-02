import { useState, useEffect, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged is the ONLY reliable way to detect Firebase users on reload
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        console.log("DEBUG: Auth State Changed - User Available:", firebaseUser.uid);
        // Create a user object that matches your existing structure but ensures UID is present
        setUser({
          uid: firebaseUser.uid,
          id: firebaseUser.uid, // mapped for compatibility
          name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Traveler",
          email: firebaseUser.email,
          photo: firebaseUser.photoURL,
        });
      } else {
        console.log("DEBUG: Auth State Changed - No User Found");
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback((userData) => {
    // Keep login for backward compatibility or manual state overrides
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    auth.signOut();
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => ({ ...(prev || {}), ...updates }));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}