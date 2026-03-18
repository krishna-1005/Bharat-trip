import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useSettings } from "../context/SettingsContext";
import PlaceImage from "../components/PlaceImage";
import "../styles/profile.css";

const API = import.meta.env.VITE_API_URL;

const getToken = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdToken(true);
};

export default function MyTrips() {
  const navigate = useNavigate();
  const { formatPrice, t } = useSettings();

  const [dbTrips, setDbTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [shareStatus, setShareStatus] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
        return;
      }
      setFirebaseUser(user);
    });
    return () => unsub();
  }, [navigate]);

  const fetchTrips = async () => {
    if (!firebaseUser) return;
    try {
      const token = await getToken();
      const res = await fetch(`${API}/api/profile/trips`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        console.error(data.error);
        return;
      }
      const formatted = (data.trips || []).map((t) => ({
        id: t._id,
        title: t.title || "Custom Trip",
        dates: t.dates || new Date(t.createdAt).toLocaleDateString(),
        location: t.destination || t.city || "Bangalore",
        status: t.status || "upcoming",
        budget: t.budget,
        days: t.days,
        totalCost: t.totalTripCost,
        itinerary: t.itinerary,
        img: t.image || "https://images.unsplash.com/photo-1580752300992-559f8e0734e0?w=600&q=80",
      }));
      setDbTrips(formatted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (firebaseUser) fetchTrips();
  }, [firebaseUser]);

  const handleViewOnMap = (trip) => {
    const itineryObj = {};
    if (Array.isArray(trip.itinerary)) {
      trip.itinerary.forEach((d, idx) => {
        const key = d.day || `Day ${idx + 1}`;
        itineryObj[key] = {
          places: d.places,
          estimatedCost: d.estimatedCost,
          estimatedHours: d.estimatedHours,
          color: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"][idx % 4]
        };
      });
    }
    const planData = {
      city: trip.location,
      days: trip.days,
      itinerary: Object.keys(itineryObj).length > 0 ? itineryObj : trip.itinerary,
      totalTripCost: trip.totalCost,
      travelerType: trip.travelerType,
      pace: trip.pace,
      isSaved: true
    };
    localStorage.setItem("tripPlan", JSON.stringify(planData));
    navigate("/results", { state: { plan: planData } });
  };

  const handleShare = async (trip) => {
    const shareUrl = `${window.location.origin}/results?sharedTripId=${trip.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My Trip to ${trip.location}`,
          text: `Check out my travel plan for ${trip.location} on Bharat Trip!`,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShareStatus(trip.id);
        setTimeout(() => setShareStatus(null), 2000);
      } catch (err) {
        alert("Could not copy link. Manually copy: " + shareUrl);
      }
    }
  };

  const deleteTrip = async (id) => {
    if (!window.confirm("Delete this trip?")) return;
    try {
      const token = await getToken();
      const res = await fetch(`${API}/api/profile/trips/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Delete failed");
        return;
      }
      setDbTrips((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page pro-page">
      <div className="pro-body">
        <header className="pro-hero">
          <div className="pro-hero-inner">
            <div className="pro-user-info">
              <h1 className="pro-name">My Saved Trips</h1>
              <p className="pro-bio">Relive your past adventures and planned getaways.</p>
            </div>
            <button className="btn-premium primary" onClick={() => navigate("/planner")}>
              + Plan New Adventure
            </button>
          </div>
        </header>

        <section className="trips-section">
          <div className="section-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Your Itineraries ({dbTrips.length})</h2>
          </div>

          {loading ? (
            <div className="loading-state" style={{ textAlign: 'center', padding: '40px' }}>
              <p>Loading your adventures...</p>
            </div>
          ) : dbTrips.length === 0 ? (
            <div className="empty-state" style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--bg-panel)', borderRadius: '24px', border: '1px solid var(--border-main)' }}>
              <span style={{ fontSize: '48px' }}>🗺️</span>
              <h3 style={{ marginTop: '16px', fontSize: '1.25rem' }}>No trips found</h3>
              <p style={{ color: 'var(--text-dim)', marginBottom: '24px' }}>You haven't saved any trips yet. Start planning your first journey!</p>
              <button className="pro-btn-primary" onClick={() => navigate("/planner")}>
                Start Planning
              </button>
            </div>
          ) : (
            <div className="pro-trips-grid">
              {dbTrips.map((trip) => (
                <div className="pro-trip-card" key={trip.id}>
                  <div className="pro-trip-img-wrap">
                    <PlaceImage 
                      placeName={trip.title.includes("Trip") ? trip.location : trip.title} 
                      city={trip.location} 
                      className="pro-trip-img" 
                    />
                    <div className="pro-trip-badge badge-upcoming">{trip.days} Days</div>
                  </div>
                  <div className="pro-trip-body">
                    <h3 className="pro-trip-title">{trip.title}</h3>
                    <div className="pro-trip-meta">
                      <span>📍 {trip.location}</span>
                      <span>💰 {formatPrice(trip.totalCost)}</span>
                    </div>
                    <div className="pro-trip-actions">
                      <button className="pro-map-btn" onClick={() => handleViewOnMap(trip)}>
                        🗺️ View Map
                      </button>
                      
                      <button className="pro-share-btn" onClick={() => handleShare(trip)}>
                        {shareStatus === trip.id ? "✅ Linked" : "🔗 Share"}
                      </button>

                      <button className="pro-del-btn" title="Delete" onClick={() => deleteTrip(trip.id)}>
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}