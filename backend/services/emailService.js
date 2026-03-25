const nodemailer = require("nodemailer");

/* 
  To use this, add these to your backend .env:
  EMAIL_USER=your-email@gmail.com
  EMAIL_PASS=your-app-password
*/

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send a broadcast update to multiple users
 * @param {Array} emails - Array of user emails
 * @param {String} subject - Email subject
 * @param {String} content - HTML or Text content
 */
async function sendUpdateEmail(emails, subject, content) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("⚠️ Email credentials missing in .env. Skipping email send.");
    return;
  }

  const mailOptions = {
    from: `"BharatTrip Updates" <${process.env.EMAIL_USER}>`,
    bcc: emails.join(", "), // Use BCC for privacy
    subject: subject,
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #3b82f6;">🌍 BharatTrip Update</h2>
        <div style="font-size: 16px; line-height: 1.6;">
          ${content}
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999;">
          You received this because you enabled Email Alerts in your Settings.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Update email sent to ${emails.length} users.`);
  } catch (error) {
    console.error("❌ Failed to send update email:", error.message);
  }
}

module.exports = { sendUpdateEmail };