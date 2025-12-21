// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const {
  getMe,
  updateProfile,
  changePassword,
  getMyResults,
} = require("../controllers/userController");

// Logged in user info
router.get("https://ndrwebapplication-1.onrender.com/me", protect, getMe);

// Update profile
router.put("https://ndrwebapplication-1.onrender.com/me", protect, updateProfile);

// Change password
router.put("https://ndrwebapplication-1.onrender.com/change-password", protect, changePassword);

// My results
router.get("https://ndrwebapplication-1.onrender.com/my-results", protect, getMyResults);

module.exports = router;
