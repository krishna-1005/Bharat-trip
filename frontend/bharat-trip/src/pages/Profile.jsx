import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useSettings } from "../context/SettingsContext";
import "../styles/profile.css";

const API = import.meta.env.VITE_API_URL;

/* always returns a fresh Firebase token */
const getToken = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdToken(true); // force refresh
};

export default function Profile() {

  const navigate = useNavigate();
  const { formatPrice } = useSettings();

  const [dbTrips, setDbTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState(null);

  /* wait for firebase auth */
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


  /* fetch trips function */
  const fetchTrips = async () => {

    if (!firebaseUser) return;

    try {

      const token = await getToken();

      const res = await fetch(`${API}/api/profile/trips`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
        img:
          t.image ||
          "https://images.unsplash.com/photo-1580752300992-559f8e0734e0?w=600&q=80",
      }));

      setDbTrips(formatted);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOnMap = (trip) => {
    // Results page expects itinerary as an object { "Day 1": {...}, "Day 2": {...} }
    // but MongoDB stores it as an array [{day: "Day 1", ...}, ...]
    
    const itineryObj = {};
    if (Array.isArray(trip.itinerary)) {
      trip.itinerary.forEach((d, idx) => {
        const key = d.day || `Day ${idx + 1}`;
        itineryObj[key] = {
          places: d.places,
          estimatedCost: d.estimatedCost,
          estimatedHours: d.estimatedHours,
          color: ["#3b82f6","#10b981","#f59e0b","#ef4444"][idx % 4]
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


  /* fetch trips when user loads */
  useEffect(() => {
    if (firebaseUser) {
      fetchTrips();
    }
  }, [firebaseUser]);


  /* delete trip */
  const deleteTrip = async (id) => {

    if (!window.confirm("Delete this trip?")) return;

    try {

      const token = await getToken();

      const res = await fetch(
        `${API}/api/profile/trips/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Delete failed");
        return;
      }

      setDbTrips((prev) => prev.filter((t) => t.id !== id));

    } catch (err) {
      console.error(err);
    }

  };

  const name =
    firebaseUser?.displayName ||
    firebaseUser?.email?.split("@")[0] ||
    "Explorer";

  const initial = name.charAt(0).toUpperCase();

  const stats = [
    {
      label: "Total Trips Planned",
      value: dbTrips.length,
      sub: "Your adventures",
      subColor: "#3b82f6",
    },
    {
      label: "Countries Visited",
      value: new Set(dbTrips.map((t) => t.location)).size,
      sub: "Unique destinations",
      subColor: "#10b981",
    },
    {
      label: "Saved Places",
      value: 0,
      sub: "Active bookmarks",
      subColor: "#8b5cf6",
    },
  ];

  return (
    <div className="pro-page">

      <Navbar />

      <div className="pro-body">

        {/* HERO */}
        <div className="pro-hero">

          <div className="pro-hero-inner">

            <div className="pro-avatar">{initial}</div>

            <div className="pro-user-info">

              <h1 className="pro-name">{name}</h1>

              <p className="pro-bio">
                Adventure seeker & digital nomad
              </p>

            </div>

            <button
              className="pro-btn-primary"
              onClick={() => navigate("/planner")}
            >
              + New Trip
            </button>

          </div>

        </div>

        {/* STATS */}
        <div className="pro-stats">

          {stats.map((s, i) => (

            <div key={i} className="pro-stat-card">

              <span className="pro-stat-label">{s.label}</span>

              <div className="pro-stat-value-row">

                <span className="pro-stat-value">{s.value}</span>

                <span
                  className="pro-stat-sub"
                  style={{ color: s.subColor }}
                >
                  {s.sub}
                </span>

              </div>

            </div>

          ))}

        </div>

        {/* TRIPS */}

        <div className="pro-trips-grid">

          {loading && <p>Loading trips…</p>}

          {!loading && dbTrips.length === 0 && (
            <p>No trips yet. Plan your first trip!</p>
          )}

          {dbTrips.map((trip) => (

            <div className="pro-trip-card" key={trip.id}>

              <div className="pro-trip-img-wrap">
                <img className="pro-trip-img" src={trip.img} alt={trip.title} />
              </div>

              <div className="pro-trip-body">
                <h3 className="pro-trip-title">{trip.title}</h3>

                <div className="pro-trip-meta">
                  📍 {trip.location} • {trip.days} days • {formatPrice(trip.totalCost)}
                </div>

                <div className="pro-trip-actions">
                  <button className="pro-map-btn" onClick={() => handleViewOnMap(trip)}>
                    🗺️ View on Map
                  </button>
                  <button className="pro-del-btn" onClick={() => deleteTrip(trip.id)}>
                    🗑️ Delete
                  </button>
                </div>
              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}