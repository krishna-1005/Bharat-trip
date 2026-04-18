import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { createOrGetTripRoom, addUserToRoom, addActivity, listenToRoom, updateRoomStatus, finalizeBlueprint } from "../services/tripRoomService";
import CostPlanner from "../components/CostPlanner";
import TripConfirmation from "../components/TripConfirmation";
import TripChat from "../components/TripChat";
import TripTimeline from "../components/TripTimeline";
import TripBlueprint from "../components/TripBlueprint";
import "./poll.css";

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "");

export default function PollResults() {
  const { pollId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth(); // Access loading state
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roomId, setRoomId] = useState(null);
  const [joinCode, setJoinCode] = useState("");
  const [room, setRoom] = useState(null);
  const [finalizing, setFinalizing] = useState(false);

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const res = await fetch(`${API}/api/polls/${pollId}`);
        const data = await res.json();
        if (res.ok) {
          setPoll(data);
        }
      } catch (err) {
        console.error("DEBUG: Failed to fetch poll:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPoll();
    
    const interval = setInterval(fetchPoll, 5000);
    return () => clearInterval(interval);
  }, [pollId]);

  // Real-time Room Listener
  useEffect(() => {
    if (!roomId) return;
    const unsubscribe = listenToRoom(roomId, (data) => {
      setRoom(data);
    });
    return () => unsubscribe();
  }, [roomId]);

  // Sync Poll Closure with Room Status
  useEffect(() => {
    if (poll?.isClosed && roomId && room && room.status === 'polling') {
      updateRoomStatus(roomId, 'planning');
    }
  }, [poll?.isClosed, roomId, room]);

  // Separate effect for Room Initialization to handle timing
  useEffect(() => {
    const initRoom = async () => {
      // GUARD: Only proceed if auth is done, user exists, and poll data is ready
      if (authLoading) {
        console.log("DEBUG: Auth still loading... waiting.");
        return;
      }

      if (!user) {
        console.log("DEBUG: Auth complete but no user found. Skipping room init.");
        return;
      }

      if (!poll) {
        console.log("DEBUG: User ready but poll data still fetching... waiting.");
        return;
      }

      console.log("DEBUG: All conditions met. Calling createOrGetTripRoom for user:", user.uid);
      try {
        const roomObj = await createOrGetTripRoom(poll.pollId, poll.tripName, user);
        if (roomObj) {
          setRoomId(roomObj.id);
          setJoinCode(roomObj.joinCode);
          
          // Add user to members and log 'join' activity
          await addUserToRoom(roomObj.id, user);
          await addActivity(roomObj.id, 'join', `${user.name || 'A traveler'} joined the trip room`, user);
        }
      } catch (err) {
        console.error("DEBUG: Room initialization failed:", err);
      }
    };

    initRoom();
  }, [user, authLoading, poll]);

  const handleFinalizeNow = async () => {
    if (!poll || finalizing) return;
    if (!window.confirm("Finalize this poll now based on current top votes?")) return;

    setFinalizing(true);
    try {
      const res = await fetch(`${API}/api/polls/finalize-now`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollId: poll.pollId }),
      });
      const data = await res.json();
      if (res.ok) {
        setPoll(data.poll);
        alert("Poll finalized successfully! ✨");
      } else {
        alert(data.error || "Failed to finalize.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFinalizing(false);
    }
  };

  const handleGenerateBlueprint = async () => {
    if (!roomId || !winner) return;
    
    // In a real app, we might fetch the detailed itinerary from the planner state or API
    // For this blueprint, we'll use the winner and basic poll data.
    const blueprintData = {
      destination: winner.name,
      budget: winner.estimatedCost || 15000, // Fallback if not set
      itinerary: [
        { title: "Arrival & Sightseeing", description: `Welcome to ${winner.name}. Check-in and explore local markets.` },
        { title: "Main Landmarks", description: `Visit the top-rated spots in ${winner.name} as voted by the group.` },
        { title: "Leisure & Departure", description: "Final souvenirs and travel back home." }
      ]
    };

    if (window.confirm(`Generate Final Trip Blueprint for ${winner.name}? This will lock the plan.`)) {
      await finalizeBlueprint(roomId, blueprintData);
      await addActivity(roomId, 'blueprint', `Trip Blueprint for ${winner.name} has been generated! 📄`, user);
    }
  };

  if (loading) return <div className="poll-page-container"><h2>Loading Dashboards...</h2></div>;
  
  if (!poll) return (
    <div className="poll-page-container">
        <div className="poll-dashboard-wrapper">
            <div className="empty-dashboard">
                <h2>Poll not found.</h2>
                <button className="btn-premium primary" onClick={() => navigate("/create-poll")}>Create New Poll</button>
            </div>
        </div>
    </div>
  );

  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
  const sortedOptions = [...poll.options].sort((a, b) => b.votes - a.votes);
  const winner = totalVotes > 0 ? sortedOptions[0] : null;
  const winnerPercentage = totalVotes > 0 ? Math.round((winner.votes / totalVotes) * 100) : 0;

  if (totalVotes === 0) {
    return (
        <div className="poll-page-container">
            <div className="poll-dashboard-wrapper">
                <header className="dashboard-header">
                    <h1 className="dashboard-title">{poll.tripName}</h1>
                    <p className="dashboard-subtitle">Results will appear here once voting begins</p>
                </header>
                <div className="empty-dashboard">
                    <h2>Be the first to vote!</h2>
                    <p style={{ color: '#9CA3AF', marginBottom: '32px' }}>This poll is currently empty. Share the link with your group to start deciding.</p>
                    <button className="btn-premium primary" onClick={() => navigate(`/vote/${pollId}`)}>Go to Voting Page ➔</button>
                </div>
            </div>
        </div>
    );
  }

  const isCreator = user && poll.createdBy === user.uid;
  const isFinalized = poll.isClosed;

  return (
    <div className="poll-page-container">
      <div className="poll-dashboard-wrapper">
        
        {/* --- STEP 1: HEADER SECTION --- */}
        <header className="dashboard-header" style={{ position: 'relative' }}>
            <h1 className="dashboard-title">{poll.tripName}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
                <p className="dashboard-subtitle">Group Decision Dashboard</p>
                <span style={{ width: '4px', height: '4px', background: '#4B5563', borderRadius: '50%' }}></span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <p className="dashboard-subtitle" style={{ color: totalVotes >= poll.totalMembers ? '#10b981' : 'var(--dash-primary)', fontWeight: '800' }}>
                        {totalVotes} / {poll.totalMembers || 1} members voted
                    </p>
                    {totalVotes < poll.totalMembers && !isFinalized && (
                        <span className="live-dot" style={{ width: '6px', height: '6px' }}></span>
                    )}
                </div>
            </div>

            {!isFinalized && isCreator && (totalVotes >= 2 || (poll.totalMembers === 1 && totalVotes >= 1)) && (
                <button 
                    className="btn-premium outline" 
                    style={{ position: 'absolute', right: 0, top: 0, padding: '8px 16px', fontSize: '12px' }}
                    onClick={handleFinalizeNow}
                    disabled={finalizing}
                >
                    {finalizing ? "Finalizing..." : "Finalize Now 🏁"}
                </button>
            )}
        </header>

        {/* --- TRIP TIMELINE SECTION --- */}
        <TripTimeline 
            status={room?.status || 'polling'} 
            totalMembers={poll.totalMembers} 
            totalVotes={totalVotes} 
        />

        {!isFinalized && totalVotes < poll.totalMembers && (
            <div style={{ textAlign: 'center', marginBottom: '20px', fontSize: '14px', color: 'var(--dash-muted)' }}>
                ✨ Waiting for {poll.totalMembers - totalVotes} more member(s) to vote...
            </div>
        )}

        {/* --- STEP 2: WINNER HIGHLIGHT CARD --- */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="winner-highlight-card"
        >
            <div className="winner-info">
                <div className="popular-badge">🔥 Most Popular</div>
                <h2 className="gradient-text">{winner.name}</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {winner.tags?.slice(0, 3).map(tag => (
                        <span key={tag} className="dash-tag" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa' }}>{tag}</span>
                    ))}
                </div>
            </div>
            <div className="winner-stats">
                <div className="winner-percent">{winnerPercentage}%</div>
                <div className="winner-label">of the group votes</div>
            </div>
        </motion.div>

        {/* --- STEP 3 & 4: RESULTS VISUAL & OPTION CARDS --- */}
        {!room?.blueprintGenerated ? (
          <>
            <div className="results-grid">
              {sortedOptions.map((opt, i) => {
                const percentage = Math.round((opt.votes / totalVotes) * 100);
                const isWinner = opt.name === winner.name;

                return (
                  <motion.div 
                    key={opt.name} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="dashboard-option-card"
                  >
                    <div className="option-main-info">
                      <div className="option-name-group">
                        <span className="option-name">{opt.name}</span>
                        <div className="option-tags">
                            {opt.tags?.slice(0, 2).map(t => <span key={t} className="dash-tag">{t}</span>)}
                        </div>
                      </div>
                      <div className="option-score">
                        <div className="option-percentage">{percentage}%</div>
                        <div className="option-votes-count">{opt.votes} votes</div>
                      </div>
                    </div>

                    <div className="dash-progress-container">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                        className="dash-progress-fill"
                        style={{ 
                            background: isWinner ? 'var(--dash-primary)' : '#334155',
                            boxShadow: isWinner ? '0 0 15px rgba(59, 130, 246, 0.3)' : 'none'
                        }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* --- TRIP CONFIRMATION SECTION --- */}
            {isFinalized && (
                <TripConfirmation 
                    roomId={roomId} 
                    user={user} 
                    roomData={room} 
                />
            )}
          </>
        ) : (
          <TripBlueprint roomId={roomId} roomData={room} />
        )}

        {/* --- TRIP CHAT SECTION --- */}
        {roomId && user && (
            <TripChat 
                key={roomId}
                roomId={roomId} 
                user={user} 
            />
        )}

        {/* --- COST PLANNER SECTION --- */}
        <CostPlanner destination={winner?.name} />

        {/* --- STEP 7: CTA SECTION --- */}
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="dashboard-cta"
        >
            <div className="cta-text">
                <h3>{room?.blueprintGenerated ? "Trip Plan Locked 🔒" : "Ready to finalize?"}</h3>
                <p>{room?.blueprintGenerated ? "Your final blueprint is ready for execution." : "Plan your trip based on these group preferences."}</p>
            </div>
            {!room?.blueprintGenerated ? (
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                        className="btn-premium primary" 
                        style={{ height: '54px', padding: '0 32px', fontSize: '1rem' }}
                        onClick={() => navigate("/planner", { state: { prefilledCity: winner.name } })}
                    >
                        Plan Trip ✨
                    </button>
                    {isFinalized && isCreator && (
                        <button 
                            className="btn-premium outline" 
                            style={{ height: '54px', padding: '0 32px', fontSize: '1rem', background: '#0f172a', color: 'white', border: 'none' }}
                            onClick={handleGenerateBlueprint}
                        >
                            Generate Blueprint 📄
                        </button>
                    )}
                </div>
            ) : (
                <button 
                    className="btn-premium outline" 
                    style={{ height: '54px', padding: '0 32px', fontSize: '1rem' }}
                    onClick={() => window.print()}
                >
                    Print Plan 📄
                </button>
            )}
        </motion.div>

        {/* Sharing Section */}
        <div style={{ textAlign: 'center', marginTop: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            {joinCode && (
                <div style={{ background: 'var(--bg-panel)', padding: '20px 40px', borderRadius: '24px', border: '2px dashed var(--border-main)' }}>
                    <p style={{ fontSize: '12px', color: 'var(--dash-primary)', fontWeight: '800', marginBottom: '8px', textTransform: 'uppercase' }}>Trip Join Code</p>
                    <h2 style={{ fontSize: '2.5rem', letterSpacing: '8px', margin: 0, color: 'var(--text-main)' }}>{joinCode}</h2>
                    <button
                        className="btn-premium outline"
                        style={{ marginTop: '12px', fontSize: '0.8rem', padding: '6px 12px' }}
                        onClick={() => {
                            navigator.clipboard.writeText(joinCode);
                            alert("Join code copied! 🔑");
                        }}
                    >
                        Copy Code 🔑
                    </button>
                </div>
            )}
            <button 
                className="btn-premium outline" 
                style={{ fontSize: '0.85rem', border: 'none', background: 'transparent' }}
                onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Dashboard link copied! ✨");
                }}
            >
                Copy Link to Dashboard 🔗
            </button>
        </div>

      </div>
    </div>
  );
}