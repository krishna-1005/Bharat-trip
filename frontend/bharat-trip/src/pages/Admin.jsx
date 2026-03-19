import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { auth } from "../firebase";
import "../styles/global.css";

const API = import.meta.env.VITE_API_URL;

export default function Admin() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);

  const fetchData = async (endpoint, setter) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      const res = await fetch(`${API}/api/admin/${endpoint}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok) setter(json);
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

  if (loading) return <div className="admin-loading">Initializing Secure Terminal...</div>;
  if (error) return <div className="admin-error">{error}</div>;

  return (
    <div className="admin-page">
      <Navbar />
      <div className="admin-container">
        <header className="admin-header">
          <h1>System <span className="gradient-text">Intelligence</span></h1>
          <div className="admin-nav-tabs">
            <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
            <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>User Management</button>
            <button className={activeTab === 'reviews' ? 'active' : ''} onClick={() => setActiveTab('reviews')}>Moderation</button>
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
                <h2>Activity Feed</h2>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead><tr><th>User</th><th>Action</th><th>Time</th></tr></thead>
                    <tbody>
                      {data.recentActivityLogs.map((log, i) => (
                        <tr key={i}>
                          <td>{log.userId?.name || "Guest"}</td>
                          <td><span className="tag-blue">{log.details.days} Days Plan</span></td>
                          <td>{new Date(log.createdAt).toLocaleTimeString()}</td>
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
      </div>

      <style jsx>{`
        .admin-page { background: #020617; min-height: 100vh; color: #f8fafc; padding-top: 80px; }
        .admin-container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .admin-header { margin-bottom: 3rem; display: flex; justify-content: space-between; align-items: flex-end; }
        .admin-nav-tabs { display: flex; gap: 10px; background: #0f172a; padding: 5px; border-radius: 12px; border: 1px solid #1e293b; }
        .admin-nav-tabs button { background: transparent; border: none; color: #94a3b8; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
        .admin-nav-tabs button.active { background: #1e293b; color: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }

        .admin-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 3rem; }
        .admin-stat-card { background: #0f172a; border: 1px solid #1e293b; padding: 1.5rem; border-radius: 1rem; display: flex; align-items: center; gap: 1rem; }
        .stat-icon { font-size: 1.8rem; background: rgba(59, 130, 246, 0.1); width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; border-radius: 0.8rem; }
        .stat-value { font-size: 1.5rem; font-weight: 700; }

        .admin-section { background: #0f172a; border: 1px solid #1e293b; border-radius: 1.2rem; padding: 1.5rem; margin-bottom: 2rem; }
        .admin-table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
        .admin-table th { text-align: left; color: #64748b; padding: 1rem; font-size: 0.8rem; border-bottom: 1px solid #1e293b; }
        .admin-table td { padding: 1rem; border-bottom: 1px solid #1e293b; }

        .role-tag { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .role-tag.admin { background: rgba(239, 68, 68, 0.1); color: #f87171; }
        .role-tag.user { background: rgba(59, 130, 246, 0.1); color: #60a5fa; }

        .admin-select { background: #1e293b; color: #fff; border: 1px solid #334155; padding: 5px 10px; border-radius: 6px; outline: none; }
        .admin-review-card { background: #1e293b; padding: 1.5rem; border-radius: 1rem; margin-bottom: 1rem; }
        .review-meta { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .btn-delete { background: #ef4444; border: none; color: #fff; padding: 4px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; }

        .gradient-text { background: linear-gradient(90deg, #3b82f6, #10b981); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800; }
        @media (max-width: 1000px) { .admin-stats-grid { grid-template-columns: repeat(2, 1fr); } }
      `}</style>
    </div>
  );
}
