import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { listenToRoom } from "../services/tripRoomService";
import PersonaSelection from "../components/PersonaSelection";
import WaitingRoom from "../components/WaitingRoom";

const TripRoom = () => {
  const { roomId } = useParams();
  const { user, guestId } = useContext(AuthContext);
  const [hasSelectedPersona, setHasSelectedPersona] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) return;

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
      {!hasSelectedPersona ? (
        <PersonaSelection roomId={roomId} onComplete={() => setHasSelectedPersona(true)} />
      ) : (
        <WaitingRoom />
      )}
    </>
  );
};

export default TripRoom;