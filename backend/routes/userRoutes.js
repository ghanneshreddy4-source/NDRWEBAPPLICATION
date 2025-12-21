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
router.get("/me", protect, getMe);

// Update profile
router.put("/me", protect, updateProfile);

// Change password
router.put("/change-password", protect, changePassword);

// My results
router.get("/my-results", protect, getMyResults);

module.exports = router;
