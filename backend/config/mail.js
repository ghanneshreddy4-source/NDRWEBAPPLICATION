// backend/config/mail.js
const nodemailer = require("nodemailer");

const shouldSendEmail = process.env.SEND_EMAIL !== "false"; // default true

async function createTransport() {
  // If SEND_EMAIL explicitly false -> return a fake transport (no network)
  if (!shouldSendEmail) {
    return {
      sendMail: async (opts) => {
        console.log("[MAIL] SEND_EMAIL=false — simulated send, mail contents:");
        console.log(opts);
        return { simulated: true };
      },
    };
  }

  // If SMTP host provided -> use it (production / configured SMTP)
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true" || false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Otherwise (no SMTP_HOST) -> create an Ethereal test account for dev
  console.log("[MAIL] No SMTP_HOST configured — creating Ethereal test account (dev only)");
  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  transporter._ethereal = true; // flag so calling code can log preview URL
  transporter._etherealAccount = testAccount;
  return transporter;
}

const sendMail = async ({ to, subject, html, text }) => {
  const transporter = await createTransport();
  const from = process.env.SMTP_FROM || "NDR EDU-TECH <no-reply@ndr.com>";

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text: text || "",
    html: html || `<pre>${text}</pre>`,
  });

  // If Ethereal, log preview URL
  if (transporter._ethereal && info && info.messageId) {
    try {
      const preview = nodemailer.getTestMessageUrl(info);
      console.log(`[MAIL] Ethereal preview URL: ${preview}`);
    } catch (e) {}
  }

  // If simulated -> info.simulated true (see above)
  return info;
};

module.exports = { sendMail, createTransport };
