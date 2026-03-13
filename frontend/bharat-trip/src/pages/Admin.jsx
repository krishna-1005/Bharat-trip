import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { auth } from "../firebase";
import "../styles/global.css";

const API = import.meta.env.VITE_API_URL;

export default function Admin() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError("You must be logged in to access this area.");
          setLoading(false);
          return;
        }

        const token = await user.getIdToken();
        const res = await fetch(`${API}/api/admin/stats`, {
          headers: { 
            "Authorization": `Bearer ${token}` 
          }
        });

        const json = await res.json();
        if (res.ok) {
          setData(json);
        } else {
          setError(json.error || "Failed to load stats");
        }
      } catch (err) {
        setError("Could not connect to the server.");
      } finally {
        setLoading(false);
      }
    };

    const unsub = auth.onAuthStateChanged((user) => {
      if (user) fetchStats();
      else setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return <div className="admin-loading">Initializing Secure Terminal...</div>;
  if (error) return <div className="admin-error">{error}</div>;

  const { summary, recentRegisteredUsers, recentActivityLogs } = data;

  return (
    <div className="admin-page">
      <Navbar />
      <div className="admin-container">
        <header className="admin-header">
          <h1>System <span className="gradient-text">Intelligence</span></h1>
          <p>Real-time analytics and user interaction tracking.</p>
        </header>

        {/* ── STATS CARDS ── */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <span className="stat-icon">👥</span>
            <div className="stat-info">
              <span className="stat-label">Total Users</span>
              <span className="stat-value">{summary.totalRegisteredUsers}</span>
            </div>
          </div>
          <div className="admin-stat-card">
            <span className="stat-icon">🗺️</span>
            <div className="stat-info">
              <span className="stat-label">Plans Generated</span>
              <span className="stat-value">{summary.totalPlansGenerated}</span>
            </div>
          </div>
          <div className="admin-stat-card">
            <span className="stat-icon">🔖</span>
            <div className="stat-info">
              <span className="stat-label">Trips Saved</span>
              <span className="stat-value">{summary.totalTripsSavedByUsers}</span>
            </div>
          </div>
        </div>

        <div className="admin-tables-row">
          {/* ── RECENT USERS ── */}
          <section className="admin-section">
            <div className="section-header">
              <h2>Recent Registrations</h2>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRegisteredUsers.map((u, i) => (
                    <tr key={i}>
                      <td className="bold">{u.name}</td>
                      <td>{u.email}</td>
                      <td className="dim">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── RECENT USAGE ── */}
          <section className="admin-section">
            <div className="section-header">
              <h2>Activity Feed</h2>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User / IP</th>
                    <th>Trip Details</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivityLogs.map((log, i) => (
                    <tr key={i}>
                      <td>
                        <div className="user-cell">
                          <span className="bold">{log.userId ? log.userId.name : "Anonymous"}</span>
                          <span className="dim-small">{log.ipAddress}</span>
                        </div>
                      </td>
                      <td>
                        <div className="details-cell">
                          <span className="tag-blue">{log.details.days} Days</span>
                          <span className="tag-green">{log.details.budget}</span>
                        </div>
                      </td>
                      <td className="dim">{new Date(log.createdAt).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      <style jsx>{`
        .admin-page { background: #020617; min-height: 100vh; color: #f8fafc; padding-top: 80px; }
        .admin-container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .admin-header { margin-bottom: 3rem; }
        .admin-header h1 { font-size: 2.5rem; margin-bottom: 0.5rem; font-weight: 800; letter-spacing: -1px; }
        .gradient-text { background: linear-gradient(90deg, #3b82f6, #10b981); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .admin-header p { color: #94a3b8; font-size: 1.1rem; }

        .admin-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; }
        .admin-stat-card { background: #0f172a; border: 1px solid #1e293b; padding: 1.5rem; border-radius: 1rem; display: flex; align-items: center; gap: 1rem; }
        .stat-icon { font-size: 2rem; background: rgba(59, 130, 246, 0.1); width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; border-radius: 0.8rem; }
        .stat-info { display: flex; flex-direction: column; }
        .stat-label { color: #94a3b8; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; }
        .stat-value { font-size: 1.8rem; font-weight: 700; color: #fff; }

        .admin-tables-row { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
        .admin-section { background: #0f172a; border: 1px solid #1e293b; border-radius: 1.2rem; padding: 1.5rem; overflow: hidden; }
        .section-header { margin-bottom: 1.5rem; }
        .section-header h2 { font-size: 1.2rem; font-weight: 600; color: #f1f5f9; }

        .admin-table-wrap { overflow-x: auto; }
        .admin-table { width: 100%; border-collapse: collapse; text-align: left; }
        .admin-table th { color: #64748b; font-size: 0.8rem; text-transform: uppercase; padding: 1rem; border-bottom: 1px solid #1e293b; font-weight: 700; }
        .admin-table td { padding: 1rem; border-bottom: 1px solid #1e293b; font-size: 0.9rem; }
        .bold { font-weight: 600; color: #e2e8f0; }
        .dim { color: #64748b; }
        .dim-small { color: #64748b; font-size: 0.75rem; display: block; }
        .user-cell, .details-cell { display: flex; flex-direction: column; gap: 0.2rem; }
        
        .tag-blue { background: rgba(59, 130, 246, 0.1); color: #60a5fa; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; margin-right: 5px; display: inline-block; }
        .tag-green { background: rgba(16, 185, 129, 0.1); color: #34d399; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; display: inline-block; text-transform: capitalize; }

        .admin-loading { color: #3b82f6; text-align: center; padding: 5rem; font-weight: bold; }
        .admin-error { color: #ef4444; text-align: center; padding: 5rem; }

        @media (max-width: 900px) {
          .admin-tables-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
