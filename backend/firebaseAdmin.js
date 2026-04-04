const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

let db = null;
let initialized = false;

try {
  const saPath = path.join(__dirname, "firebaseServiceAccount.json");

  if (fs.existsSync(saPath)) {
    const serviceAccount = require(saPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    db = admin.firestore();
    initialized = true;
    console.log("✅ Firebase Admin initialized via JSON file.");
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Optional: Allow base64 encoded JSON string from environment variable
    const saData = JSON.parse(
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, "base64").toString()
    );
    admin.initializeApp({
      credential: admin.credential.cert(saData)
    });
    db = admin.firestore();
    initialized = true;
    console.log("✅ Firebase Admin initialized via environment variable.");
  } else {
    console.warn("⚠️ Firebase service account missing. Firestore will be disabled.");
  }
} catch (err) {
  console.error("❌ Firebase initialization error:", err.message);
}

module.exports = { admin, db, initialized };