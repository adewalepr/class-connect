// Secure server-side email sender using Nodemailer and dynamic imports
import { createServerFn } from "@tanstack/react-start";

export interface EmailPayload {
  email: string;
  name: string;
  username: string;
  password: string;
}

// SMTP credentials from environment
const smtpConfig = {
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || ""
  }
};

const isSmtpConfigured = !!process.env.SMTP_USER;

// ----------------------------------------------------
// SECURE SERVER FUNCTIONS (Node-only execution)
// ----------------------------------------------------

export const sendWelcomeEmail = createServerFn({ method: "POST" })
  .handler(async ({ data }: { data: EmailPayload }) => {
    const { email, name, username, password } = data;
    console.log(`✉️ Sending Welcome Email to ${email} (Username: ${username})`);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Attendify</title>
        <style>
          body {
            font-family: 'Inter', -apple-system, sans-serif;
            background-color: #0b0d19;
            color: #ffffff;
            margin: 0;
            padding: 40px 20px;
          }
          .container {
            max-width: 500px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 24px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.4);
            text-align: center;
          }
          .logo {
            font-size: 24px;
            font-weight: 800;
            color: #ffffff;
            margin-bottom: 24px;
            display: inline-flex;
            align-items: center;
            letter-spacing: -0.5px;
          }
          .logo span {
            color: #5b4bd6;
          }
          h1 {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
          }
          p {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.7);
            line-height: 1.6;
            margin-top: 0;
          }
          .credential-box {
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 16px;
            padding: 24px;
            margin: 32px 0;
            text-align: left;
          }
          .credential-row {
            margin-bottom: 16px;
          }
          .credential-row:last-child {
            margin-bottom: 0;
          }
          .label {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: rgba(255, 255, 255, 0.4);
            margin-bottom: 4px;
            font-weight: 600;
          }
          .value {
            font-size: 18px;
            font-weight: 700;
            color: #9f8fff;
            font-family: monospace;
          }
          .btn {
            display: inline-block;
            background: linear-gradient(135deg, #5b4bd6 0%, #9f8fff 100%);
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 14px;
            font-size: 14px;
            font-weight: 600;
            margin-top: 16px;
            box-shadow: 0 8px 24px rgba(91, 75, 214, 0.35);
          }
          .footer {
            margin-top: 40px;
            font-size: 11px;
            color: rgba(255, 255, 255, 0.4);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">Attend<span>ify</span></div>
          <h1>Welcome aboard, ${name}!</h1>
          <p>Your university class attendance profile has been created successfully. Below are your secure, system-generated credentials to access the Attendify portal.</p>
          
          <div class="credential-box">
            <div class="credential-row">
              <div class="label">Generated Username</div>
              <div class="value">${username}</div>
            </div>
            <div class="credential-row">
              <div class="label">Secure Password</div>
              <div class="value">${password}</div>
            </div>
          </div>
          
          <p>Please keep these login credentials private. You can log in using either your matriculation email or your generated username.</p>
          
          <a href="#" class="btn">Access Dashboard</a>
          
          <div class="footer">
            Attendify System Notification · Please do not reply to this email.
          </div>
        </div>
      </body>
      </html>
    `;

    return await sendMailHelper(email, `Welcome to Attendify! Your Generated Credentials`, htmlContent, `${username} / ${password}`);
  });

export const sendRecoveryEmail = createServerFn({ method: "POST" })
  .handler(async ({ data }: { data: EmailPayload }) => {
    const { email, name, username, password } = data;
    console.log(`✉️ Sending Password Recovery Email to ${email}`);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Attendify Password Reset</title>
        <style>
          body {
            font-family: 'Inter', -apple-system, sans-serif;
            background-color: #0b0d19;
            color: #ffffff;
            margin: 0;
            padding: 40px 20px;
          }
          .container {
            max-width: 500px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 24px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.4);
            text-align: center;
          }
          .logo {
            font-size: 24px;
            font-weight: 800;
            color: #ffffff;
            margin-bottom: 24px;
            display: inline-flex;
            align-items: center;
            letter-spacing: -0.5px;
          }
          .logo span {
            color: #5b4bd6;
          }
          h1 {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
          }
          p {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.7);
            line-height: 1.6;
            margin-top: 0;
          }
          .credential-box {
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 16px;
            padding: 24px;
            margin: 32px 0;
            text-align: left;
          }
          .credential-row {
            margin-bottom: 16px;
          }
          .credential-row:last-child {
            margin-bottom: 0;
          }
          .label {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: rgba(255, 255, 255, 0.4);
            margin-bottom: 4px;
            font-weight: 600;
          }
          .value {
            font-size: 18px;
            font-weight: 700;
            color: #9f8fff;
            font-family: monospace;
          }
          .btn {
            display: inline-block;
            background: linear-gradient(135deg, #5b4bd6 0%, #9f8fff 100%);
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 14px;
            font-size: 14px;
            font-weight: 600;
            margin-top: 16px;
            box-shadow: 0 8px 24px rgba(91, 75, 214, 0.35);
          }
          .footer {
            margin-top: 40px;
            font-size: 11px;
            color: rgba(255, 255, 255, 0.4);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">Attend<span>ify</span></div>
          <h1>Password Reset Requested</h1>
          <p>Hello ${name}, you requested a password recovery for your Attendify account. The system has automatically generated a NEW secure password for your profile.</p>
          
          <div class="credential-box">
            <div class="credential-row">
              <div class="label">Your Username</div>
              <div class="value">${username}</div>
            </div>
            <div class="credential-row">
              <div class="label">NEW Generated Password</div>
              <div class="value">${password}</div>
            </div>
          </div>
          
          <p>Please log in using this new password and change it in your settings if desired.</p>
          
          <a href="#" class="btn">Access Dashboard</a>
          
          <div class="footer">
            Attendify System Notification · Please do not reply to this email.
          </div>
        </div>
      </body>
      </html>
    `;

    return await sendMailHelper(email, `Attendify Password Recovery — New Credentials`, htmlContent, `${username} / ${password}`);
  });

// ----------------------------------------------------
// COMMON SMTP TRANSPORTER HELPER (Node-only)
// ----------------------------------------------------

async function sendMailHelper(to: string, subject: string, html: string, fallbackLog: string): Promise<boolean> {
  if (typeof window !== "undefined") return false;

  // Print in the server console for perfect developer visibility
  console.log(`\n======================================================`);
  console.log(`✉️ [EMAIL EMULATOR LOG]`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Credentials: ${fallbackLog}`);
  console.log(`======================================================\n`);

  // Write to Firestore "mail" collection to support the official Firebase "Trigger Email" Extension!
  try {
    const { isLiveFirebase, db } = await import("./firebase");
    if (isLiveFirebase && db) {
      const { collection, addDoc } = await import("firebase/firestore");
      await addDoc(collection(db, "mail"), {
        to,
        message: {
          subject,
          html
        },
        createdAt: new Date().toISOString()
      });
      console.log(`🔥 Firestore "Trigger Email" document created successfully for ${to}!`);
    }
  } catch (err) {
    console.error("⚠️ Failed to create Firestore Trigger Email document:", err);
  }

  const isSmtpConfigured = !!smtpConfig.auth.user && smtpConfig.auth.user !== "your_university_noreply_email@gmail.com";

  if (!isSmtpConfigured) {
    console.log("ℹ️ SMTP is not configured or using default placeholders. Email logged in console successfully (Offline Mode).");
    return true;
  }

  try {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport(smtpConfig);
    
    await transporter.sendMail({
      from: `"Attendify" <${smtpConfig.auth.user}>`,
      to,
      subject,
      html
    });

    console.log(`✅ Branded email delivered successfully to ${to}!`);
    return true;
  } catch (err) {
    console.error("❌ Failed to deliver email via SMTP:", err);
    return false;
  }
}
