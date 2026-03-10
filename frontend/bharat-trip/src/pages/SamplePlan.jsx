import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./results.css";


import img2 from "../assets/images/img2.webp";
import img5 from "../assets/images/img5.webp";
import img1 from "../assets/images/img1.webp";




export default function SamplePlan() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All Plans");
  const [modalTrip, setModalTrip] = useState(null); // holds the trip object to show in popup

  const sampleTrips = [
    {
      title: "2 Day Bangalore Nature Trip",
      category: "Nature",
      rating: 4.8,
      popular: true,
      image: img2,
      days: [
        { day: "Day 1", places: ["Cubbon Park", "Bangalore Palace", "MG Road"], cost: 400 },
        { day: "Day 2", places: ["Lalbagh Botanical Garden", "Bannerghatta Zoo"], cost: 350 },
      ],
      total: 750,
    },
    {
      title: "Weekend Heritage Trip",
      category: "Heritage",
      rating: 4.7,
      popular: false,
      image: img5,
      days: [
        { day: "Day 1", places: ["Tipu Sultan Palace", "KR Market", "VV Puram Food Street"], cost: 300 },
        { day: "Day 2", places: ["Nandi Hills Sunrise", "Bhoga Nandeeshwara Temple"], cost: 450 },
      ],
      total: 750,
    },
    {
      title: "Low Budget Student Trip",
      category: "Budget",
      rating: 4.5,
      popular: false,
      image: img1,
      days: [
        { day: "Day 1", places: ["Cubbon Park", "Church Street", "UB City"], cost: 200 },
        { day: "Day 2", places: ["Lalbagh Garden", "ISKCON Temple"], cost: 200 },
      ],
      total: 400,
    },
  ];

  const FILTERS = ["All Plans", "Nature", "Heritage", "Budget", "Adventure", "More"];

  const filtered =
    activeFilter === "All Plans"
      ? sampleTrips
      : sampleTrips.filter((t) => t.category === activeFilter);

  return (
    <div className="sp-page">

      {/* ── HERO HEADER ── */}
      <div className="sp-hero">
        <span className="sp-badge">✦ NEW ITINERARIES ADDED</span>
        <h1>
          Explore Sample{" "}
          <span className="sp-highlight">Travel<br />Plans</span>
        </h1>
        <p>
          Expertly curated itineraries for every kind of explorer.<br />
          Find your next adventure across India.
        </p>
      </div>

      {/* ── FILTER TABS ── */}
      <div className="sp-filters">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`sp-filter-btn ${activeFilter === f ? "sp-filter-active" : ""}`}
            onClick={() => setActiveFilter(f)}
          >
            {f === "All Plans" && <span className="sp-fi">∞</span>}
            {f === "Nature"    && <span className="sp-fi">▲</span>}
            {f === "Heritage"  && <span className="sp-fi">⬡</span>}
            {f === "Budget"    && <span className="sp-fi">💰</span>}
            {f === "Adventure" && <span className="sp-fi">⚑</span>}
            {f === "More"      && <span className="sp-fi">≡</span>}
            {f}
          </button>
        ))}
      </div>

      {/* ── CARDS GRID ── */}
      <div className="sp-grid">
        {filtered.map((trip, index) => (
          <div className="sp-card" key={index}>

            {/* Image */}
            <div className="sp-card-img-wrap">
              <img src={trip.image} alt={trip.title} />
              <span className="sp-rating">★ {trip.rating}</span>
              {trip.popular && <span className="sp-popular-badge">POPULAR</span>}
            </div>

            {/* Body */}
            <div className="sp-card-body">
              <h3>{trip.title}</h3>

              {/* Day breakdown */}
              <div className="sp-days">
                {trip.days.map((d, i) => (
                  <div className="sp-day-row" key={i}>
                    <div className="sp-day-label">{d.day}</div>
                    <div className="sp-day-places">
                      {d.places.map((place, p) => (
                        <span className="sp-place-tag" key={p}>📍 {place}</span>
                      ))}
                    </div>
                    <div className="sp-day-cost">₹{d.cost}</div>
                  </div>
                ))}
              </div>

              {/* Meta row */}
              <div className="sp-card-meta">
                <span className="sp-meta-item">🕐 {trip.days.length} Days</span>
                <span className="sp-total-price">✨ ₹{trip.total}</span>
              </div>

              {/* Buttons */}
              <div className="sp-card-actions">
                <button
                  className="sp-view-btn"
                  onClick={() => setModalTrip(trip)}
                >
                  View Details
                </button>
                <button className="sp-map-btn" onClick={() => navigate("/planner")}>
                  View On Map
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── CTA BANNER ── */}
      <div className="sp-cta-banner">
        <h2>Don't see your dream trip?</h2>
        <p>Create a fully personalized itinerary in seconds using our AI travel planner.</p>
        <button className="sp-cta-btn" onClick={() => navigate("/planner")}>
          Plan Your Custom Trip
        </button>
      </div>

      {/* ── MODAL POPUP ── */}
      {modalTrip && (
        <div className="sp-modal-overlay" onClick={() => setModalTrip(null)}>
          <div className="sp-modal" onClick={(e) => e.stopPropagation()}>

            {/* Close button */}
            <button className="sp-modal-close" onClick={() => setModalTrip(null)}>✕</button>

            {/* Modal image */}
            <div className="sp-modal-img-wrap">
              <img src={modalTrip.image} alt={modalTrip.title} />
              <div className="sp-modal-img-overlay"></div>
              <div className="sp-modal-img-info">
                <span className="sp-modal-rating">★ {modalTrip.rating}</span>
                {modalTrip.popular && <span className="sp-modal-popular">POPULAR</span>}
              </div>
            </div>

            {/* Modal content */}
            <div className="sp-modal-body">
              <h2>{modalTrip.title}</h2>
              <p className="sp-modal-subtitle">
                🕐 {modalTrip.days.length} Days &nbsp;·&nbsp; ✨ Total: ₹{modalTrip.total}
              </p>

              <div className="sp-modal-days">
                {modalTrip.days.map((d, i) => (
                  <div className="sp-modal-day" key={i}>
                    <div className="sp-modal-day-header">
                      <span className="sp-modal-day-label">{d.day}</span>
                      <span className="sp-modal-day-cost">₹{d.cost}</span>
                    </div>
                    <div className="sp-modal-places">
                      {d.places.map((place, p) => (
                        <div className="sp-modal-place" key={p}>
                          <span className="sp-modal-place-dot">📍</span>
                          <span>{place}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="sp-modal-total">
                ✨ Total Trip Cost: ₹{modalTrip.total}
              </div>

              <div className="sp-modal-actions">
                <button className="sp-map-btn" onClick={() => { setModalTrip(null); navigate("/planner"); }}>
                  Plan This Trip →
                </button>
                <button className="sp-view-btn" onClick={() => setModalTrip(null)}>
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}