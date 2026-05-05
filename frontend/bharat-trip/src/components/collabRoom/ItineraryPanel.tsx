import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Plus, Clock, User as UserIcon } from 'lucide-react';
import AddEventModal from '@/components/collabRoom/modals/AddEventModal';
import { useAuth } from '@/components/AuthProvider';
import { useSocket } from '@/context/SocketContext';

const COLORS = {
  cardBg: '#161b22',
  border: '#30363d',
  accent: '#1d9e75',
  amber: '#ef9f27',
  red: '#f85149',
  textPrimary: '#e6edf3',
  textMuted: '#8b949e',
};

const ItineraryPanel = ({ trip, polls }: { trip: any, polls: any[] }) => {
  const [itinerary, setItinerary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const { user } = useAuth();
  const socket = useSocket();

  const fetchItinerary = async () => {
    try {
      const token = await user?.getIdToken();
      const res = await axios.get(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/api/trips/${trip._id}/itinerary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItinerary(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchItinerary();

    if (socket) {
      socket.on('itinerary:updated', (updatedItinerary: any) => {
        setItinerary(updatedItinerary);
      });
      return () => {
        socket.off('itinerary:updated');
      };
    }
  }, [trip._id, user, socket]);

  if (loading) return <Loader2 className="animate-spin" size={32} />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Trip Itinerary</h2>
            <span style={{ backgroundColor: '#238636', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>NEW</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
            <button 
                onClick={() => setShowAddModal(true)}
                style={{
                    backgroundColor: '#161b22',
                    color: 'white',
                    border: `1px solid ${COLORS.border}`,
                    padding: '8px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: '600',
                    fontSize: '14px'
                }}
            >
                <Plus size={18} /> Add event
            </button>
            <div style={{ backgroundColor: '#23863622', color: '#238636', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', border: '1px solid #23863644' }}>
                Day 1 of {trip.days || 3}
            </div>
        </div>
      </div>

      {!itinerary || itinerary.days.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: COLORS.textMuted }}>
          No events planned yet. Start adding activities!
        </div>
      ) : (
        itinerary.days.map((day, idx) => (
          <div key={idx} style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: COLORS.accent, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              DAY {idx + 1} — {new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase()}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {day.events.map((event, eIdx) => (
                <EventCard key={eIdx} event={event} />
              ))}
            </div>
          </div>
        ))
      )}

      {showAddModal && (
        <AddEventModal 
          trip={trip} 
          polls={polls}
          onClose={() => setShowAddModal(false)} 
          onSuccess={() => {
            setShowAddModal(false);
            fetchItinerary();
          }} 
        />
      )}
    </div>
  );
};

const EventCard = ({ event }: any) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return COLORS.accent;
      case 'pending': return COLORS.amber;
      case 'cancelled': return '#f85149';
      default: return COLORS.border;
    }
  };

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
  };

  return (
    <div style={{
      backgroundColor: '#161b22',
      border: `1px solid ${COLORS.border}`,
      borderLeft: `4px solid ${getStatusColor(event.status)}`,
      borderRadius: '8px',
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
    }}>
      <div style={{ width: '80px', color: COLORS.textPrimary, fontSize: '14px', fontWeight: '600' }}>
        {event.time}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: COLORS.textPrimary }}>{event.name}</h4>
        </div>
        <p style={{ color: COLORS.textMuted, fontSize: '13px' }}>{event.description}</p>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ 
          width: '28px', 
          height: '28px', 
          borderRadius: '50%', 
          backgroundColor: '#3b82f6', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: '10px',
          fontWeight: 'bold',
          color: 'white'
        }}>
          {getInitials(event.ownerId?.name || 'U')}
        </div>
        <div style={{ 
            backgroundColor: event.status === 'confirmed' ? 'rgba(29, 158, 117, 0.1)' : 'rgba(239, 159, 39, 0.1)', 
            color: getStatusColor(event.status), 
            fontSize: '11px', 
            padding: '4px 10px', 
            borderRadius: '6px',
            border: `1px solid ${getStatusColor(event.status)}33`,
            fontWeight: 'bold',
            textTransform: 'lowercase'
        }}>
            {event.linkedPollId ? 'pending vote' : event.status}
        </div>
      </div>
    </div>
  );
};

export default ItineraryPanel;
