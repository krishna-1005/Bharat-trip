import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PlannerForm from "../components/Planner/PlannerForm";
import "./home.css"; // Reuse home styles for consistency

const destinationData = {
  Goa: {
    tagline: "The Pearl of the Orient",
    desc: "From sun-kissed beaches to vibrant nightlife and Portuguese heritage, Goa offers a perfect blend of relaxation and adventure.",
    heroImg: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?auto=format&fit=crop&w=600&q=80"
    ],
    spots: ["Baga Beach", "Old Goa Churches", "Dudhsagar Falls"]
  },
  Manali: {
    tagline: "Valley of the Gods",
    desc: "Nestled in the mountains of Himachal Pradesh, Manali is a backpacker's paradise and a gateway to adventure in the Himalayas.",
    heroImg: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1593181629936-11c609b8db9b?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1605649440419-44fbcad55ca8?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1586375300773-8384e3e4916f?auto=format&fit=crop&w=600&q=80"
    ],
    spots: ["Solang Valley", "Hadimba Temple", "Rohtang Pass"]
  },
  Kerala: {
    tagline: "God's Own Country",
    desc: "Experience the tranquil backwaters, lush tea plantations, and serene beaches of India's most beautiful coastal state.",
    heroImg: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1593179241557-bce1eb92e47e?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80"
    ],
    spots: ["Alleppey Backwaters", "Munnar Tea Gardens", "Varkala Beach"]
  },
  Jaipur: {
    tagline: "The Pink City",
    desc: "A royal destination filled with magnificent forts, opulent palaces, and a rich history that paints every street pink.",
    heroImg: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1524230572899-a752b3835840?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80"
    ],
    spots: ["Amer Fort", "Hawa Mahal", "City Palace"]
  },
  Ladakh: {
    tagline: "The Land of High Passes",
    desc: "A mesmerizing desert mountain landscape with crystal clear lakes, ancient monasteries, and gravity-defying roads.",
    heroImg: "https://images.unsplash.com/photo-1581791534721-e599df4417f7?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1544102826-3cebc8143589?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80"
    ],
    spots: ["Pangong Lake", "Nubra Valley", "Shanti Stupa"]
  },
  Rishikesh: {
    tagline: "Yoga Capital of the World",
    desc: "A spiritual sanctuary by the Ganges, offering a unique mix of meditation, yoga, and adrenaline-pumping river rafting.",
    heroImg: "https://images.unsplash.com/photo-1598970605070-a38a6ccd3a2d?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1545105511-923f63f29e07?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80"
    ],
    spots: ["Laxman Jhula", "Triveni Ghat", "Beatles Ashram"]
  },
  Varanasi: {
    tagline: "The Spiritual Capital of India",
    desc: "One of the world's oldest living cities, where the Ganges flows with spiritual energy, ancient rituals, and timeless traditions.",
    heroImg: "https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?auto=format&fit=crop&w=600&q=80"
    ],
    spots: ["Dashashwamedh Ghat", "Kashi Vishwanath Temple", "Sarnath"]
  },
  Udaipur: {
    tagline: "The Venice of the East",
    desc: "A city of shimmering lakes, magnificent palaces, and romantic sunsets set against the backdrop of the Aravalli Hills.",
    heroImg: "https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?auto=format&fit=crop&w=600&q=80"
    ],
    spots: ["City Palace", "Lake Pichola", "Jag Mandir"]
  },
  Agra: {
    tagline: "City of Eternal Love",
    desc: "Home to the world-renowned Taj Mahal, Agra is a treasure trove of Mughal architecture and historical splendor.",
    heroImg: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1524492707941-5f397224bc0b?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80"
    ],
    spots: ["Taj Mahal", "Agra Fort", "Fatehpur Sikri"]
  }
};

export default function DestinationDetails() {
  const { city } = useParams();
  const navigate = useNavigate();
  const data = destinationData[city] || destinationData["Goa"];

  const handlePlanGenerated = (generatedPlan) => {
    navigate("/results", { state: { plan: generatedPlan } });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [city]);

  return (
    <div className="home-redesign">
      {/* City Hero */}
      <section className="hero-section container" style={{ minHeight: '60vh', paddingTop: '100px' }}>
        <div className="hero-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="hero-content">
            <span className="section-label" style={{ color: 'var(--accent-blue)', fontWeight: 800 }}>EXPLORE {city?.toUpperCase()}</span>
            <h1 style={{ fontSize: '4rem', marginBottom: '20px' }}>{data.tagline}</h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-dim)', marginBottom: '30px' }}>{data.desc}</p>
            <div style={{ display: 'flex', gap: '15px' }}>
               {data.spots.map(spot => (
                 <span key={spot} style={{ padding: '8px 16px', background: 'var(--bg-card)', borderRadius: '100px', fontSize: '0.9rem', border: '1px solid var(--border-main)' }}>
                   {spot}
                 </span>
               ))}
            </div>
          </div>
          <div className="hero-preview-container" style={{ height: '400px' }}>
             <img src={data.heroImg} alt={city} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '32px', border: '1px solid var(--border-main)' }} />
          </div>
        </div>
      </section>

      {/* Planning Section */}
      <section style={{ padding: '80px 0', background: 'rgba(59, 130, 246, 0.02)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'start' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '24px' }}>Plan your {city} trip now</h2>
            <p style={{ color: 'var(--text-dim)', marginBottom: '40px', fontSize: '1.1rem' }}>
              Use our AI-powered planner specifically tuned for {city}. We'll help you find the best 
              routes, hidden gems, and optimal timings for your journey.
            </p>
            <div className="dest-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              {data.images.slice(0, 2).map((img, i) => (
                <div key={i} style={{ borderRadius: '20px', overflow: 'hidden', height: '200px' }}>
                  <img src={img} alt={`${city}-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
          
          <div className="feature-card" style={{ padding: '40px', background: 'var(--bg-dark)', border: '1px solid var(--accent-blue)' }}>
            <h3 style={{ marginBottom: '30px', textAlign: 'center' }}>Custom Itinerary for {city}</h3>
            <PlannerForm onPlanGenerated={handlePlanGenerated} />
          </div>
        </div>
      </section>

      {/* Extra Gallery */}
      <section className="container" style={{ padding: '100px 0' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '60px' }}>More from God's Own {city}</h2>
        <div className="dest-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
           {data.images.map((img, i) => (
             <div key={i} className="dest-card" style={{ height: '300px' }}>
               <img src={img} alt={city} />
             </div>
           ))}
        </div>
      </section>
    </div>
  );
}
