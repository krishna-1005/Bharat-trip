const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = require("./app");

const PORT = process.env.PORT || 5000;

// Explicitly check for email credentials on startup
const { sendWelcomeEmail } = require("./services/emailService");
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  console.log(`📧 Email configuration detected for: ${process.env.EMAIL_USER}`);
} else {
  console.error("❌ EMAIL_USER or EMAIL_PASS missing in .env file. Emails will NOT be sent.");
}

// Bind to 0.0.0.0 to ensure the service is reachable on Render/Cloud environments
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 GoTripo backend running on port ${PORT}`);
});