import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useSettings } from "../context/SettingsContext";
import "./samplePlan.css";

import img2 from "../assets/images/img2.webp";
import img5 from "../assets/images/img5.webp";
import img1 from "../assets/images/img1.webp";
import img3 from "../assets/images/img3.webp";

export default function SamplePlan() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All Plans");
  const [modalTrip, setModalTrip] = useState(null);

  const sampleTrips = [
    {
      title: "Bangalore Spiritual Journey",
      category: "Heritage",
      rating: 4.9,
      popular: true,
      image: img5,
      days: [
        { 
          day: "Day 1", 
          places: [
            { name: "ISKCON Temple", cost: 0 }, 
            { name: "Bull Temple", cost: 50 }, 
            { name: "Someshwara Temple", cost: 20 }
          ], 
          dayMealCost: 300 
        },
        { 
          day: "Day 2", 
          places: [
            { name: "St. Mary's Basilica", cost: 0 }, 
            { name: "Jamia Masjid", cost: 0 }, 
            { name: "Gavi Gangadhareshwara Temple", cost: 30 }
          ], 
          dayMealCost: 350 
        },
      ],
    },
    {
      title: "Pub Capital Experience",
      category: "Nightlife",
      rating: 4.8,
      popular: true,
      image: img2,
      days: [
        { 
          day: "Day 1", 
          places: [
            { name: "MG Road", cost: 200 }, 
            { name: "Church Street", cost: 300 }, 
            { name: "Brigade Road", cost: 200 }
          ], 
          dayMealCost: 1500 
        },
        { 
          day: "Day 2", 
          places: [
            { name: "Indiranagar 100ft Road", cost: 500 }, 
            { name: "Koramangala 5th Block", cost: 400 }
          ], 
          dayMealCost: 2000 
        },
      ],
    },
    {
      title: "Silicon Valley Explorer",
      category: "Adventure",
      rating: 4.7,
      popular: false,
      image: img3,
      days: [
        { 
          day: "Day 1", 
          places: [
            { name: "Visvesvaraya Museum", cost: 100 }, 
            { name: "HAL Aerospace Museum", cost: 50 }, 
            { name: "Jawaharlal Nehru Planetarium", cost: 60 }
          ], 
          dayMealCost: 500 
        },
        { 
          day: "Day 2", 
          places: [
            { name: "Electronic City", cost: 0 }, 
            { name: "Bannerghatta Bio Park", cost: 400 }
          ], 
          dayMealCost: 600 
        },
      ],
    },
    {
      title: "The Green Circuit",
      category: "Nature",
      rating: 4.6,
      popular: false,
      image: img1,
      days: [
        { 
          day: "Day 1", 
          places: [
            { name: "Cubbon Park", cost: 0 }, 
            { name: "Lalbagh Botanical Garden", cost: 50 }, 
            { name: "Freedom Park", cost: 0 }
          ], 
          dayMealCost: 400 
        },
        { 
          day: "Day 2", 
          places: [
            { name: "Turahalli Forest", cost: 0 }, 
            { name: "Hesaraghatta Lake", cost: 0 }
          ], 
          dayMealCost: 500 
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
      "ISKCON Temple": { lat: 13.0098, lng: 77.5511 },
      "Bull Temple": { lat: 12.9424, lng: 77.5681 },
      "Someshwara Temple": { lat: 12.9711, lng: 77.6231 },
      "St. Mary's Basilica": { lat: 12.9841, lng: 77.6056 },
      "Jamia Masjid": { lat: 12.9621, lng: 77.5811 },
      "Gavi Gangadhareshwara Temple": { lat: 12.9411, lng: 77.5611 },
      "MG Road": { lat: 12.9756, lng: 77.6067 },
      "Church Street": { lat: 12.9751, lng: 77.6041 },
      "Brigade Road": { lat: 12.9731, lng: 77.6071 },
      "Indiranagar 100ft Road": { lat: 12.9711, lng: 77.6411 },
      "Koramangala 5th Block": { lat: 12.9341, lng: 77.6211 },
      "Visvesvaraya Museum": { lat: 12.9751, lng: 77.5961 },
      "HAL Aerospace Museum": { lat: 12.9541, lng: 77.6881 },
      "Jawaharlal Nehru Planetarium": { lat: 12.9841, lng: 77.5891 },
      "Electronic City": { lat: 12.8441, lng: 77.6611 },
      "Bannerghatta Bio Park": { lat: 12.7624, lng: 77.5751 },
      "Cubbon Park": { lat: 12.9763, lng: 77.5929 },
      "Lalbagh Botanical Garden": { lat: 12.9507, lng: 77.5848 },
      "Freedom Park": { lat: 12.9771, lng: 77.5811 },
      "Turahalli Forest": { lat: 12.8811, lng: 77.5211 },
      "Hesaraghatta Lake": { lat: 13.1411, lng: 77.4811 }
    };

    const formattedItinerary = {};
    let totalTripCost = 0;

    trip.days.forEach((dayObj, index) => {
      const dayKey = `Day ${index + 1}`;
      const dayPlaceCosts = dayObj.places.reduce((sum, p) => sum + p.cost, 0);
      const totalDayCost = dayPlaceCosts + dayObj.dayMealCost;
      totalTripCost += totalDayCost;

      formattedItinerary[dayKey] = {
        places: dayObj.places.map(p => ({
          name: p.name,
          lat: placeCoords[p.name]?.lat || 12.9716,
          lng: placeCoords[p.name]?.lng || 77.5946,
          estimatedCost: p.cost,
          timeHours: 2,
          category: trip.category,
          tags: [trip.category.toLowerCase()]
        })),
        estimatedCost: totalDayCost,
        estimatedHours: dayObj.places.length * 2,
        dayMealCost: dayObj.dayMealCost,
        color: ["#3b82f6","#10b981","#f59e0b","#ef4444"][index % 4]
      };
    });

    const planData = {
      city: "Bangalore",
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