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
    from: `"GoTripo Updates" <${process.env.EMAIL_USER}>`,
    bcc: emails.join(", "), // Use BCC for privacy
    subject: subject,
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #3b82f6;">🌍 GoTripo Update</h2>
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

/**
 * Send a welcome email to a new user
 * @param {String} email - Recipient email
 * @param {String} name - Recipient name
 */
async function sendWelcomeEmail(email, name) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("⚠️ Email credentials missing in .env. Skipping welcome email.");
    return;
  }

  const firstName = name ? name.split(" ")[0] : "Traveler";

  const mailOptions = {
    from: `"GoTripo" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Welcome to your next adventure, ${firstName}! 🌍`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; color: #1e293b;">
        <div style="background-color: #3b82f6; padding: 40px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: -1px;">GoTripo</h1>
          <p style="color: #bfdbfe; margin-top: 8px; font-size: 16px;">Your AI-Powered Odyssey Blueprint</p>
        </div>
        
        <div style="padding: 40px 30px;">
          <h2 style="font-size: 24px; color: #0f172a; margin-top: 0;">Welcome aboard, ${firstName}! ✨</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #475569;">
            We're thrilled to have you join our community of explorers. GoTripo is designed to help you plan, collaborate, and experience travel like never before.
          </p>
          
          <div style="margin: 30px 0; background-color: #f8fafc; border-radius: 12px; padding: 20px; border-left: 4px solid #3b82f6;">
            <h3 style="margin-top: 0; font-size: 18px; color: #1e293b;">What's next?</h3>
            <ul style="padding-left: 20px; color: #475569; line-height: 1.8;">
              <li><strong>Create your first plan:</strong> Use our AI engine to build a bespoke itinerary in seconds.</li>
              <li><strong>Invite friends:</strong> Collaborate in real-time to build the perfect group getaway.</li>
              <li><strong>Save your memories:</strong> Track your progress and upload photos of your journey.</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 40px;">
            <a href="${process.env.FRONTEND_URL || 'https://gotripo.tech'}/planner" style="background-color: #3b82f6; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.4);">
              Start Planning Now
            </a>
          </div>
        </div>
        
        <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 14px; color: #64748b;">
          <p style="margin: 0;">&copy; 2026 GoTripo. All rights reserved.</p>
          <p style="margin: 5px 0 0;">Adventure is calling. Don't let it go to voicemail.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${email}`);
  } catch (error) {
    console.error("❌ Failed to send welcome email:", error.message);
  }
}

module.exports = { sendUpdateEmail, sendWelcomeEmail };