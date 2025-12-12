// backend/controllers/authController.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendMail } = require("../config/mail");
const { generateNumericOtp } = require("../utils/generateOtp"); // you referenced this util earlier
const bcrypt = require("bcryptjs");

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || "secretkey", {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// REGISTER (student) — password optional / not required for OTP-only flow
exports.registerStudent = async (req, res) => {
  try {
    let { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    email = email.toLowerCase().trim();
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({
      name,
      email,
      password: null,
      role: "student",
      isApproved: false,
    });

    return res.status(201).json({
      message: "Registered successfully. Wait for admin approval.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// NOTE: /login (password-based) intentionally removed in OTP-only setup.
// If you still want to keep password login as fallback, we can re-add it.


// REQUEST OTP (send code to registered email)
exports.requestOtp = async (req, res) => {
  try {
    let { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    email = email.toLowerCase().trim();

    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Do not auto-create students here — require register first
      return res.status(404).json({ message: "User not found" });
    }

    const digits = Number(process.env.OTP_DIGITS || 6);
    const expiresMinutes = Number(process.env.OTP_EXPIRES_MINUTES || 10);

    const otp = generateNumericOtp(digits);
    const otpExpires = new Date(Date.now() + expiresMinutes * 60 * 1000);

    // Save OTP (store plain OTP or hashed — storing plain here is simpler but less secure;
    // if you prefer hashing: bcrypt.hash(otp, salt) and compare via bcrypt.compare)
    // We'll store as plain string for simplicity since earlier code used that; if you want hashed OTP, tell me.
    user.otp = String(otp).trim();
    user.otpExpires = otpExpires;
    await user.save();

    // Compose email
    const subject = `Your NDR login code`;
    const html = `
      <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
        <h2>NDR EDU-TECH — Login code</h2>
        <p>Your one-time login code is:</p>
        <p style="font-size: 28px; font-weight:700; letter-spacing:6px;">${otp}</p>
        <p>This code expires in ${expiresMinutes} minute(s). If you did not request this code, ignore this email.</p>
      </div>
    `;

    try {
      await sendMail({ to: user.email, subject, html });
    } catch (mailErr) {
      console.error("Failed to send OTP email:", mailErr);
      // we still continue and return success so we don't reveal SMTP details
    }

    return res.json({ message: "OTP sent if the email is registered (check your inbox)." });
  } catch (err) {
    console.error("requestOtp error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// VERIFY OTP
exports.verifyOtp = async (req, res) => {
  try {
    let { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and otp are required" });
    email = email.toLowerCase().trim();

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    if (!user.otp || !user.otpExpires) {
      return res.status(401).json({ message: "No OTP requested" });
    }

    const now = new Date();
    if (user.otp !== String(otp).trim() || new Date(user.otpExpires) < now) {
      return res.status(401).json({ message: "Invalid or expired OTP" });
    }

    // success — clear OTP and issue token
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    if (user.role === "student" && !user.isApproved) {
      return res.status(403).json({ message: "Your account is not approved yet. Contact admin." });
    }

    const token = generateToken(user.id, user.role);

    return res.json({
      message: "OTP verified. Login successful",
      token,
      user: {
        id: user.id, name: user.name, email: user.email, role: user.role, isApproved: user.isApproved
      },
    });
  } catch (err) {
    console.error("verifyOtp error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
