import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { listenToRoom } from "../services/tripRoomService";
import axios from "axios";
import PersonaSelection from "../components/PersonaSelection";
import WaitingRoom from "../components/WaitingRoom";
import RebookingModal from "../components/RebookingModal";

const TripRoom = () => {
  const { roomId } = useParams();
  const { user, guestId } = useContext(AuthContext);
  const [hasSelectedPersona, setHasSelectedPersona] = useState(false);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTrip = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/trips/${roomId}`);
      setTrip(res.data);
    } catch (err) {
      console.error("Error fetching trip:", err);
    }
  };

  useEffect(() => {
    if (!roomId) return;
    
    fetchTrip();

    const unsubscribe = listenToRoom(roomId, (roomData) => {
      const activeUid = user?.id || guestId;
      const member = roomData.membersInfo?.find(m => m.uid === activeUid);
      
      if (member?.persona) {
        setHasSelectedPersona(true);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [roomId, user, guestId]);

  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', fontWeight: 800 }}>SYNCING WITH CREW...</div>;

  return (
    <>
      {trip?.pendingRevision && (
        <RebookingModal trip={trip} onExecuted={fetchTrip} />
      )}

      {!hasSelectedPersona ? (
        <PersonaSelection roomId={roomId} onComplete={() => setHasSelectedPersona(true)} />
      ) : (
        <WaitingRoom />
      )}
    </>
  );
};

export default TripRoom;