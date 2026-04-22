import React, { useEffect, useState, useMemo, useContext, Fragment } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { AuthContext } from '../context/AuthContext';
import { auth } from '../firebase';
import { generatePlan } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import './planner.css';
import '../components/Planner/plannerForm.css';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "");

const MultiCityOverview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { formatPrice } = useSettings();
  
  // State recovery logic
  const initialData = useMemo(() => {
    if (location.state) {
      localStorage.setItem('lastMultiCityPlan', JSON.stringify(location.state));
      return location.state;
    }
    const saved = localStorage.getItem('lastMultiCityPlan');
    return saved ? JSON.parse(saved) : null;
  }, [location.state]);

  const { tripStructure: initialStructure = [], totalDays = 0, totalBudget = 0 } = initialData || {};

  const [tripStructure, setTripStructure] = useState(initialStructure);
  const [generating, setGenerating] = useState(initialStructure.length > 0);
  const [genProgress, setGenProgress] = useState(0);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaveMultiCity = async () => {
    if (saving || saved || !tripStructure.length) return;
    setSaving(true);
    try {
      let token = await auth.currentUser?.getIdToken(true);
      if (!token && user?.token) token = user.token;

      const res = await fetch(`${API}/api/profile/trips`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: `Multi-City Odyssey: ${tripStructure.map(s => s.city).join(' → ')}`,
          city: tripStructure[0].city,
          days: totalDays,
          itinerary: tripStructure.map(s => ({ 
            day: s.city, 
            label: s.city,
            places: s.plan?.itinerary?.flatMap(d => d.places) || [] 
          })),
          totalTripCost: totalBudget, // Or calculated
          totalBudget: totalBudget,
          isMultiCity: true,
          summary: `A synchronized journey across ${tripStructure.length} cities.`
        })
      });
      if (res.ok) setSaved(true);
    } catch (err) {
      console.error("Failed to save multi-city journey", err);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (initialStructure.length === 0) {
      setGenerating(false);
      return;
    }

    // Check if we already have plans (from recovery)
    if (initialStructure.every(item => item.plan)) {
      setGenerating(false);
      return;
    }

    const generateAllPlans = async () => {
      setGenerating(true);
      setGenProgress(0);
      
      let completedCount = 0;
      const updateProgress = () => {
        completedCount++;
        setGenProgress((completedCount / initialStructure.length) * 100);
      };

      try {
        const updatedStructure = await Promise.all(
          initialStructure.map(async (item) => {
            if (item.plan) {
              updateProgress();
              return item;
            }
            try {
              const plan = await generatePlan({
                city: item.city,
                days: item.days,
                budget: item.budget,
                interests: item.interests,
                travelerType: "solo",
                pace: "moderate"
              });
              updateProgress();
              return { ...item, plan };
            } catch (err) {
              console.error(`Failed to generate plan for ${item.city}`, err);
              updateProgress();
              return { ...item, error: "Plan generation failed" };
            }
          })
        );
        
        setTripStructure(updatedStructure);
        localStorage.setItem('lastMultiCityPlan', JSON.stringify({
          tripStructure: updatedStructure,
          totalDays,
          totalBudget
        }));
      } catch (err) {
        setError("Something went wrong while generating your multi-city odyssey.");
      } finally {
        setGenerating(false);
      }
    };

    generateAllPlans();
  }, [initialStructure, totalDays, totalBudget]);

  if (!initialData) {
    return (
      <div className="planner-container" style={{ paddingTop: '150px', textAlign: 'center' }}>
        <h2 className="planner-title">No journey in progress</h2>
        <p className="planner-subtitle">Initialize a new multi-city synchronization to begin.</p>
        <button onClick={() => navigate('/multi-city')} className="pf-primary-btn" style={{ marginTop: '30px', maxWidth: '300px', margin: '30px auto' }}>
          Start Multi-City Planner
        </button>
      </div>
    );
  }

  const handleViewCityPlan = (item, idx) => {
    if (!item.plan) {
      alert("This node plan is not yet synchronized.");
      return;
    }
    navigate(`/results`, { 
      state: { 
        plan: item.plan, 
        isNew: true,
        multiCityContext: {
          currentIndex: idx,
          tripStructure: tripStructure,
          totalDays,
          totalBudget
        }
      } 
    });
  };

  if (generating) {
    return (
      <div className="planner-container" style={{ 
        paddingTop: '150px', 
        textAlign: 'center', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        background: 'var(--bg-main)'
      }}>
        <div className="tt-bg-ambient">
          <div className="tt-blob tt-blob-1" style={{ background: 'var(--accent-blue)', top: '20%', left: '20%' }}></div>
          <div className="tt-blob tt-blob-2" style={{ background: 'var(--accent-purple)', bottom: '20%', right: '20%' }}></div>
        </div>
        
        <div className="ai-neural-container" style={{ marginBottom: '40px' }}>
          <div className="ai-neural-core">
            <div className="neural-orbit orbit-1"></div>
            <div className="neural-orbit orbit-2"></div>
            <div className="neural-center-glow"></div>
            <div className="neural-brain-icon">⛓️</div>
          </div>
        </div>

        <h2 className="planner-title" style={{ fontSize: '32px' }}>Synchronizing <span>Nodes</span></h2>
        <p className="planner-subtitle" style={{ maxWidth: '500px', margin: '15px auto 40px' }}>
          Interconnecting geographical markers and temporal vectors for your multi-city odyssey.
        </p>

        <div style={{ width: '300px', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden', position: 'relative' }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${genProgress}%` }}
            style={{ height: '100%', background: 'var(--accent-blue)', boxShadow: '0 0 15px var(--accent-blue)' }}
          />
        </div>
        <span style={{ marginTop: '15px', fontSize: '12px', fontWeight: '800', color: 'rgba(255,255,255,0.3)', letterSpacing: '2px' }}>
          {Math.round(genProgress)}% SYNC COMPLETE
        </span>
      </div>
    );
  }

  return (
    <div className="tt-premium-root" style={{ alignItems: 'flex-start', paddingTop: '100px', overflowY: 'auto', minHeight: '100vh' }}>
      <div className="tt-bg-ambient">
        <div className="tt-blob tt-blob-1" style={{ background: '#3b82f6', opacity: 0.1 }}></div>
        <div className="tt-grid-overlay"></div>
      </div>

      <div className="planner-container" style={{ maxWidth: '1100px', margin: '0 auto', zIndex: 2, position: 'relative' }}>
        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
            <div className="tt-badge-ai">SYNC OVERVIEW</div>
            {user && !generating && (
              <button 
                onClick={handleSaveMultiCity}
                disabled={saving || saved}
                style={{
                  background: saved ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                  color: saved ? '#10b981' : 'var(--accent-blue)',
                  border: `1px solid ${saved ? '#10b981' : 'var(--accent-blue)'}`,
                  padding: '4px 15px',
                  borderRadius: '100px',
                  fontSize: '10px',
                  fontWeight: '900',
                  cursor: 'pointer',
                  letterSpacing: '1px'
                }}
              >
                {saving ? "SAVING..." : saved ? "PATH SYNCED ✓" : "SAVE SYNC PATH"}
              </button>
            )}
          </div>
          <h1 className="tt-main-title" style={{ fontSize: '48px', marginBottom: '10px' }}>
            The <span>Odyssey</span> Path
          </h1>
          <p className="tt-subtitle">
            {totalDays} Days • {formatPrice(totalBudget)} Total Resource Allocation
          </p>
          
          <div className="route-viz-premium" style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            marginTop: '40px',
            gap: '12px',
            flexWrap: 'wrap',
            padding: '20px',
            background: 'var(--bg-card)',
            borderRadius: '24px',
            border: '1px solid var(--border-main)'
          }}>
            {tripStructure.map((item, idx) => (
              <Fragment key={idx}>
                <div style={{ 
                  background: 'rgba(59, 130, 246, 0.1)', 
                  color: 'var(--accent-blue)', 
                  padding: '10px 24px', 
                  borderRadius: '16px',
                  fontWeight: '800',
                  fontSize: '13px',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  letterSpacing: '0.5px'
                }}>
                  {item.city.toUpperCase()}
                </div>
                {idx < tripStructure.length - 1 && (
                  <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '20px' }}>→</span>
                )}
              </Fragment>
            ))}
          </div>
        </header>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
          gap: '30px',
          marginBottom: '60px'
        }}>
          {tripStructure.map((item, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="pf-glass-card" 
              style={{ 
                background: 'var(--bg-card)', 
                border: '1px solid var(--border-main)',
                borderRadius: '32px',
                padding: '35px',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ 
                position: 'absolute', 
                top: '-20px', 
                right: '-20px', 
                fontSize: '100px', 
                fontWeight: '900', 
                color: 'rgba(255,255,255,0.03)',
                zIndex: 0,
                pointerEvents: 'none'
              }}>
                {idx + 1}
              </div>

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ marginBottom: '25px' }}>
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: '900', 
                    color: 'var(--accent-blue)', 
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    display: 'block',
                    marginBottom: '8px'
                  }}>
                    NODE 0{idx + 1}
                  </span>
                  <h2 style={{ fontSize: '32px', fontWeight: '900', margin: 0, letterSpacing: '-0.5px' }}>{item.city}</h2>
                </div>

                <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px 18px', borderRadius: '16px', flex: 1, border: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ display: 'block', fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontWeight: '900', letterSpacing: '1px', marginBottom: '4px' }}>TEMPORAL</span>
                    <span style={{ fontWeight: '800', fontSize: '15px' }}>{item.days} Days</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px 18px', borderRadius: '16px', flex: 1, border: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ display: 'block', fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontWeight: '900', letterSpacing: '1px', marginBottom: '4px' }}>RESOURCES</span>
                    <span style={{ fontWeight: '800', fontSize: '15px' }}>{formatPrice(item.budget)}</span>
                  </div>
                </div>

                <div style={{ flex: 1, marginBottom: '35px' }}>
                  {item.plan && item.plan.itinerary ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {(() => {
                        const normItin = Array.isArray(item.plan.itinerary) 
                          ? item.plan.itinerary 
                          : Object.entries(item.plan.itinerary).map(([day, data]) => ({ day, ...data }));
                        
                        return normItin.slice(0, 3).map((dayData, dIdx) => (
                          <div key={dIdx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <span style={{ 
                              fontSize: '10px', 
                              fontWeight: '900', 
                              color: 'rgba(255,255,255,0.4)', 
                              minWidth: '35px',
                              padding: '4px 0',
                              textAlign: 'left'
                            }}>
                              DAY {dayData.day || dIdx + 1}
                            </span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {(dayData.places || []).slice(0, 2).map((place, pIdx) => (
                                <span key={pIdx} style={{ 
                                  fontSize: '11px', 
                                  fontWeight: '700',
                                  color: 'rgba(255,255,255,0.8)',
                                  background: 'rgba(255,255,255,0.05)',
                                  padding: '4px 10px',
                                  borderRadius: '10px'
                                }}>
                                  {place.name}
                                </span>
                              ))}
                              {(dayData.places || []).length > 2 && (
                                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', alignSelf: 'center', fontWeight: '800' }}>
                                  +{dayData.places.length - 2} MORE
                                </span>
                              )}
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  ) : item.error ? (
                    <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                      <p style={{ fontSize: '12px', color: '#ef4444', fontWeight: '700', margin: 0 }}>⚠️ NODE SYNC FAILED</p>
                      <p style={{ fontSize: '11px', color: 'rgba(239, 68, 68, 0.6)', margin: '5px 0 0' }}>The AI engine could not establish a stable itinerary for this location.</p>
                    </div>
                  ) : (
                    <div className="res-spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                  )}
                </div>

                <button 
                  onClick={() => handleViewCityPlan(item, idx)}
                  className="pf-primary-btn"
                  style={{ 
                    width: '100%', 
                    padding: '16px', 
                    borderRadius: '18px', 
                    background: item.plan ? 'var(--accent-blue)' : 'rgba(255,255,255,0.05)',
                    color: item.plan ? 'white' : 'rgba(255,255,255,0.2)',
                    fontSize: '13px',
                    fontWeight: '900',
                    letterSpacing: '1px'
                  }}
                  disabled={!item.plan}
                >
                  INITIALIZE DETAILED NODE
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <div style={{ textAlign: 'center', paddingBottom: '100px' }}>
          <button onClick={() => navigate('/multi-city')} className="pf-secondary-btn" style={{ width: 'auto', padding: '15px 40px', borderRadius: '18px', fontSize: '13px', fontWeight: '800' }}>
            MODIFY SYNC PATH
          </button>
        </div>
      </div>
    </div>
  );
};

export default MultiCityOverview;
