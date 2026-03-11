import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { useSettings } from "../context/SettingsContext";
import "../styles/settings.css";

export default function Settings() {
  const navigate = useNavigate();
  const auth = getAuth();
  
  // Use Global Settings Context
  const { 
    currency, setCurrency, 
    language, setLanguage 
  } = useSettings();

  // Load toggles from local storage since they are simple
  const getInitialToggle = (key, def) => {
    const saved = localStorage.getItem(key);
    return saved !== null ? JSON.parse(saved) : def;
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

  const handleSave = () => {
    alert("Settings saved successfully!");
  };

  const handleDeleteAccount = () => {
    const confirm = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
    if (confirm) {
      alert("Account deletion request submitted. Support will contact you shortly.");
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        
        <div className="settings-header">
          <h1>Account Settings</h1>
          <p>Manage your preferences, notifications, and security.</p>
        </div>

        <div className="settings-grid">
          
          {/* ── PREFERENCES ── */}
          <section className="settings-section">
            <h2 className="section-title">🌍 Preferences</h2>
            
            <div className="settings-group">
              <div className="setting-item">
                <div className="setting-info">
                  <label>Language</label>
                  <span>Select your preferred language</span>
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
                  <label>Currency</label>
                  <span>Displayed currency for trips</span>
                </div>
                <select 
                  className="setting-select" 
                  value={currency} 
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>
          </section>

          {/* ── NOTIFICATIONS ── */}
          <section className="settings-section">
            <h2 className="section-title">🔔 Notifications</h2>
            
            <div className="settings-group">
              <div className="setting-item">
                <div className="setting-info">
                  <label>Email Alerts</label>
                  <span>Receive updates about your account</span>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    defaultChecked={getInitialToggle("settings_emailAlerts", true)}
                    onChange={(e) => localStorage.setItem("settings_emailAlerts", e.target.checked)} 
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <label>Trip Reminders</label>
                  <span>Get notified before upcoming trips</span>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    defaultChecked={getInitialToggle("settings_tripReminders", true)}
                    onChange={(e) => localStorage.setItem("settings_tripReminders", e.target.checked)} 
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </section>

          {/* ── SECURITY ── */}
          <section className="settings-section">
            <h2 className="section-title">🔒 Security</h2>
            
            <div className="settings-group">
              <div className="setting-item">
                <div className="setting-info">
                  <label>Password</label>
                  <span>Change your account password</span>
                </div>
                <button className="setting-btn outline">Update Password</button>
              </div>
            </div>
          </section>

          {/* ── DANGER ZONE ── */}
          <section className="settings-section danger-zone">
            <h2 className="section-title danger-text">⚠️ Danger Zone</h2>
            
            <div className="settings-group">
              <div className="setting-item">
                <div className="setting-info">
                  <label>Log Out</label>
                  <span>Sign out of your account on this device</span>
                </div>
                <button className="setting-btn outline-danger" onClick={handleLogout}>Log Out</button>
              </div>

              <div className="setting-item border-none">
                <div className="setting-info">
                  <label className="danger-text">Delete Account</label>
                  <span>Permanently remove your account and all data</span>
                </div>
                <button className="setting-btn danger" onClick={handleDeleteAccount}>Delete Account</button>
              </div>
            </div>
          </section>

        </div>

        <div className="settings-footer">
          <button className="settings-save-btn" onClick={handleSave}>Save Changes</button>
        </div>

      </div>
    </div>
  );
}