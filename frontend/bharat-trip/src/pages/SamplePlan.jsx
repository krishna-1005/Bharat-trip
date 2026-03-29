import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useSettings } from "../context/SettingsContext";
import "./samplePlan.css";

export default function SamplePlan() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All Plans");
  const [modalTrip, setModalTrip] = useState(null);

  const sampleTrips = [
    {
      title: "Royal Rajasthan Explorer",
      category: "Heritage",
      rating: 4.9,
      popular: true,
      image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80",
      city: "Jaipur",
      days: [
        { 
          day: "Day 1", 
          places: [
            { name: "Hawa Mahal", cost: 50 }, 
            { name: "City Palace", cost: 300 }, 
            { name: "Jantar Mantar", cost: 200 }
          ], 
          dayMealCost: 800 
        },
        { 
          day: "Day 2", 
          places: [
            { name: "Amer Fort", cost: 500 }, 
            { name: "Nahargarh Fort", cost: 200 }, 
            { name: "Jal Mahal", cost: 0 }
          ], 
          dayMealCost: 1000 
        },
      ],
    },
    {
      title: "Agra Heritage Trail",
      category: "Heritage",
      rating: 5.0,
      popular: true,
      image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80",
      city: "Agra",
      days: [
        { 
          day: "Day 1", 
          places: [
            { name: "Taj Mahal", cost: 1100 }, 
            { name: "Agra Fort", cost: 600 }, 
            { name: "Mehtab Bagh", cost: 200 }
          ], 
          dayMealCost: 1200 
        }
      ],
    },
    {
      title: "Kerala Backwaters & Tea",
      category: "Nature",
      rating: 4.8,
      popular: true,
      image: "https://images.unsplash.com/photo-1593179241557-bce1eb92e47e?auto=format&fit=crop&w=800&q=80",
      city: "Munnar",
      days: [
        { 
          day: "Day 1", 
          places: [
            { name: "Mattupetty Dam", cost: 50 }, 
            { name: "Echo Point", cost: 20 }, 
            { name: "Tea Museum", cost: 100 }
          ], 
          dayMealCost: 600 
        },
        { 
          day: "Day 2", 
          places: [
            { name: "Eravikulam National Park", cost: 200 }, 
            { name: "Attukad Waterfalls", cost: 0 }
          ], 
          dayMealCost: 700 
        },
      ],
    },
    {
      title: "Goa Beach Bliss",
      category: "Adventure",
      rating: 4.7,
      popular: false,
      image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
      city: "Goa",
      days: [
        { 
          day: "Day 1", 
          places: [
            { name: "Baga Beach", cost: 0 }, 
            { name: "Aguada Fort", cost: 0 }, 
            { name: "Calangute Beach", cost: 0 }
          ], 
          dayMealCost: 1500 
        },
        { 
          day: "Day 2", 
          places: [
            { name: "Dudhsagar Falls", cost: 1000 }, 
            { name: "Anjuna Flea Market", cost: 0 }
          ], 
          dayMealCost: 1200 
        },
      ],
    },
  ];

  const FILTERS = ["All Plans", "Nature", "Heritage", "Adventure", "Nightlife"];

  const { formatPrice } = useSettings();

  const filtered =
    activeFilter === "All Plans"
      ? sampleTrips
      : sampleTrips.filter((t) => t.category === activeFilter);

  const handleViewOnMap = (trip) => {
    const placeCoords = {
      // Jaipur
      "Hawa Mahal": { lat: 26.9239, lng: 75.8267 },
      "City Palace": { lat: 26.9258, lng: 75.8237 },
      "Jantar Mantar": { lat: 26.9248, lng: 75.8246 },
      "Amer Fort": { lat: 26.9855, lng: 75.8513 },
      "Nahargarh Fort": { lat: 26.9374, lng: 75.8155 },
      "Jal Mahal": { lat: 26.9535, lng: 75.8462 },
      // Agra
      "Taj Mahal": { lat: 27.1751, lng: 78.0421 },
      "Agra Fort": { lat: 27.1795, lng: 78.0213 },
      "Mehtab Bagh": { lat: 27.1843, lng: 78.0421 },
      // Kerala (Munnar)
      "Mattupetty Dam": { lat: 10.1062, lng: 77.1245 },
      "Echo Point": { lat: 10.1245, lng: 77.1643 },
      "Tea Museum": { lat: 10.0921, lng: 77.0543 },
      "Eravikulam National Park": { lat: 10.1512, lng: 77.0612 },
      "Attukad Waterfalls": { lat: 10.0543, lng: 77.0421 },
      // Goa
      "Baga Beach": { lat: 15.5523, lng: 73.7516 },
      "Aguada Fort": { lat: 15.4921, lng: 73.7731 },
      "Calangute Beach": { lat: 15.5443, lng: 73.7554 },
      "Dudhsagar Falls": { lat: 15.3134, lng: 74.3142 },
      "Anjuna Flea Market": { lat: 15.5798, lng: 73.7389 }
    };

    const formattedItinerary = {};
    let totalTripCost = 0;

    trip.days.forEach((dayObj, index) => {
      const dayKey = `Day ${index + 1}`;
      const dayPlaceCosts = dayObj.places.reduce((sum, p) => sum + p.cost, 0);
      const totalDayCost = dayPlaceCosts + dayObj.dayMealCost;
      totalTripCost += totalDayCost;

      formattedItinerary[dayKey] = {
        places: dayObj.places.map((p, pIdx) => ({
          name: p.name,
          lat: placeCoords[p.name]?.lat || 12.9716,
          lng: placeCoords[p.name]?.lng || 77.5946,
          estimatedCost: p.cost,
          timeHours: 2,
          category: trip.category,
          tags: [trip.category.toLowerCase()],
          rating: 4.0 + (pIdx % 7) * 0.1,
          reviews: 500 + (pIdx % 10) * 450,
          tag: ["Top Attraction", "Popular Spot", "Hidden Gem"][pIdx % 3]
        })),
        estimatedCost: totalDayCost,
        estimatedHours: dayObj.places.length * 2,
        dayMealCost: dayObj.dayMealCost,
        color: ["#3b82f6","#10b981","#f59e0b","#ef4444"][index % 4]
      };
    });

    const planData = {
      city: trip.city,
      days: trip.days.length,
      budget: trip.category.toLowerCase().includes("nightlife") ? "high" : "medium",
      interests: [trip.category],
      itinerary: formattedItinerary,
      totalTripCost: totalTripCost,
      isSample: true
    };

    localStorage.setItem("tripPlan", JSON.stringify(planData));
    navigate("/results", { state: { plan: planData } });
  };

  const calculateTripTotal = (days) => {
    return days.reduce((acc, day) => {
      const placesCost = day.places.reduce((pSum, p) => pSum + p.cost, 0);
      return acc + placesCost + day.dayMealCost;
    }, 0);
  };

  return (
    <div className="sp-page">
      <div className="sp-container">
        <div className="sp-hero">
          <span className="sp-badge">✦ CURATED FOR YOU</span>
          <h1>Explore Sample <span className="sp-highlight">Travel Plans</span></h1>
          <p>Expertly crafted itineraries with realistic cost breakdowns.</p>
        </div>

        <div className="sp-filters">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`sp-filter-btn ${activeFilter === f ? "sp-filter-active" : ""}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="sp-grid">
          {filtered.map((trip, index) => {
            const tripTotal = calculateTripTotal(trip.days);
            return (
              <div className="sp-card" key={index}>
                <div className="sp-card-img-wrap">
                  <img src={trip.image} alt={trip.title} />
                  <span className="sp-rating">★ {trip.rating}</span>
                  {trip.popular && <span className="sp-popular-badge">POPULAR</span>}
                </div>
                <div className="sp-card-body">
                  <h3>{trip.title}</h3>
                  <div className="sp-days">
                    {trip.days.map((d, i) => (
                      <div className="sp-day-row" key={i}>
                        <div className="sp-day-label">{d.day}</div>
                        <div className="sp-day-places">
                          {d.places.slice(0, 2).map((place, p) => (
                            <span className="sp-place-tag" key={p}>📍 {place.name}</span>
                          ))}
                          {d.places.length > 2 && <span className="sp-place-tag">+{d.places.length - 2}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="sp-card-meta">
                    <span className="sp-meta-item">{trip.days.length} Days</span>
                    <span className="sp-total-price">{formatPrice(tripTotal)}</span>
                  </div>
                  <div className="sp-card-actions">
                    <button className="sp-view-btn" onClick={() => setModalTrip(trip)}>Details</button>
                    <button className="sp-map-btn" onClick={() => handleViewOnMap(trip)}>View Map</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {modalTrip && (
        <div className="sp-modal-overlay" onClick={() => setModalTrip(null)}>
          <div className="sp-modal" onClick={(e) => e.stopPropagation()}>
            <button className="sp-modal-close" onClick={() => setModalTrip(null)}>✕</button>
            <div className="sp-modal-img-wrap">
              <img src={modalTrip.image} alt={modalTrip.title} />
            </div>
            <div className="sp-modal-body">
              <h2>{modalTrip.title}</h2>
              <div className="sp-modal-days">
                {modalTrip.days.map((d, i) => {
                  const dayPlacesCost = d.places.reduce((sum, p) => sum + p.cost, 0);
                  return (
                    <div className="sp-modal-day" key={i}>
                      <div className="sp-modal-day-header">
                        <span>{d.day}</span>
                        <span>Total: {formatPrice(dayPlacesCost + d.dayMealCost)}</span>
                      </div>
                      <div className="sp-modal-places">
                        {d.places.map((p, idx) => (
                          <div key={idx} className="sp-modal-place">
                            <span>📍 {p.name}</span>
                            <span style={{ marginLeft: 'auto', color: 'var(--text-dim)', fontSize: '12px' }}>{p.cost > 0 ? formatPrice(p.cost) : 'Free'}</span>
                          </div>
                        ))}
                        <div className="sp-modal-place" style={{ borderTop: '1px solid var(--border-main)', marginTop: '8px', paddingTop: '8px', opacity: 0.8 }}>
                          <span>🍴 Estimated Meals</span>
                          <span style={{ marginLeft: 'auto', color: 'var(--text-dim)', fontSize: '12px' }}>{formatPrice(d.dayMealCost)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button className="sp-map-btn" style={{width:'100%', height:'54px'}} onClick={() => handleViewOnMap(modalTrip)}>
                View Interactive Map →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}