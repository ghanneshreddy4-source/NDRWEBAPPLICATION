const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { sendMail } = require("../config/mail");
const { generateNumericOtp } = require("../utils/generateOtp");

// JWT helper
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || "secretkey", {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

/* ============================================================
   REGISTER NEW STUDENT (Manual approval required by admin)
   ============================================================ */
exports.registerStudent = async (req, res) => {
  try {
    let { name, email, password, selectedCourse } = req.body;
    console.log("📥 Incoming register body:", req.body);

    if (!name || !email || !password || !selectedCourse) {
      return res.status(400).json({
        message: "Name, email, password and course selection are required.",
      });
    }

    email = email.toLowerCase().trim();
    selectedCourse = parseInt(selectedCourse, 10);
    if (isNaN(selectedCourse)) {
      return res.status(400).json({ message: "Invalid course ID." });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "student",
      isApproved: false,
      selectedCourse,
      allowedCourses: [selectedCourse], // integer array
    });

    console.log("✅ User created successfully:", {
      id: user.id,
      selectedCourse: user.selectedCourse,
      allowedCourses: user.allowedCourses,
    });

    return res.status(201).json({
      message: "Registered successfully. Wait for admin approval.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        selectedCourse: user.selectedCourse,
        allowedCourses: user.allowedCourses,
      },
    });
  } catch (err) {
    console.error("❌ registerStudent error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.loginWithPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required." });

    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(404).json({ message: "User not found." });

    if (!user.isApproved)
      return res.status(403).json({ message: "Account pending admin approval." });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: "Incorrect password." });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({ user, token });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ message: "Server error during login." });
  }
};

/* ============================================================
   REQUEST OTP (Only for registered users)
   ============================================================ */
exports.requestOtp = async (req, res) => {
  try {
    let { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required." });

    email = email.toLowerCase().trim();
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found. Please register first." });
    }

    const digits = Number(process.env.OTP_DIGITS || 6);
    const expiresMinutes = Number(process.env.OTP_EXPIRES_MINUTES || 10);
    const otp = generateNumericOtp(digits);
    const otpExpires = new Date(Date.now() + expiresMinutes * 60 * 1000);

    user.otp = String(otp).trim();
    user.otpExpires = otpExpires;
    await user.save();

    const subject = `Your NDR EdTech Login Code`;
    const html = `
      <div style="font-family: system-ui, sans-serif;">
        <h2>NDR EdTech — Login Code</h2>
        <p>Your one-time login code is:</p>
        <p style="font-size: 28px; font-weight:700; letter-spacing:6px;">${otp}</p>
        <p>This code expires in ${expiresMinutes} minute(s).<br>
        If you did not request this code, please ignore this email.</p>
      </div>
    `;

    try {
      await sendMail({ to: user.email, subject, html });
    } catch (mailErr) {
      console.error("⚠️ Failed to send OTP email:", mailErr);
    }

    return res.json({ message: "OTP sent to your registered email. Check your inbox." });
  } catch (err) {
    console.error("❌ requestOtp error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* ============================================================
   VERIFY OTP (Login)
   ============================================================ */
exports.verifyOtp = async (req, res) => {
  try {
    let { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP are required." });

    email = email.toLowerCase().trim();
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials." });

    if (!user.otp || !user.otpExpires)
      return res.status(401).json({ message: "No OTP requested for this email." });

    const now = new Date();
    if (user.otp !== String(otp).trim() || new Date(user.otpExpires) < now)
      return res.status(401).json({ message: "Invalid or expired OTP." });

    // ✅ Clear OTP
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    // Block unapproved students
    if (user.role === "student" && !user.isApproved) {
      return res.status(403).json({
        message: "Your account is not approved yet. Please contact admin.",
      });
    }

    const token = generateToken(user.id, user.role);

    // ✅ Normalize selectedCourse and allowedCourses
    const selected = user.selectedCourse || null;
    let allowed = [];

    if (user.allowedCourses) {
      if (Array.isArray(user.allowedCourses)) {
        allowed = user.allowedCourses;
      } else if (typeof user.allowedCourses === "string") {
        // convert from Postgres array string to JS array
        allowed = user.allowedCourses
          .replace(/[{}]/g, "")
          .split(",")
          .map((n) => parseInt(n.trim(), 10))
          .filter((n) => !isNaN(n));
      }
    }

    // fallback: include selectedCourse if allowedCourses is empty
    if (!Array.isArray(allowed) || allowed.length === 0) {
      if (selected) allowed = [selected];
    }

    console.log("✅ Normalized courses:", { selected, allowed });

    // ✅ Return consistent shape
    return res.json({
      message: "OTP verified. Login successful.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        selectedCourse: selected,
        allowedCourses: allowed,
      },
    });
  } catch (err) {
    console.error("❌ verifyOtp error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 🚀 TEMPORARY ADMIN CREATION (run once)
(async () => {
  const User = require("../models/User");

  try {
    // Check if admin already exists
    const existing = await User.findOne({ where: { email: "gr942921@gmail.com" } });

    if (existing) {
      console.log("⚠️ Admin already exists with email gr942921@gmail.com");
    } else {
      const newAdmin = await User.create({
        name: "Ganesh",
        email: "gr942921@gmail.com",
        password: "Gg48774@", // plain password — will be auto-hashed by Sequelize hooks
        role: "admin",
        isApproved: true,
      });

      console.log("✅ Admin user created successfully!");
      console.log({
        id: newAdmin.id,
        email: newAdmin.email,
        role: newAdmin.role,
        isApproved: newAdmin.isApproved,
      });
    }
  } catch (err) {
    console.error("❌ Error creating admin user:", err);
  }
})();

