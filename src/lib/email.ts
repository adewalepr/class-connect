// Secure server-side email sender using Nodemailer and dynamic imports
import { createServerFn } from "@tanstack/react-start";

export interface EmailPayload {
  email: string;
  name: string;
  username: string;
  password: string;
}

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

  // Bypass Vite static string replacement at build-time to guarantee runtime variables are read!
  const getEnv = (key: string) => {
    if (typeof process !== "undefined" && process.env) {
      return process.env[key] || "";
    }
    return "";
  };

  // DEBUG LOGGING TO CATCH RENDER ENV ISSUES
  console.log("🕵️ SERVER DIAGNOSTICS: Inspecting Render Environment...");
  console.log("process type:", typeof process);
  console.log("process.env exists?", typeof process !== "undefined" && !!process.env);
  if (typeof process !== "undefined" && process.env) {
    const keys = Object.keys(process.env).filter(k => k.includes("SMTP") || k.includes("FIREBASE"));
    console.log("Found related ENV keys on Render:", keys);
    console.log("Raw SMTP_USER value length:", (process.env["SMTP_USER"] || "").length);
  }

  // Resolve SMTP configuration dynamically to avoid SSR module cache issues
  const currentSmtpConfig = {
    host: getEnv("SMTP_HOST") || "smtp.gmail.com",
    port: parseInt(getEnv("SMTP_PORT") || "587"),
    secure: getEnv("SMTP_SECURE") === "true",
    auth: {
      user: getEnv("SMTP_USER"),
      pass: getEnv("SMTP_PASS")
    },
    // Force Node.js to use IPv4 instead of IPv6 to prevent ENETUNREACH errors on Render/Vercel
    family: 4,
    // Fail fast in 3 seconds to prevent backend hanging if Render firewall drops connections
    connectionTimeout: 3000
  };


  // Removed Firebase Trigger Email block since the extension is not installed.

  // OPTION 1: Resend HTTP API (Bypasses Render SMTP Block)
  const RESEND_API_KEY = getEnv("RESEND_API_KEY");
  if (RESEND_API_KEY) {
    try {
      console.log(`🚀 Sending email via Resend API to ${to}...`);
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          // Note: To send from your own domain, you must verify it in Resend.
          // onboarding@resend.dev only allows sending to the email you signed up with.
          from: getEnv("RESEND_FROM_EMAIL") || "Attendify <onboarding@resend.dev>",
          to: [to],
          subject: subject,
          html: html
        })
      });

      const data = await res.json();
      if (res.ok) {
        console.log(`✅ Email delivered successfully via Resend to ${to}! ID: ${data.id}`);
        return true;
      } else {
        console.error("❌ Resend API Error:", data);
        return false;
      }
    } catch (err) {
      console.error("❌ Failed to deliver email via Resend API:", err);
      return false;
    }
  }

  const isSmtpConfigured = !!currentSmtpConfig.auth.user && 
                           currentSmtpConfig.auth.user !== "your_university_noreply_email@gmail.com" &&
                           currentSmtpConfig.auth.user !== "";

  if (!isSmtpConfigured) {
    console.log("ℹ️ SMTP is not configured or using default placeholders. Email logged in console successfully (Offline Mode).");
    console.log(`\n======================================================`);
    console.log(`✉️ [EMAIL EMULATOR LOG]`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Credentials: ${fallbackLog}`);
    console.log(`======================================================\n`);
    return true;
  }

  try {
    const dnsPromises = await import("node:dns/promises");
    const { address } = await dnsPromises.lookup(currentSmtpConfig.host, { family: 4 });
    console.log(`Resolved SMTP host ${currentSmtpConfig.host} to IPv4: ${address}`);
    
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      ...currentSmtpConfig,
      host: address,
      tls: {
        servername: currentSmtpConfig.host
      }
    });
    
    await transporter.sendMail({
      from: `"Attendify Support" <${currentSmtpConfig.auth.user}>`,
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
