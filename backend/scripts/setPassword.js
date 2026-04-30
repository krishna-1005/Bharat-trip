const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const User = require("../models/User");
const { admin, initialized } = require("../firebaseAdmin");

async function setPassword(email, newPassword) {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User with email ${email} not found in MongoDB.`);
    } else {
      user.password = newPassword;
      await user.save();
      console.log(`✅ Password set successfully in MongoDB for ${email}`);
    }

    // Also update Firebase if initialized
    if (initialized) {
      try {
        const firebaseUser = await admin.auth().getUserByEmail(email);
        await admin.auth().updateUser(firebaseUser.uid, {
          password: newPassword
        });
        console.log(`✅ Password set successfully in Firebase for ${email}`);
        
        // If they only had Google, this will add a password provider
      } catch (fbErr) {
        if (fbErr.code === 'auth/user-not-found') {
          console.log(`Firebase user not found for ${email}. Creating one...`);
          await admin.auth().createUser({
            email: email,
            password: newPassword,
            displayName: user ? user.name : "User"
          });
          console.log(`✅ Created new Firebase user and set password for ${email}`);
        } else {
          console.error("Firebase update error:", fbErr.message);
        }
      }
    } else {
      console.warn("⚠️ Firebase Admin not initialized. Skipping Firebase password update.");
    }

    await mongoose.disconnect();
    console.log("Done.");
  } catch (err) {
    console.error("Error:", err);
  }
}

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log("Usage: node setPassword.js <email> <password>");
  process.exit(1);
}

setPassword(email, password);
