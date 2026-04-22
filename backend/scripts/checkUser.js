const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const User = require("../models/User");

async function checkUser(email) {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User with email ${email} not found.`);
    } else {
      console.log("User found:");
      console.log("ID:", user._id);
      console.log("Name:", user.name);
      console.log("Email:", user.email);
      console.log("Role:", user.role);
      
      if (user.role !== "admin") {
          console.log("Updating user to admin...");
          user.role = "admin";
          await user.save();
          console.log("User role updated to admin.");
      }
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error:", err);
  }
}

const emailToCheck = "krishkulkarni1005@gmail.com";
checkUser(emailToCheck);
