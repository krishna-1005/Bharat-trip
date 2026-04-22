import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { useSettings } from "../context/SettingsContext";
import "../styles/settings.css";

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "");

export default function Settings() {
  const navigate = useNavigate();
  const auth = getAuth();
  
  const { 
    currency, setCurrency, 
    language, setLanguage,
    t 
  } = useSettings();

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [tripReminders, setTripReminders] = useState(true);

  // Sync with backend on load
  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const token = await user.getIdToken();
        const res = await fetch(`${API}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.user?.preferences) {
          setEmailAlerts(data.user.preferences.emailAlerts);
          setTripReminders(data.user.preferences.tripReminders);
        }
      } catch { console.error("Error fetching preferences"); }
    };
    fetchPrefs();
  }, [auth.currentUser]);

  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      
      const res = await fetch(`${API}/api/profile`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          preferences: {
            emailAlerts,
            tripReminders
          }
        })
      });

      if (res.ok) alert(t("save_changes") + "!");
    } catch { alert("Failed to save to server"); }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  const handleDeleteAccount = () => {
    const confirm = window.confirm("Are you sure?");
    if (confirm) {
      alert("Request submitted.");
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        
        <div className="settings-header">
          <h1><span>⚙️</span> {t("settings_title")}</h1>
          <p>{t("settings_sub")}</p>
        </div>

        <div className="settings-grid">
          
          {/* ── PREFERENCES ── */}
          <section className="settings-section">
            <h2 className="section-title"><span>🌍</span> {t("pref_label")}</h2>
            
            <div className="settings-group">
              <div className="setting-item">
                <div className="setting-info">
                  <label>{t("lang_label")}</label>
                  <span>{language === "English" ? "Choose your preferred language" : language === "Hindi" ? "अपनी पसंदीदा भाषा चुनें" : "ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯನ್ನು ಆರಿಸಿ"}</span>
                </div>
                <select 
                  className="setting-select" 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Kannada</option>
                </select>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <label>{t("curr_label")}</label>
                  <span>{language === "English" ? "Select display currency" : language === "Hindi" ? "डिस्प्ले मुद्रा चुनें" : "ಪ್ರದರ್ಶನ ಕರೆನ್ಸಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ"}</span>
                </div>
                <select 
                  className="setting-select" 
                  value={currency} 
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="INR">INR (₹) - Indian Rupee</option>
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                </select>
              </div>
            </div>
          </section>

          {/* ── NOTIFICATIONS ── */}
          <section className="settings-section">
            <h2 className="section-title"><span>🔔</span> {t("notif_label")}</h2>
            
            <div className="settings-group">
              <div className="setting-item">
                <div className="setting-info">
                  <label>{t("email_alerts")}</label>
                  <span>Receive trip updates via email</span>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)} 
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <label>{t("trip_reminders")}</label>
                  <span>Get reminded of upcoming journeys</span>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={tripReminders}
                    onChange={(e) => setTripReminders(e.target.checked)} 
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </section>

          {/* ── SECURITY ── */}
          <section className="settings-section">
            <h2 className="section-title"><span>🔒</span> {t("security_label")}</h2>
            <div className="settings-group">
              <div className="setting-item">
                <div className="setting-info">
                  <label>Password</label>
                  <span>Update your account password</span>
                </div>
                <button className="setting-btn outline">Update Password</button>
              </div>
              <div className="setting-item">
                <div className="setting-info">
                  <label>Two-Factor Auth</label>
                  <span>Add an extra layer of security</span>
                </div>
                <button className="setting-btn outline">Enable</button>
              </div>
            </div>
          </section>

          {/* ── DANGER ZONE ── */}
          <section className="settings-section danger-zone">
            <h2 className="section-title danger-text"><span>⚠️</span> {t("danger_label")}</h2>
            
            <div className="settings-group">
              <div className="setting-item">
                <div className="setting-info">
                  <label>{t("logout_btn")}</label>
                  <span>Sign out from your current session</span>
                </div>
                <button className="setting-btn outline-danger" onClick={handleLogout}>{t("logout_btn")}</button>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <label className="danger-text">{t("delete_acc")}</label>
                  <span>Permanently delete your account and data</span>
                </div>
                <button className="setting-btn danger" onClick={handleDeleteAccount}>{t("delete_acc")}</button>
              </div>
            </div>
          </section>

        </div>

        <div className="settings-footer">
          <button className="settings-save-btn" onClick={handleSave}>{t("save_changes")}</button>
        </div>

      </div>
    </div>
  );
}