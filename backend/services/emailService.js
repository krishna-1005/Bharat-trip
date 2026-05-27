const nodemailer = require("nodemailer");

/* 
  SECURITY NOTE: 
  To use Gmail, you MUST use an "App Password" if 2FA is enabled.
  1. Go to Google Account -> Security
  2. 2-Step Verification -> App Passwords
  3. Generate a password for "Mail" and "Other (GoTripo)"
*/

let transporter = null;
let isVerified = false;

const getTransporter = async () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("❌ EMAIL_USER or EMAIL_PASS missing in environment variables.");
    return null;
  }

  if (transporter && isVerified) return transporter;

  // Primary configuration: Gmail Service
  const config = {
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    pool: true,
    maxConnections: 5,
  };

  transporter = nodemailer.createTransport(config);

  try {
    await transporter.verify();
    console.log("✅ Email transporter verified and ready to send.");
    isVerified = true;
  } catch (error) {
    console.error("❌ Email transporter verification failed:", error.message);
    isVerified = false;
    // We still return it, but next call will try to re-verify or it will fail on send
  }

  return transporter;
};

/**
 * Send a test email to verify credentials
 */
async function sendTestEmail(targetEmail) {
  const currentTransporter = await getTransporter();
  if (!currentTransporter) {
    throw new Error("Transporter not initialized. Check EMAIL_USER/PASS.");
  }

  const mailOptions = {
    from: `"GoTripo Debug" <${process.env.EMAIL_USER}>`,
    to: targetEmail,
    subject: "GoTripo Email Test 🧪",
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Email Test Successful!</h2>
        <p>If you are reading this, your GoTripo email configuration is working perfectly.</p>
        <p><strong>Configured User:</strong> ${process.env.EMAIL_USER}</p>
        <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
      </div>
    `,
  };

  try {
    const info = await currentTransporter.sendMail(mailOptions);
    console.log("✅ Test email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Test email failed:", error.message);
    throw error;
  }
}

/**
 * Send a broadcast update to multiple users
 */
async function sendUpdateEmail(emails, subject, content) {
  console.log(`📧 Attempting to send update email to ${emails.length} recipients...`);
  const currentTransporter = await getTransporter();
  if (!currentTransporter) return;

  // Gmail has limits on BCC recipients (usually ~100 per mail). 
  // For larger lists, we should batch them.
  const batchSize = 50;
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    const mailOptions = {
      from: `"GoTripo Announcements" <${process.env.EMAIL_USER}>`,
      bcc: batch.join(", "),
      subject: `🌍 GoTripo Update: ${subject}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; color: #1e293b;">
          <div style="background-color: #f59e0b; padding: 40px 20px; text-align: center; background-image: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Announcement</h1>
          </div>
          
          <div style="padding: 40px 30px;">
            <h2 style="font-size: 22px; color: #0f172a; margin-top: 0; line-height: 1.3;">${subject}</h2>
            <div style="font-size: 16px; line-height: 1.7; color: #475569; margin-top: 20px;">
              ${content}
            </div>
            
            <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #f1f5f9;">
              <a href="${process.env.FRONTEND_URL || 'https://gotripo.tech'}" style="background-color: #0f172a; color: #ffffff; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 15px; display: inline-block;">
                Visit GoTripo
              </a>
            </div>
          </div>
          
          <div style="background-color: #f8fafc; padding: 25px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9;">
            <p style="margin: 0;">You received this because you enabled Email Alerts in your GoTripo settings.</p>
            <p style="margin: 8px 0 0;">&copy; 2026 GoTripo India. Exploring the Extraordinary.</p>
          </div>
        </div>
      `,
    };

    try {
      await currentTransporter.sendMail(mailOptions);
      console.log(`✅ Update email batch sent successfully (${i + batch.length}/${emails.length}).`);
    } catch (error) {
      console.error(`❌ Failed to send update email batch starting at ${i}:`, error.message);
    }
  }
}

/**
 * Send a welcome email to a new user
 */
async function sendWelcomeEmail(email, name) {
  console.log(`📧 Attempting to send welcome email to: ${email}`);
  
  const currentTransporter = await getTransporter();
  if (!currentTransporter) {
    console.warn(`⚠️ Skipping welcome email for ${email}: Transporter not initialized. Check EMAIL_USER/PASS.`);
    return;
  }

  const firstName = name ? name.split(" ")[0] : "Traveler";

  const mailOptions = {
    from: `"GoTripo" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Welcome to your next adventure, ${firstName}! 🌍`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; color: #1e293b;">
        <div style="background-color: #3b82f6; padding: 50px 20px; text-align: center; background-image: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);">
          <h1 style="color: #ffffff; margin: 0; font-size: 32px; letter-spacing: -1px; font-weight: 800;">GoTripo</h1>
          <p style="color: #bfdbfe; margin-top: 8px; font-size: 18px; font-weight: 500;">Your AI-Powered Odyssey Blueprint</p>
        </div>
        
        <div style="padding: 40px 30px;">
          <h2 style="font-size: 24px; color: #0f172a; margin-top: 0;">Namaste, ${firstName}! 🙏</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #475569;">
            We're thrilled to have you join our community of explorers. Whether you're planning a weekend getaway or a month-long trek, GoTripo is here to make your travel dreams a reality.
          </p>
          
          <div style="margin: 30px 0; background-color: #f8fafc; border-radius: 12px; padding: 25px; border: 1px solid #e2e8f0;">
            <p style="margin: 0 0 15px; color: #1e293b; font-weight: 700; font-size: 16px;">Get Started with These Hotspots:</p>
            <div style="display: grid; gap: 15px;">
              <div style="padding: 10px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;">
                <p style="margin: 0; font-weight: 600; color: #3b82f6;">🏔️ Leh Ladakh</p>
                <p style="margin: 5px 0 0; font-size: 12px; color: #64748b;">The land of high passes and breathtaking landscapes.</p>
              </div>
              <div style="padding: 10px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;">
                <p style="margin: 0; font-weight: 600; color: #10b981;">🌴 Kerala Backwaters</p>
                <p style="margin: 5px 0 0; font-size: 12px; color: #64748b;">Relax in a houseboat amidst God's Own Country.</p>
              </div>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 40px;">
            <a href="${process.env.FRONTEND_URL || 'https://gotripo.tech'}/planner" style="background-color: #3b82f6; color: #ffffff; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.5);">
              Start Planning Now
            </a>
          </div>
        </div>
        
        <div style="background-color: #f1f5f9; padding: 30px; text-align: center; font-size: 13px; color: #64748b;">
          <p style="margin: 0;">&copy; 2026 GoTripo India. Exploring the Extraordinary.</p>
        </div>
      </div>
    `,
  };

  try {
    await currentTransporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Failed to send welcome email to ${email}:`, error.message);
  }
}

/**
 * Send a login notification email
 */
async function sendLoginNotificationEmail(email, name) {
  console.log(`📧 Attempting to send login notification to: ${email}`);
  const currentTransporter = await getTransporter();
  if (!currentTransporter) return;

  const firstName = name ? name.split(" ")[0] : "Traveler";
  const loginTime = new Date().toLocaleString();

  const mailOptions = {
    from: `"GoTripo Security" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `New Login Detected on GoTripo 🔐`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; color: #1e293b;">
        <div style="background-color: #0f172a; padding: 30px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: -1px;">GoTripo Security</h1>
        </div>
        
        <div style="padding: 40px 30px;">
          <h2 style="font-size: 20px; color: #0f172a; margin-top: 0;">Hi ${firstName},</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #475569;">
            We noticed a new login to your GoTripo account.
          </p>
          
          <div style="margin: 30px 0; background-color: #f1f5f9; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0;">
            <p style="margin: 0; color: #64748b; font-size: 14px; text-transform: uppercase; font-weight: 700;">Login Details</p>
            <p style="margin: 10px 0 0; color: #1e293b;"><strong>Time:</strong> ${loginTime}</p>
            <p style="margin: 5px 0 0; color: #1e293b;"><strong>Account:</strong> ${email}</p>
          </div>
          
          <div style="margin: 25px 0; padding: 15px; background-color: #fffbeb; border-radius: 12px; border: 1px solid #fef3c7;">
            <p style="margin: 0; font-weight: 700; color: #92400e; font-size: 14px;">🌟 Travel Tip of the Moment</p>
            <p style="margin: 5px 0 0; font-size: 13px; color: #b45309;">
              "Always carry a portable power bank. Your AI planner is your best friend, but it needs a charged phone to guide you!"
            </p>
          </div>
          
          <p style="font-size: 14px; color: #64748b; margin-top: 30px;">
            If this was you, you can safely ignore this email. If you don't recognize this activity, we recommend changing your password immediately.
          </p>
          
          <div style="text-align: center; margin-top: 40px;">
            <a href="${process.env.FRONTEND_URL || 'https://gotripo.tech'}/profile" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
              Review Account Activity
            </a>
          </div>
        </div>
        
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9;">
          <p style="margin: 0;">&copy; 2026 GoTripo Security Team</p>
        </div>
      </div>
    `,
  };

  try {
    await currentTransporter.sendMail(mailOptions);
    console.log(`✅ Login notification email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Failed to send login notification email to ${email}:`, error.message);
  }
}


/**
 * Send notification to admin when a new job application is submitted
 */
async function sendJobApplicationNotification(application) {
  const currentTransporter = await getTransporter();
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  
  if (!currentTransporter || !adminEmail) return;

  const mailOptions = {
    from: `"GoTripo Hiring" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `New Job Application: ${application.jobTitle} - ${application.name} 💼`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #3b82f6; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">New Application Received</h2>
        </div>
        <div style="padding: 30px;">
          <p><strong>Applicant Name:</strong> ${application.name}</p>
          <p><strong>Email:</strong> ${application.email}</p>
          <p><strong>Position:</strong> ${application.jobTitle}</p>
          <p><strong>Note:</strong> ${application.note || 'No note provided'}</p>
          <div style="margin-top: 30px; text-align: center;">
            <a href="${application.resume}" style="background-color: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-right: 10px;">View Resume</a>
            <a href="${process.env.FRONTEND_URL || 'https://gotripo.tech'}/admin/applications" style="background-color: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Review in Dashboard</a>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await currentTransporter.sendMail(mailOptions);
    console.log(`✅ Admin notification sent for application from ${application.email}`);
  } catch (error) {
    console.error("❌ Failed to send admin notification:", error.message);
  }
}

/**
 * Send Weekly Travel Digest (Interesting updates)
 */
async function sendWeeklyTravelDigest(email, name) {
  console.log(`📧 Attempting to send Weekly Digest to: ${email}`);
  const currentTransporter = await getTransporter();
  if (!currentTransporter) return;

  const firstName = name ? name.split(" ")[0] : "Traveler";
  
  const mailOptions = {
    from: `"GoTripo Insider" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Weekend Wanderlust: Your Weekly Travel Digest 🏔️`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; color: #1e293b;">
        <div style="background-color: #10b981; padding: 40px 20px; text-align: center; background-image: linear-gradient(135deg, #10b981 0%, #059669 100%);">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Weekly Wanderlust</h1>
          <p style="color: #d1fae5; margin-top: 5px; font-size: 14px;">Curated for ${firstName}</p>
        </div>
        
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #475569; margin-bottom: 25px;">
            Ready for your next break? Here are some top-rated destinations and hidden gems trending this week on GoTripo.
          </p>
          
          <div style="border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; margin-bottom: 20px;">
            <div style="padding: 15px;">
              <span style="background-color: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 800; text-transform: uppercase;">Trending</span>
              <h3 style="margin: 10px 0 5px; color: #0f172a;">Spiritual Sojourn in Varanasi</h3>
              <p style="margin: 0; color: #64748b; font-size: 13px;">Experience the mesmerizing Ganga Aarti and ancient ghats with our curated 3-day itinerary.</p>
            </div>
          </div>
          
          <div style="border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; margin-bottom: 20px;">
            <div style="padding: 15px;">
              <span style="background-color: #fef9c3; color: #854d0e; padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 800; text-transform: uppercase;">Hidden Gem</span>
              <h3 style="margin: 10px 0 5px; color: #0f172a;">The French Quarters of Puducherry</h3>
              <p style="margin: 0; color: #64748b; font-size: 13px;">Cycle through colorful streets and enjoy artisanal cafes in South India's coastal paradise.</p>
            </div>
          </div>
          
          <div style="margin-top: 30px; padding: 20px; background-color: #eff6ff; border-radius: 12px; border: 1px dashed #3b82f6; text-align: center;">
             <p style="margin: 0; font-weight: 600; color: #1e40af;">New Feature: Multi-City Date Selection!</p>
             <p style="margin: 5px 0 15px; font-size: 12px; color: #60a5fa;">Now plan complex trips with individual dates for every city stop.</p>
             <a href="${process.env.FRONTEND_URL || 'https://gotripo.tech'}/planner-multi" style="color: #3b82f6; font-size: 13px; font-weight: 700; text-decoration: none;">Try it now →</a>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'https://gotripo.tech'}/explore" style="background-color: #10b981; color: #ffffff; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block;">
              Explore More Destinations
            </a>
          </div>
        </div>
        
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9;">
          <p>You're receiving this because you're a valued member of GoTripo. <br/> To unsubscribe from these weekly updates, <a href="#" style="color: #64748b;">click here</a>.</p>
        </div>
      </div>
    `,
  };

  try {
    await currentTransporter.sendMail(mailOptions);
    console.log(`✅ Weekly Digest sent to ${email}`);
  } catch (error) {
    console.error(`❌ Failed to send Weekly Digest to ${email}:`, error.message);
  }
}

/**
 * Send an interesting travel fact/tip to a user
 */
async function sendInterestingFactEmail(email, name, fact, destination) {
  console.log(`📧 Attempting to send interesting fact to: ${email}`);
  const currentTransporter = await getTransporter();
  if (!currentTransporter) return;

  const firstName = name ? name.split(" ")[0] : "Traveler";
  
  const mailOptions = {
    from: `"GoTripo Discovery" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Did you know? A little travel magic for you, ${firstName} ✨`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; color: #1e293b;">
        <div style="background-color: #8b5cf6; padding: 40px 20px; text-align: center; background-image: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Discovery Moment</h1>
        </div>
        
        <div style="padding: 30px;">
          <h2 style="font-size: 20px; color: #0f172a; margin-top: 0;">Hi ${firstName},</h2>
          <p style="font-size: 16px; color: #475569; line-height: 1.6;">
            We thought you might enjoy this little piece of travel inspiration today.
          </p>
          
          <div style="margin: 30px 0; padding: 25px; background-color: #f5f3ff; border-radius: 12px; border-left: 4px solid #8b5cf6;">
            <p style="margin: 0; font-size: 18px; color: #1e1b4b; font-style: italic; line-height: 1.5;">
              "${fact}"
            </p>
            ${destination ? `<p style="margin: 15px 0 0; font-size: 14px; color: #6d28d9; font-weight: 700;">📍 Featured Destination: ${destination}</p>` : ''}
          </div>
          
          <p style="font-size: 14px; color: #64748b;">
            Travel isn't just about the destination, it's about the stories we find along the way. Where will your next story begin?
          </p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'https://gotripo.tech'}/explore" style="background-color: #8b5cf6; color: #ffffff; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block;">
              Explore More with GoTripo
            </a>
          </div>
        </div>
        
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9;">
          <p>&copy; 2026 GoTripo Discoveries. Exploring the Extraordinary.</p>
        </div>
      </div>
    `,
  };

  try {
    await currentTransporter.sendMail(mailOptions);
    console.log(`✅ Interesting fact email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Failed to send interesting fact email to ${email}:`, error.message);
  }
}

module.exports = { 
  sendUpdateEmail, 
  sendWelcomeEmail, 
  sendLoginNotificationEmail,
  sendJobApplicationNotification,
  sendWeeklyTravelDigest,
  sendInterestingFactEmail,
  sendTestEmail
};