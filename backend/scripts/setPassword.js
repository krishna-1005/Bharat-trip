const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const User = require("../models/User");

async function setPassword(email, newPassword) {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User with email ${email} not found.`);
    } else {
      user.password = newPassword;
      await user.save();
      console.log(`Password set successfully for ${email}`);
    }

    await mongoose.disconnect();
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
