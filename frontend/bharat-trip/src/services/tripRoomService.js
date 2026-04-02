import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * Robust function to create or fetch a Trip Room.
 * Includes extensive logging for debugging Firestore writes.
 */
export const createOrGetTripRoom = async (pollId, tripName, user) => {
  console.log("DEBUG: createOrGetTripRoom called with:", { pollId, tripName, userId: user?.uid });

  if (!pollId || !user?.uid) {
    console.error("DEBUG: Missing pollId or user.uid. Aborting.");
    return null;
  }

  try {
    // 1. Check if room exists
    const roomsRef = collection(db, "tripRooms");
    const q = query(roomsRef, where("pollId", "==", pollId));
    
    console.log("DEBUG: Querying Firestore for existing room...");
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const existingId = querySnapshot.docs[0].id;
      console.log("DEBUG: Existing room found. ID:", existingId);
      return existingId;
    }

    // 2. Create new room if not found
    console.log("DEBUG: No room found. Attempting to create new document...");
    
    const newRoomData = {
      name: tripName || "Untitled Trip",
      createdBy: user.uid,
      members: [user.uid],
      pollId: pollId,
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(roomsRef, newRoomData);
    
    console.log("DEBUG: ✅ SUCCESS! Document written to Firestore with ID:", docRef.id);
    return docRef.id;

  } catch (error) {
    console.error("DEBUG: ❌ Firestore Write Error:", error.code, error.message);
    // Common error code: 'permission-denied' means Firestore Rules are blocking the write
    throw error;
  }
};
