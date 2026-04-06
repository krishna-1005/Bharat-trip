import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { auth } from "../firebase";
import PlaceImage from "../components/PlaceImage";
import "../styles/profile.css";

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "");

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

  useEffect(() => {
    const cachedTrips = localStorage.getItem("myTrips");
    if (cachedTrips) {
      try {
        setDbTrips(JSON.parse(cachedTrips));
        setLoading(false);
      } catch (e) {
        console.warn("Could not parse cached trips", e);
      }
    }
    if (user) fetchTrips();
  }, [user]);

  const fetchTrips = async () => {
    if (!user) return;
    try {
      const token = await auth.currentUser?.getIdToken(true);
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
      localStorage.setItem("myTrips", JSON.stringify(formatted));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
      const token = await auth.currentUser?.getIdToken(true);
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

  const handleQuickStart = (destination) => {
    // Navigate to planner with the destination as a query param
    // PlannerForm.jsx already has logic to read 'destination' from URL
    navigate(`/planner?destination=${encodeURIComponent(destination)}&days=5&budget=30000&interests=Nature,Culture,Adventure`);
  };

  const trendingSpots = [
    { 
      name: "Goa", 
      desc: "Sun, sand, and soulful sunsets.", 
      img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80" 
    },
    { 
      name: "Leh-Ladakh", 
      desc: "The land of high passes and lakes.", 
      img: "https://images.unsplash.com/photo-1581793745862-99f57ae50a2a?auto=format&fit=crop&w=800&q=80" 
    },
    { 
      name: "Jaipur", 
      desc: "Experience the royal pink city.", 
      img: "https://images.unsplash.com/photo-1599661046289-e318978b3951?auto=format&fit=crop&w=800&q=80" 
    }
  ];

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
            <h2>{dbTrips.length === 0 ? "Start Your Journey" : `Saved Itineraries (${dbTrips.length})`}</h2>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <p>Fetching your travel archives...</p>
            </div>
          ) : dbTrips.length === 0 ? (
            <div className="pro-empty-v2">
              <div className="pro-empty-welcome">
                <h2>Where to next, {user?.displayName?.split(' ')[0] || 'Traveler'}?</h2>
                <p>Start your journey with one of these trending spots.</p>
              </div>
              
              <div className="quick-start-grid">
                {trendingSpots.map((spot, i) => (
                  <div key={i} className="featured-spot-card" style={{ backgroundImage: `url(${spot.img})` }}>
                    <div className="featured-spot-overlay">
                      <div className="featured-spot-content">
                        <h3>{spot.name}</h3>
                        <p>{spot.desc}</p>
                        <button className="plan-now-btn" onClick={() => handleQuickStart(spot.name)}>
                          Plan Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="custom-start-prompt">
                <p>Or create a bespoke plan from scratch</p>
                <button className="btn-premium secondary" onClick={() => navigate("/planner")}>
                  Design Custom Odyssey
                </button>
              </div>
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

                    <div className="pro-trip-itinerary-preview" style={{ marginTop: '15px', marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {(Array.isArray(trip.itinerary) ? trip.itinerary : Object.entries(trip.itinerary || {})).slice(0, 2).map((item, i) => {
                        const dayLabel = Array.isArray(trip.itinerary) ? (item.day || `Day ${i+1}`) : item[0];
                        const places = Array.isArray(trip.itinerary) ? item.places : item[1].places;
                        return (
                          <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--accent-blue)', opacity: 0.8, minWidth: '35px' }}>{dayLabel.toUpperCase()}</span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {(places || []).slice(0, 2).map((p, pi) => (
                                <span key={pi} style={{ fontSize: '11px', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.05)', padding: '1px 6px', borderRadius: '4px' }}>
                                  {p.name}
                                </span>
                              ))}
                              {(places || []).length > 2 && <span style={{ fontSize: '10px', color: 'var(--text-dim)', opacity: 0.5 }}>+{places.length - 2}</span>}
                            </div>
                          </div>
                        );
                      })}
                      {(Array.isArray(trip.itinerary) ? trip.itinerary.length : Object.keys(trip.itinerary || {}).length) > 2 && (
                        <div style={{ fontSize: '10px', color: 'var(--accent-blue)', fontWeight: '700', marginLeft: '43px' }}>+ more days</div>
                      )}
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
