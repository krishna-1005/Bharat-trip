import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { auth } from "../firebase";
import "../styles/global.css";

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "");

export default function Admin() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [config, setConfig] = useState({});
  const [broadcastMsg, setBroadcastMsg] = useState("");

  const fetchData = async (endpoint, setter) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      const res = await fetch(`${API}/api/admin/${endpoint}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok) {
        if (endpoint === "config") {
          const configMap = {};
          if (Array.isArray(json)) {
            json.forEach(c => {
              if (c.key) configMap[c.key] = c.value;
            });
          }
          setter(configMap); 
        } else {
          setter(json);
        }
      }
      else setError(json.error || "Failed to load " + endpoint);
    } catch (err) {
      setError("Server connection error.");
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchData("stats", setData);
      setLoading(false);
    };

    const unsub = auth.onAuthStateChanged((user) => {
      if (user) init();
      else setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (activeTab === "users") fetchData("users", setUsers);
    if (activeTab === "reviews") fetchData("reviews", setReviews);
    if (activeTab === "media") fetchData("config", setConfig);
  }, [activeTab]);

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${API}/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) fetchData("users", setUsers);
    } catch (err) { alert("Error updating role"); }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Delete this review forever?")) return;
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${API}/api/admin/reviews/${reviewId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) fetchData("reviews", setReviews);
    } catch (err) { alert("Error deleting review"); }
  };

  const handleUpdateConfig = async (key, value) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${API}/api/admin/config`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ key, value })
      });
      if (res.ok) alert("Configuration updated! ✨");
    } catch (err) { alert("Error updating config"); }
  };

  const sendBroadcast = async () => {
    if (!broadcastMsg.trim()) return;
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${API}/api/admin/broadcast`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: broadcastMsg })
      });
      if (res.ok) {
        alert("System broadcast sent! 📡");
        setBroadcastMsg("");
      }
    } catch (err) { alert("Broadcast failed"); }
  };

  return (
    <div className="admin-page">
      <div className="admin-container">
        {!auth.currentUser ? (
          <div className="admin-error">Authentication required. Please login as an administrator.</div>
        ) : loading ? (
          <div className="admin-loading">Initializing Secure Terminal...</div>
        ) : error ? (
          <div className="admin-error">{error}</div>
        ) : (
          <>
            <header className="admin-header">
              <h1>System <span className="gradient-text">Intelligence</span></h1>
              <div className="admin-nav-tabs">
                <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
                <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>Users</button>
                <button className={activeTab === 'reviews' ? 'active' : ''} onClick={() => setActiveTab('reviews')}>Reviews</button>
                <button className={activeTab === 'media' ? 'active' : ''} onClick={() => setActiveTab('media')}>Media & CMS</button>
              </div>
            </header>

            {activeTab === 'dashboard' && data && (
              <>
                <div className="admin-stats-grid">
                  <div className="admin-stat-card">
                    <span className="stat-icon">👥</span>
                    <div className="stat-info">
                      <span className="stat-label">Total Users</span>
                      <span className="stat-value">{data.summary.totalRegisteredUsers}</span>
                    </div>
                  </div>
                  <div className="admin-stat-card">
                    <span className="stat-icon">🗺️</span>
                    <div className="stat-info">
                      <span className="stat-label">Plans Generated</span>
                      <span className="stat-value">{data.summary.totalPlansGenerated}</span>
                    </div>
                  </div>
                  <div className="admin-stat-card">
                    <span className="stat-icon">🔖</span>
                    <div className="stat-info">
                      <span className="stat-label">Saved Trips</span>
                      <span className="stat-value">{data.summary.totalTripsSavedByUsers}</span>
                    </div>
                  </div>
                  <div className="admin-stat-card">
                    <span className="stat-icon">📊</span>
                    <div className="stat-info">
                      <span className="stat-label">Total Polls</span>
                      <span className="stat-value">{data.summary.totalPolls}</span>
                    </div>
                  </div>
                </div>

                <div className="admin-tables-row">
                  <section className="admin-section">
                    <h2>Live Activity Feed</h2>
                    <div className="admin-table-wrap">
                      <table className="admin-table">
                        <thead><tr><th>User</th><th>Action</th><th>Time</th></tr></thead>
                        <tbody>
                          {data.recentActivityLogs.map((log, i) => (
                            <tr key={i}>
                              <td className="bold">{log.userId?.name || "Guest"}</td>
                              <td><span className="tag-blue">{log.details.days} Days Plan</span></td>
                              <td className="dim">{new Date(log.createdAt).toLocaleTimeString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>
              </>
            )}

            {activeTab === 'users' && (
              <div className="admin-section">
                <h2>Registered Database</h2>
                <table className="admin-table">
                  <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id}>
                        <td className="bold">{u.name}</td>
                        <td>{u.email}</td>
                        <td><span className={`role-tag ${u.role}`}>{u.role}</span></td>
                        <td>
                          <select 
                            value={u.role} 
                            onChange={(e) => handleUpdateRole(u._id, e.target.value)}
                            className="admin-select"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="admin-section">
                <h2>Review Moderation</h2>
                <div className="admin-reviews-list">
                  {reviews.map(r => (
                    <div key={r._id} className="admin-review-card">
                      <div className="review-meta">
                        <strong>{r.userName}</strong> ({r.rating} ⭐)
                        <button className="btn-delete" onClick={() => handleDeleteReview(r._id)}>Delete</button>
                      </div>
                      <p>"{r.comment}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'media' && (
              <div className="admin-section">
                <h2>Home Page Configuration</h2>
                <p className="dim" style={{ marginBottom: '20px' }}>Directly update site-wide content and visuals.</p>
                
                <div className="config-grid">
                  <div className="config-card">
                    <h3>System Announcement</h3>
                    <textarea 
                      className="admin-textarea"
                      placeholder="Type a message for all users..."
                      value={broadcastMsg}
                      onChange={(e) => setBroadcastMsg(e.target.value)}
                    />
                    <button className="btn-broadcast" onClick={sendBroadcast}>Send Global Broadcast 📡</button>
                  </div>

                  <div className="config-card">
                    <h3>Home Page Hero Images</h3>
                    <p className="dim-small">Enter comma-separated image URLs</p>
                    <textarea 
                      className="admin-textarea"
                      defaultValue="https://images.unsplash.com/photo-1506461883276-594a12b11cf3, https://images.unsplash.com/photo-1524492412937-b28074a5d7da"
                      id="hero-urls"
                    />
                    <button 
                      className="btn-update" 
                      onClick={() => handleUpdateConfig("homepage_images", document.getElementById('hero-urls').value.split(',').map(s => s.trim()))}
                    >
                      Update Visuals ✨
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        .admin-page { background: #020617; min-height: 100vh; color: #f8fafc; padding-top: 80px; font-family: 'Plus Jakarta Sans', sans-serif; }
        .admin-container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .admin-loading { font-size: 1.5rem; text-align: center; margin-top: 5rem; color: #3b82f6; font-weight: 700; }
        .admin-error { background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 2rem; border-radius: 1rem; border: 1px solid rgba(239, 68, 68, 0.2); text-align: center; margin-top: 2rem; }
        .admin-header { margin-bottom: 3rem; display: flex; justify-content: space-between; align-items: center; }
        .admin-nav-tabs { display: flex; gap: 8px; background: #0f172a; padding: 6px; border-radius: 14px; border: 1px solid #1e293b; }
        .admin-nav-tabs button { background: transparent; border: none; color: #94a3b8; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 700; transition: all 0.3s; font-size: 0.9rem; }
        .admin-nav-tabs button.active { background: #3b82f6; color: #fff; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3); }

        .admin-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 3rem; }
        .admin-stat-card { background: #0f172a; border: 1px solid #1e293b; padding: 1.5rem; border-radius: 1.2rem; display: flex; align-items: center; gap: 1.2rem; transition: transform 0.3s ease; }
        .admin-stat-card:hover { transform: translateY(-5px); border-color: #3b82f6; }
        .stat-icon { font-size: 1.8rem; background: rgba(59, 130, 246, 0.1); width: 55px; height: 55px; display: flex; align-items: center; justify-content: center; border-radius: 1rem; }
        .stat-value { font-size: 1.6rem; font-weight: 800; display: block; color: #fff; }
        .stat-label { font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }

        .admin-section { background: #0f172a; border: 1px solid #1e293b; border-radius: 1.5rem; padding: 2rem; margin-bottom: 2rem; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        .admin-section h2 { margin-bottom: 1.5rem; font-size: 1.4rem; font-weight: 800; }
        
        .admin-table { width: 100%; border-collapse: collapse; }
        .admin-table th { text-align: left; color: #64748b; padding: 1.2rem; font-size: 0.8rem; border-bottom: 1px solid #1e293b; text-transform: uppercase; }
        .admin-table td { padding: 1.2rem; border-bottom: 1px solid #1e293b; color: #cbd5e1; }

        .config-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
        .config-card { background: #1e293b; padding: 1.5rem; border-radius: 1.2rem; display: flex; flex-direction: column; gap: 1rem; }
        .admin-textarea { background: #0f172a; border: 1px solid #334155; border-radius: 10px; color: #fff; padding: 12px; min-height: 100px; resize: vertical; outline: none; }
        
        .btn-broadcast, .btn-update { background: #3b82f6; color: white; border: none; padding: 12px; border-radius: 10px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .btn-broadcast:hover { background: #2563eb; transform: scale(1.02); }
        .btn-update { background: #10b981; }

        .role-tag { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .role-tag.admin { background: rgba(239, 68, 68, 0.1); color: #f87171; }
        .role-tag.user { background: rgba(59, 130, 246, 0.1); color: #60a5fa; }

        .admin-select { background: #0f172a; color: #fff; border: 1px solid #334155; padding: 6px 12px; border-radius: 8px; outline: none; cursor: pointer; }
        .btn-delete { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 700; }
        .btn-delete:hover { background: #ef4444; color: #fff; }

        .gradient-text { background: linear-gradient(90deg, #3b82f6, #10b981); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .bold { font-weight: 700; color: #f8fafc; }
        .dim { color: #94a3b8; }
        .dim-small { font-size: 0.8rem; color: #64748b; }
        .tag-blue { background: rgba(59, 130, 246, 0.1); color: #60a5fa; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; }

        @media (max-width: 900px) { .config-grid { grid-template-columns: 1fr; } .admin-header { flex-direction: column; gap: 1.5rem; align-items: flex-start; } .admin-stats-grid { grid-template-columns: repeat(2, 1fr); } }
      `}</style>
    </div>
  );
}
