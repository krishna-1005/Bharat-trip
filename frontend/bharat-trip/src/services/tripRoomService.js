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
  serverTimestamp,
  limit
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * Generates a random 6-character unique join code.
 */
const generateUniqueJoinCode = async () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  let isUnique = false;
  
  while (!isUnique) {
    code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Check uniqueness in Firestore
    const q = query(collection(db, "tripRooms"), where("joinCode", "==", code), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      isUnique = true;
    }
  }
  return code;
};

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
      const doc = querySnapshot.docs[0];
      return { id: doc.id, joinCode: doc.data().joinCode, status: doc.data().status || "polling" };
    }

    // Generate a unique join code for the new room
    const joinCode = await generateUniqueJoinCode();

    const newRoomData = {
      name: tripName || "Untitled Trip",
      createdBy: user.uid,
      members: [user.uid],
      membersInfo: [{
        uid: user.uid,
        name: user.displayName || user.name || "Traveler",
        email: user.email || ""
      }],
      confirmations: {
        [user.uid]: "pending"
      },
      pollId: pollId,
      joinCode: joinCode,
      status: "polling",
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(roomsRef, newRoomData);
    return { id: docRef.id, joinCode: joinCode, status: "polling" };
  } catch (error) {
    console.error("DEBUG: Firestore Write Error:", error);
    throw error;
  }
};

/**
 * Finds a Trip Room by its unique join code.
 */
export const getRoomByCode = async (code) => {
  if (!code) return null;
  const cleanCode = code.trim().toUpperCase();
  
  try {
    const roomsRef = collection(db, "tripRooms");
    const q = query(roomsRef, where("joinCode", "==", cleanCode), limit(1));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return null;
    
    const roomData = snapshot.docs[0].data();
    return {
      roomId: snapshot.docs[0].id,
      pollId: roomData.pollId
    };
  } catch (err) {
    console.error("Error finding room by code:", err);
    return null;
  }
};

/**
 * Updates the status of a Trip Room.
 */
export const updateRoomStatus = async (roomId, status) => {
  if (!roomId) return;
  try {
    const roomRef = doc(db, "tripRooms", roomId);
    await updateDoc(roomRef, { status });
  } catch (err) {
    console.error("Error updating room status:", err);
  }
};

/**
 * Updates a member's confirmation status.
 */
export const updateMemberConfirmation = async (roomId, userId, status) => {
  if (!roomId || !userId) return;
  try {
    const roomRef = doc(db, "tripRooms", roomId);
    await updateDoc(roomRef, {
      [`confirmations.${userId}`]: status
    });
  } catch (err) {
    console.error("Error updating confirmation:", err);
  }
};

/**
 * Real-time listener for room data (including status).
 */
export const listenToRoom = (roomId, callback) => {
  if (!roomId) return () => {};
  return onSnapshot(doc(db, "tripRooms", roomId), (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() });
    }
  });
};

/**
 * Safely adds a user to the Trip Room members list.
 */
export const addUserToRoom = async (roomId, user) => {
  if (!roomId || !user?.uid) return;

  try {
    const roomRef = doc(db, "tripRooms", roomId);
    const roomSnap = await getDocs(query(collection(db, "tripRooms"), where("__name__", "==", roomId), limit(1)));
    
    if (roomSnap.empty) return;
    const roomData = roomSnap.docs[0].data();
    
    // Only add if not already a member to avoid overwriting confirmation status
    if (roomData.members && roomData.members.includes(user.uid)) {
      return;
    }

    await updateDoc(roomRef, {
      members: arrayUnion(user.uid),
      membersInfo: arrayUnion({
        uid: user.uid,
        name: user.displayName || user.name || "Traveler",
        email: user.email || ""
      }),
      [`confirmations.${user.uid}`]: "pending"
    });
  } catch (error) {
    console.error("DEBUG: Failed to update members:", error);
  }
};

/**
 * Sends a message in a Trip Room.
 */
export const sendMessage = async (roomId, user, text) => {
  if (!roomId || !user?.uid || !text.trim()) return;

  try {
    const messagesRef = collection(db, "messages");
    await addDoc(messagesRef, {
      roomId,
      userId: user.uid,
      userName: user.displayName || user.name || "Traveler",
      text: text.trim(),
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error("DEBUG: Failed to send message:", error);
  }
};

/**
 * Real-time listener for messages in a specific room.
 */
export const listenToMessages = (roomId, callback) => {
  if (!roomId) return () => {};
  const messagesRef = collection(db, "messages");
  const q = query(
    messagesRef, 
    where("roomId", "==", roomId),
    orderBy("timestamp", "asc"),
    limit(50)
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log(`DEBUG: [${roomId}] Messages received:`, messages.length);
    callback(messages);
  }, (error) => {
    console.error("DEBUG: Chat Listener Error:", error);
  });
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
