const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HeartSync</title>
</head>
<body style="margin:0;padding:0;background:#0d0d1a;font-family:Inter,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <!-- Logo -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-flex;align-items:center;gap:8px;">
        <div style="width:40px;height:40px;background:linear-gradient(135deg,#FF4458,#a855f7);border-radius:12px;display:inline-flex;align-items:center;justify-content:center;">
          <span style="color:white;font-size:18px;">♥</span>
        </div>
        <span style="color:white;font-size:24px;font-weight:900;">HeartSync</span>
      </div>
    </div>
    <!-- Card -->
    <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:24px;padding:40px;">
      ${content}
    </div>
    <!-- Footer -->
    <div style="text-align:center;margin-top:24px;">
      <p style="color:rgba(255,255,255,0.2);font-size:12px;">© 2024 HeartSync. All rights reserved.</p>
      <p style="color:rgba(255,255,255,0.2);font-size:12px;">You received this email because you signed up for HeartSync.</p>
    </div>
  </div>
</body>
</html>
`;

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.SMTP_USER) {
    console.log(`[Email skipped - no SMTP config] To: ${to} | Subject: ${subject}`);
    return;
  }
  try {
    await transporter.sendMail({
      from: `"HeartSync 💕" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("Email send error:", err.message);
  }
};

const sendWelcomeEmail = (to, name) =>
  sendEmail({
    to,
    subject: "Welcome to HeartSync 💕",
    html: baseTemplate(`
      <h1 style="color:white;font-size:28px;font-weight:900;margin:0 0 8px;">Welcome, ${name}! 🎉</h1>
      <p style="color:rgba(255,255,255,0.5);margin:0 0 24px;">You're now part of HeartSync — where real connections happen.</p>
      <div style="background:linear-gradient(135deg,rgba(255,68,88,0.1),rgba(168,85,247,0.1));border:1px solid rgba(255,68,88,0.2);border-radius:16px;padding:20px;margin-bottom:24px;">
        <p style="color:white;font-weight:700;margin:0 0 8px;">🔥 Get started in 3 steps:</p>
        <p style="color:rgba(255,255,255,0.5);margin:4px 0;">1. Complete your profile with photos</p>
        <p style="color:rgba(255,255,255,0.5);margin:4px 0;">2. Add your interests</p>
        <p style="color:rgba(255,255,255,0.5);margin:4px 0;">3. Start swiping and find your match!</p>
      </div>
      <a href="${process.env.CLIENT_URL}/profile/setup" style="display:block;text-align:center;background:linear-gradient(135deg,#FF4458,#FF6B6B);color:white;font-weight:700;padding:16px;border-radius:50px;text-decoration:none;font-size:16px;">
        Complete My Profile →
      </a>
    `),
  });

const sendMatchEmail = (to, name, matchName) =>
  sendEmail({
    to,
    subject: `💕 You matched with ${matchName}!`,
    html: baseTemplate(`
      <div style="text-align:center;margin-bottom:24px;">
        <div style="font-size:64px;margin-bottom:16px;">💕</div>
        <h1 style="color:white;font-size:28px;font-weight:900;margin:0 0 8px;">It's a Match!</h1>
        <p style="color:rgba(255,255,255,0.5);margin:0;">You and <strong style="color:white;">${matchName}</strong> liked each other!</p>
      </div>
      <a href="${process.env.CLIENT_URL}/matches" style="display:block;text-align:center;background:linear-gradient(135deg,#FF4458,#FF6B6B);color:white;font-weight:700;padding:16px;border-radius:50px;text-decoration:none;font-size:16px;">
        Send a Message →
      </a>
    `),
  });

const sendPasswordResetEmail = (to, resetLink) =>
  sendEmail({
    to,
    subject: "Reset your HeartSync password",
    html: baseTemplate(`
      <h1 style="color:white;font-size:24px;font-weight:900;margin:0 0 8px;">Reset Password 🔐</h1>
      <p style="color:rgba(255,255,255,0.5);margin:0 0 24px;">Click the button below to reset your password. This link expires in 1 hour.</p>
      <a href="${resetLink}" style="display:block;text-align:center;background:linear-gradient(135deg,#FF4458,#FF6B6B);color:white;font-weight:700;padding:16px;border-radius:50px;text-decoration:none;font-size:16px;">
        Reset My Password →
      </a>
      <p style="color:rgba(255,255,255,0.3);font-size:12px;text-align:center;margin-top:16px;">If you didn't request this, ignore this email.</p>
    `),
  });

const sendVerificationEmail = (to, name, verifyLink) =>
  sendEmail({
    to,
    subject: "Verify your HeartSync email",
    html: baseTemplate(`
      <h1 style="color:white;font-size:24px;font-weight:900;margin:0 0 8px;">Verify Your Email ✉️</h1>
      <p style="color:rgba(255,255,255,0.5);margin:0 0 24px;">Hi ${name}, please verify your email to unlock all features.</p>
      <a href="${verifyLink}" style="display:block;text-align:center;background:linear-gradient(135deg,#FF4458,#FF6B6B);color:white;font-weight:700;padding:16px;border-radius:50px;text-decoration:none;font-size:16px;">
        Verify Email →
      </a>
    `),
  });

module.exports = { sendWelcomeEmail, sendMatchEmail, sendPasswordResetEmail, sendVerificationEmail };
