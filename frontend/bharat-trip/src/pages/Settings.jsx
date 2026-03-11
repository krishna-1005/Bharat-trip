import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { useSettings } from "../context/SettingsContext";
import "../styles/settings.css";

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
      } catch (err) { console.error(err); }
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
    } catch (err) { alert("Failed to save to server"); }
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
          <h1>{t("settings_title")}</h1>
          <p>{t("settings_sub")}</p>
        </div>

        <div className="settings-grid">
          
          {/* ── PREFERENCES ── */}
          <section className="settings-section">
            <h2 className="section-title">🌍 {t("pref_label")}</h2>
            
            <div className="settings-group">
              <div className="setting-item">
                <div className="setting-info">
                  <label>{t("lang_label")}</label>
                  <span>Select language</span>
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
                  <span>Displayed currency</span>
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
            <h2 className="section-title">🔔 {t("notif_label")}</h2>
            
            <div className="settings-group">
              <div className="setting-item">
                <div className="setting-info">
                  <label>{t("email_alerts")}</label>
                  <span>Email updates</span>
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
                  <span>Upcoming trips</span>
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
            <h2 className="section-title">🔒 {t("security_label")}</h2>
            <div className="settings-group">
              <div className="setting-item">
                <div className="setting-info">
                  <label>Password</label>
                  <span>Change password</span>
                </div>
                <button className="setting-btn outline">Update</button>
              </div>
            </div>
          </section>

          {/* ── DANGER ZONE ── */}
          <section className="settings-section danger-zone">
            <h2 className="section-title danger-text">⚠️ {t("danger_label")}</h2>
            
            <div className="settings-group">
              <div className="setting-item">
                <div className="setting-info">
                  <label>{t("logout_btn")}</label>
                  <span>Sign out</span>
                </div>
                <button className="setting-btn outline-danger" onClick={handleLogout}>{t("logout_btn")}</button>
              </div>

              <div className="setting-item border-none">
                <div className="setting-info">
                  <label className="danger-text">{t("delete_acc")}</label>
                  <span>Remove data</span>
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