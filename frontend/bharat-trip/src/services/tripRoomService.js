import { 
  collection, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  getDocs, 
  addDoc, 
  doc,
  updateDoc,
  arrayUnion,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * Robust function to create or fetch a Trip Room.
 */
export const createOrGetTripRoom = async (pollId, tripName, user) => {
  if (!pollId || !user?.uid) return null;

  try {
    const roomsRef = collection(db, "tripRooms");
    const q = query(roomsRef, where("pollId", "==", pollId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].id;
    }

    const newRoomData = {
      name: tripName || "Untitled Trip",
      createdBy: user.uid,
      members: [user.uid],
      pollId: pollId,
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(roomsRef, newRoomData);
    return docRef.id;
  } catch (error) {
    console.error("DEBUG: Firestore Write Error:", error);
    throw error;
  }
};

/**
 * Safely adds a user to the Trip Room members list.
 */
export const addUserToRoom = async (roomId, user) => {
  if (!roomId || !user?.uid) return;

  try {
    const roomRef = doc(db, "tripRooms", roomId);
    await updateDoc(roomRef, {
      members: arrayUnion(user.uid),
      membersInfo: arrayUnion({
        uid: user.uid,
        name: user.displayName || user.name || "Traveler",
        email: user.email || ""
      })
    });
  } catch (error) {
    console.error("DEBUG: Failed to update members:", error);
  }
};

/**
 * Logs a real-time activity inside a Trip Room.
 */
export const addActivity = async (roomId, type, message, user) => {
  if (!roomId || !user?.uid) return;

  try {
    const activitiesRef = collection(db, "activities");
    await addDoc(activitiesRef, {
      roomId,
      type,
      message,
      userId: user.uid,
      userName: user.displayName || user.name || "A traveler",
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error("DEBUG: Failed to log activity:", error);
  }
};

/**
 * Real-time listener for activities in a specific room.
 */
export const listenToActivities = (roomId, callback) => {
  const activitiesRef = collection(db, "activities");
  const q = query(
    activitiesRef, 
    where("roomId", "==", roomId),
    orderBy("timestamp", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const activities = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(activities);
  });
};
