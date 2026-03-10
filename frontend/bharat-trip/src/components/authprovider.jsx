import { useState, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";

export default function AuthProvider({ children }) {

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      return typeof parsed === "object" && parsed !== null ? parsed : null;
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  });

  const login = useCallback((userData) => {

    const safeUser = {
      id: userData.id || userData._id || "",
      name: userData.name || userData.email || "User",
      email: userData.email || "",
      photo: userData.photo || "",
      tier: userData.tier || "free",
    };

    localStorage.setItem("user", JSON.stringify(safeUser));

    if (userData.token) {
      localStorage.setItem("token", userData.token);
    }

    setUser(safeUser);

  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const updated = { ...(prev || {}), ...updates };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}