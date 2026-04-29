const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const User = require("../models/User");

async function promoteToAdmin(emails) {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env file");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    for (const email of emails) {
      let user = await User.findOne({ email });
      
      if (!user) {
        console.log(`User with email ${email} not found. Creating new admin account...`);
        user = new User({
          name: email.split('@')[0],
          email: email,
          password: "AdminPassword123", // Default password, should be changed
          role: "admin",
          userType: "user"
        });
        await user.save();
        console.log(`Created new admin: ${email}`);
      } else {
        console.log(`User found: ${email}. Current role: ${user.role}`);
        if (user.role !== "admin") {
          user.role = "admin";
          await user.save();
          console.log(`Updated user ${email} to admin.`);
        } else {
          console.log(`User ${email} is already an admin.`);
        }
      }
    }

    await mongoose.disconnect();
    console.log("Done.");
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

// Get emails from command line arguments or use defaults if provided by user later
const emailsToPromote = process.argv.slice(2);

if (emailsToPromote.length === 0) {
  console.log("Please provide email addresses as arguments.");
  console.log("Usage: node promoteAdmins.js email1@example.com email2@example.com");
  process.exit(1);
}

promoteToAdmin(emailsToPromote);
