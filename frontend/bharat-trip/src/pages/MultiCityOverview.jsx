import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { generatePlan } from '../services/api';
import './planner.css';
import '../components/Planner/plannerForm.css';

const MultiCityOverview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { formatPrice } = useSettings();
  const { tripStructure: initialStructure, totalDays, totalBudget } = location.state || { tripStructure: [], totalDays: 0, totalBudget: 0 };

  const [tripStructure, setTripStructure] = useState(initialStructure);
  const [generating, setGenerating] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialStructure.length === 0) {
      setGenerating(false);
      return;
    }

    const generateAllPlans = async () => {
      setGenerating(true);
      try {
        const updatedStructure = await Promise.all(
          initialStructure.map(async (item) => {
            try {
              const plan = await generatePlan({
                city: item.city,
                days: item.days,
                budget: item.budget,
                interests: item.interests,
                travelerType: "solo", // Default
                pace: "moderate"      // Default
              });
              return { ...item, plan };
            } catch (err) {
              console.error(`Failed to generate plan for ${item.city}`, err);
              return { ...item, error: "Plan generation failed" };
            }
          })
        );
        setTripStructure(updatedStructure);
      } catch (err) {
        setError("Something went wrong while generating your multi-city odyssey.");
      } finally {
        setGenerating(false);
      }
    };

    generateAllPlans();
  }, [initialStructure]);

  if (initialStructure.length === 0) {
    return (
      <div className="planner-container" style={{ paddingTop: '100px', textAlign: 'center' }}>
        <h2>No trip data found</h2>
        <button onClick={() => navigate('/multi-city')} className="pf-primary-btn" style={{ marginTop: '20px' }}>
          Back to Multi-City Planner
        </button>
      </div>
    );
  }

  const handleViewCityPlan = (item, idx) => {
    if (!item.plan) {
      alert("Plan not ready yet or failed to generate.");
      return;
    }
    // Pass full multi-city context to the results page
    navigate(`/results`, { 
      state: { 
        plan: item.plan, 
        isNew: true,
        multiCityContext: {
          currentIndex: idx,
          tripStructure: tripStructure
        }
      } 
    });
  };

  if (generating) {
    return (
      <div className="planner-container" style={{ paddingTop: '150px', textAlign: 'center' }}>
        <div className="res-spinner" style={{ margin: '0 auto 20px' }}></div>
        <h2 className="planner-title">Crafting your multi-city odyssey...</h2>
        <p className="planner-subtitle">Generating tailored itineraries for each destination.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="planner-container" style={{ paddingTop: '150px', textAlign: 'center' }}>
        <h2 className="planner-title" style={{ color: '#ff4d4d' }}>{error}</h2>
        <button onClick={() => window.location.reload()} className="pf-primary-btn" style={{ marginTop: '20px' }}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="planner-container" style={{ paddingTop: '80px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 className="planner-title">Trip Overview</h1>
        <p className="planner-subtitle">
          {totalDays} Days • {formatPrice(totalBudget)} Total Budget
        </p>
        
        {/* Route visualization */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          marginTop: '30px',
          gap: '15px',
          flexWrap: 'wrap'
        }}>
          {tripStructure.map((item, idx) => (
            <React.Fragment key={idx}>
              <div style={{ 
                background: 'var(--accent-blue)', 
                color: 'white', 
                padding: '8px 20px', 
                borderRadius: '20px',
                fontWeight: '700',
                fontSize: '14px'
              }}>
                {item.city}
              </div>
              {idx < tripStructure.length - 1 && (
                <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: '900' }}>→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '25px',
        marginBottom: '50px'
      }}>
        {tripStructure.map((item, idx) => (
          <div key={idx} className="pf-glass-card" style={{ 
            background: 'rgba(255,255,255,0.03)', 
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '24px',
            padding: '30px',
            transition: 'transform 0.3s ease',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <span style={{ 
                fontSize: '12px', 
                fontWeight: '800', 
                color: 'var(--accent-blue)', 
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Stop {idx + 1}
              </span>
              <h2 style={{ fontSize: '28px', fontWeight: '900', margin: '5px 0' }}>{item.city}</h2>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 15px', borderRadius: '12px', flex: 1 }}>
                <span style={{ display: 'block', fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: '800' }}>DURATION</span>
                <span style={{ fontWeight: '700' }}>{item.days} Days</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 15px', borderRadius: '12px', flex: 1 }}>
                <span style={{ display: 'block', fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: '800' }}>BUDGET</span>
                <span style={{ fontWeight: '700' }}>{formatPrice(item.budget)}</span>
              </div>
            </div>

            <div style={{ flex: 1, marginBottom: '25px' }}>
              {item.plan && item.plan.itinerary ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {Object.entries(item.plan.itinerary).map(([dayKey, dayData], dIdx) => (
                    <div key={dIdx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <span style={{ 
                        fontSize: '11px', 
                        fontWeight: '800', 
                        color: 'var(--accent-blue)', 
                        minWidth: '40px',
                        background: 'rgba(59, 130, 246, 0.1)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        textAlign: 'center'
                      }}>
                        {dayKey.replace('Day ', 'D')}
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {dayData.places.slice(0, 3).map((place, pIdx) => (
                          <span key={pIdx} style={{ 
                            fontSize: '12px', 
                            color: 'rgba(255,255,255,0.7)',
                            background: 'rgba(255,255,255,0.05)',
                            padding: '2px 8px',
                            borderRadius: '10px'
                          }}>
                            📍 {place.name}
                          </span>
                        ))}
                        {dayData.places.length > 3 && (
                          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', padding: '2px 4px' }}>
                            +{dayData.places.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6', margin: 0 }}>
                  Explore the unique charm of {item.city}. From its local culture to hidden gems, 
                  this stop is tailored to match your interest in {item.interests.slice(0, 2).join(' & ')}.
                </p>
              )}
            </div>

            <button 
              onClick={() => handleViewCityPlan(item, idx)}
              className="pf-primary-btn"
              style={{ width: '100%', padding: '12px' }}
            >
              View Detailed Plan
            </button>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', paddingBottom: '100px' }}>
        <button onClick={() => navigate('/multi-city')} className="pf-secondary-btn">
          Modify Route
        </button>
      </div>
    </div>
  );
};

export default MultiCityOverview;
