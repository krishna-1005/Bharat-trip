import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  doc,
  updateDoc,
  arrayUnion,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * Creates a new Trip Room or fetches an existing one based on pollId.
 * 
 * @param {string} pollId - The ID of the poll associated with the room.
 * @param {string} tripName - The name of the trip.
 * @param {Object} user - The current authenticated user object (must have uid).
 * @returns {Promise<string>} - The roomId (document ID).
 */
export const createOrGetTripRoom = async (pollId, tripName, user) => {
  if (!pollId || !user?.uid) {
    throw new Error("Missing required parameters: pollId and user.uid are mandatory.");
  }

  try {
    // 1. Check if a room already exists for this pollId
    const roomsRef = collection(db, "tripRooms");
    const q = query(roomsRef, where("pollId", "==", pollId));
    const querySnapshot = await getDocs(q);

    // 2. If exists → return existing roomId
    if (!querySnapshot.empty) {
      // Assuming only one room per pollId
      const existingRoom = querySnapshot.docs[0];
      console.log("Existing Trip Room found:", existingRoom.id);
      return existingRoom.id;
    }

    // 3. If not → create new room
    const newRoomData = {
      name: tripName || "Untitled Trip",
      createdBy: user.uid,
      members: [user.uid],
      membersInfo: [{
        uid: user.uid,
        name: user.displayName || user.name || "Traveler",
        email: user.email || ""
      }],
      pollId: pollId,
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(roomsRef, newRoomData);
    console.log("New Trip Room created with ID:", docRef.id);

    // 4. Return roomId after creation
    return docRef.id;
  } catch (error) {
    console.error("Error in createOrGetTripRoom:", error);
    throw error;
  }
};

/**
 * Safely adds a user to the Trip Room's members list and tracks minimal info.
 * Uses arrayUnion to ensure no duplicates and atomic updates.
 * 
 * @param {string} roomId - The document ID of the trip room.
 * @param {Object} user - The current authenticated user object.
 */
export const addUserToRoom = async (roomId, user) => {
  if (!roomId || !user?.uid) return;

  try {
    const roomRef = doc(db, "tripRooms", roomId);

    // arrayUnion automatically handles checking if the EXACT value already exists
    // 1. Add UID to members (Core)
    // 2. Add Info object to membersInfo (Bonus)
    await updateDoc(roomRef, {
      members: arrayUnion(user.uid),
      membersInfo: arrayUnion({
        uid: user.uid,
        name: user.displayName || user.name || "Traveler",
        email: user.email || ""
      })
    });

    console.log(`User ${user.uid} membership verified in Room ${roomId}`);
  } catch (error) {
    console.error("Error in addUserToRoom:", error);
  }
};
