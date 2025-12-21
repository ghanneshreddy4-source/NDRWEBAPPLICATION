// backend/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const { registerStudent, requestOtp, verifyOtp } = require("../controllers/authController");
const User = require("../models/User");

console.log("Auth routes loaded");

router.post("https://ndrwebapplication-1.onrender.com/register", registerStudent);

// OTP endpoints
router.post("https://ndrwebapplication-1.onrender.com/request-otp", requestOtp);
router.post("https://ndrwebapplication-1.onrender.com/verify-otp", verifyOtp);

// debug listing
router.get("https://ndrwebapplication-1.onrender.com/debug/users", async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email", "role", "isApproved", "createdAt"],
      order: [["id", "ASC"]],
    });
    res.json(users);
  } catch (err) {
    console.error("debug/users error:", err);
    res.status(500).json({ message: "debug error" });
  }
});

module.exports = router;
