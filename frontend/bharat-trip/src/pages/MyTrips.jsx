import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import PlaceImage from "../components/PlaceImage";
import "../styles/profile.css";

const API = import.meta.env.VITE_API_URL;

export default function MyTrips() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { formatPrice, t } = useSettings();

  const [dbTrips, setDbTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareStatus, setShareStatus] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const fetchTrips = async () => {
    if (!user) return;
    try {
      const token = user.token || localStorage.getItem("token");
      if (!token) return;

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
        image: t.image,
      }));
      setDbTrips(formatted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchTrips();
  }, [user]);

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
      isSaved: true
    };
    localStorage.setItem("tripPlan", JSON.stringify(planData));
    navigate("/results", { state: { plan: planData } });
  };

  const handleShare = async (trip) => {
    const shareUrl = `${window.location.origin}/trip/${trip.id}`;
    
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
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShareStatus(trip.id);
        setTimeout(() => setShareStatus(null), 2000);
      } catch (err) {
        alert("Could not copy link. Manually copy: " + shareUrl);
      }
    }
  };

  const deleteTrip = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this journey?")) return;
    try {
      const token = user.token || localStorage.getItem("token");
      const res = await fetch(`${API}/api/profile/trips/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setDbTrips((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="pro-page">
      <div className="pro-body">
        <header className="pro-hero">
          <div className="pro-hero-inner">
            <div className="pro-user-info">
              <h1 className="pro-name">My Journeys</h1>
              <p className="pro-bio">Your personal collection of world-class travel plans.</p>
            </div>
            <button className="btn-premium primary" onClick={() => navigate("/planner")}>
              + Create New Plan
            </button>
          </div>
        </header>

        <section className="pro-section">
          <div className="section-header">
            <h2>Saved Itineraries ({dbTrips.length})</h2>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <p>Fetching your travel archives...</p>
            </div>
          ) : dbTrips.length === 0 ? (
            <div className="pro-empty">
              <div className="pro-empty-icon">🗺️</div>
              <h3>No journeys found</h3>
              <p>You haven't saved any travel plans yet. Ready to design your first adventure?</p>
              <button className="btn-premium primary" style={{ marginTop: '12px' }} onClick={() => navigate("/planner")}>
                Start Planning
              </button>
            </div>
          ) : (
            <div className="pro-trips-grid">
              {dbTrips.map((trip) => (
                <div className="pro-trip-card" key={trip.id}>
                  <div className="pro-trip-img-wrap" onClick={() => handleViewOnMap(trip)} style={{ cursor: 'pointer' }}>
                    <PlaceImage 
                      placeName={trip.title.includes("Trip") ? trip.location : trip.title} 
                      city={trip.location} 
                      className="pro-trip-img" 
                    />
                    <div className="pro-trip-badge">{trip.days} Days</div>
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

                      <button className="pro-del-btn" title="Delete" onClick={(e) => deleteTrip(e, trip.id)}>
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
