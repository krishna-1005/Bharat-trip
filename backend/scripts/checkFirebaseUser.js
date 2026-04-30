const { admin, initialized } = require("../firebaseAdmin");

async function checkFirebaseUser(email) {
  if (!initialized) {
    console.error("Firebase Admin not initialized");
    return;
  }

  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log("Firebase User found:");
    console.log("UID:", userRecord.uid);
    console.log("Email:", userRecord.email);
    console.log("DisplayName:", userRecord.displayName);
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.log(`Firebase User with email ${email} not found.`);
    } else {
      console.error("Error fetching user from Firebase:", error);
    }
  }
}

const email = "krishkulkarni1005@gmail.com";
checkFirebaseUser(email).then(() => process.exit());
